import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { sanitizeInput } from "libs/common/utils/sanitize";
import { getVisitData } from "libs/common/utils/getVisitData";
import { randomReference } from "libs/common/utils/getHelpers";
import * as argon2 from "argon2";
import { Request, Response } from "express";
import { ClientProxy } from "@nestjs/microservices";
import { ADMIN_SERVICE, AUTH_SERVICE, EMAIL_SERVICE } from "../constants/service";
import { lastValueFrom } from "rxjs";
import { EmailType } from "libs/common/interfaces";
import * as crypto from "crypto";
import { Enquiry } from "./enquiry.entity";
import { User } from "../user/user.entity";


@Injectable()
export class EnquiryService {
  constructor(
    @InjectRepository(Enquiry) private enquiryRepo: Repository<Enquiry>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject(ADMIN_SERVICE) private adminClient: ClientProxy,
    @Inject(EMAIL_SERVICE) private emailClient: ClientProxy,
    @Inject(AUTH_SERVICE) private authClient: ClientProxy,
  ) {}

  async createEnquiry(req: Request, action: string, res: Response) {
    try {
      const {
        email,
        name,
        content,
        country,
        size,
        phone,
        eventDate,
        styles,
        subject,
        message,
      } = req.body;

      const cleanEmail = sanitizeInput(email);
      const cleanName = sanitizeInput(name);
      const cleanContent = sanitizeInput(content);
      const cleanCountry = sanitizeInput(country);
      const cleanPhone = sanitizeInput(phone);
      const cleanDate = sanitizeInput(eventDate);
      const cleanSubject = sanitizeInput(subject);
      const cleanMsg = sanitizeInput(message);

      let user = await this.userRepo.findOne({ where: { email: cleanEmail! } });
      let enquiry: Enquiry;
      let password: string;

      if (!user) {
        const visitId = getVisitData(req);
        password = randomReference();
        const hash = await argon2.hash(password);


        user = this.userRepo.create({
          email: cleanEmail!,
          password: hash,
          first_name: cleanName!.split(" ")[0],
          last_name: cleanName!.split(" ")[1] || cleanName!,
        });

        await this.userRepo.save(user);

        //dispatching user_created job
        await lastValueFrom(this.adminClient.emit("user_created", {
          user,
          access_token: req.cookies['access_token']
        }));
        await lastValueFrom(this.authClient.emit("user_created", {
          user,
          access_token: req.cookies['access_token']
        }));

        //dispatching password creation and verification job
        await lastValueFrom(
          this.emailClient.emit("password_created", {
            email: user.email,
            emailType: EmailType.reminder,
            password,
            access_token: req.cookies['access_token']

          })
        );

        const verifyAccountToken = (await crypto.randomBytes(32)).toString(
          "hex"
        );
        await this.userRepo.update(user.id, {
          verify_token: verifyAccountToken,
          verify_token_expiry_date: new Date(Date.now() + 3600000),
        });
        await lastValueFrom(
          this.emailClient.emit("account_verify", {
            emailType: EmailType.verify_account,
            token: verifyAccountToken,
            access_token: req.cookies['access_token']
          })
        );
      } else {
        user.first_name = cleanName!.split(" ")[0];
        user.last_name = cleanName!.split(" ")[1] || cleanName!;
        await this.userRepo.save(user);
      }

      if (action === "custom-order") {
        //creating new appointment
        enquiry = this.enquiryRepo.create({
          order: {
            styles,
            size,
            residence: cleanCountry,
            phone: cleanPhone,
            eventDate: cleanDate,
            content: cleanContent,
          },
        });
      } else {
        enquiry = this.enquiryRepo.create({
          contact: {
            subject: cleanSubject,
            message: cleanMsg,
          },
        });
      }

      await this.enquiryRepo.save(enquiry);

      //dispatching enquiry_created job
      await lastValueFrom(this.adminClient.emit("enquiry_created", {
        enquiry,
        access_token: req.cookies['access_token']
      }));

      return {
        message: "enquiry created",
        success: true,
      };
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({
        error: e.message,
      });
    }
  }

  
}
