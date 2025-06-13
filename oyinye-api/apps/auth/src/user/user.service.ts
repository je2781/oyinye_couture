import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";
import { Request, Response } from "express";
import { sanitizeInput } from "libs/common/utils/sanitize";
import * as argon from "argon2";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ClientProxy } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import { User } from "../entities/user.entity";
import {
  ADMIN_SERVICE,
  EMAIL_SERVICE,
  WEB_SERVICE,
} from "../constants/service";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject(ADMIN_SERVICE) private adminClient: ClientProxy,
    @Inject(EMAIL_SERVICE) private emailClient: ClientProxy,
    @Inject(WEB_SERVICE) private webClient: ClientProxy
  ) {}

  async getUser(id: string, res: Response) {
    try {
      const user = await this.userRepo.findOneBy({ id });

      if (!user) throw new NotFoundException("user doesn't exit");

      return res.status(200).json({
        success: true,
        userEmail: user.email,
        title: user.is_admin ? "Administrator" : "Guest",
        userId: user.id,
        userName: `${user.first_name} ${user.last_name}`,
        shippingInfo: user.shipping_info ?? "",
        billingInfo: user.billing_info ?? "",
        saveBillingInfo: user.save_billing_info,
        saveShippingInfo: user.save_shipping_info,
      });
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({
        error: e.message || "An unexpected error occurred",
      });
    }
  }

  async updateUser(
    req: Request,
    id: string,
    body: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    try {
      const {
        firstName,
        lastName,
        password,
        enableEmailMarketing = false,
        checkingOut,
        email,
      } = body;

      const cleanEmail = sanitizeInput(email);
      const cleanFirstName = sanitizeInput(firstName);
      const cleanLastName = sanitizeInput(lastName);
      const cleanPass = sanitizeInput(password);

      let user = await this.userRepo.findOneBy({ id });

      if (!user) throw new NotFoundException("user doesn't exist");

      // Update user fields
      if (cleanPass && cleanPass.length > 0) {
        // Hash the passowrd
        const hash = await argon.hash(cleanPass);
        user.password = hash;
      }
      user.enable_email_marketing = enableEmailMarketing;
      user.first_name = cleanFirstName!;
      user.last_name = cleanLastName!;
      if (file && file.fieldname === 'avater') {
        user.avatar = file?.path;
      }
      if (cleanEmail) {
        user.email = cleanEmail;
      }

      const savedUser = await this.userRepo.save(user);

      if (checkingOut) {
        //dispatching password_created job
        await lastValueFrom(
          this.emailClient.emit("password_created", {
            email: user.email,
            password: cleanPass,
            access_token: req.cookies["access_token"],
          })
        );
        //dispatching user_updated job
        await lastValueFrom(
          this.webClient.emit("user_updated", {
            id: user.id,
            data: user,
            access_token: req.cookies["access_token"],
          })
        );
      } else {
        //dispatching user_updated job
        await lastValueFrom(
          this.adminClient.emit("user_updated", {
            id: user.id,
            data: user,
            access_token: req.cookies["access_token"],
          })
        );
      }

      return {
        message: "User data updated successfully",
        success: true,
        savedUser,
      };
    } catch (error) {
      const e = error as Error;
      throw new InternalServerErrorException(
        e.message || "An unexpected error occurred"
      );
    }
  }

  async updateUserDetails(userId: string, data: any) {
    await this.userRepo.update(userId, data);
  }

  async createUser(data: any) {
    await this.userRepo.save(data);
  }
}
