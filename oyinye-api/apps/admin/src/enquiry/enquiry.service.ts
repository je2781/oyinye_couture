import {
  Injectable,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Request, Response } from "express";
import { sanitizeInput } from "libs/common/utils/sanitize";
import { lastValueFrom } from "rxjs";
import { ClientProxy } from "@nestjs/microservices";
import { EMAIL_SERVICE } from "../constants/service";
import { Enquiry } from "./enquiry.entity";

@Injectable()
export class EnquiryService {
  constructor(
    @InjectRepository(Enquiry) private enquiryRepo: Repository<Enquiry>,
    @Inject(EMAIL_SERVICE) private emailClient: ClientProxy
  ) {}

  async getEnquiries(
    res: Response,
    pageSize: number,
    page: number
  ) {
    try {
      const [enquiries, count] = await this.enquiryRepo.findAndCount({
        order: { createdAt: "DESC" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        relations: {user: true}
      });

      let updatedEnquiries: any[] = [];

      const currentPage = page;
      const hasPreviousPage = currentPage > 1;
      const hasNextPage = count > currentPage * pageSize;
      const lastPage = Math.ceil(count / pageSize);

      if (enquiries.length === 0) {
        return res.status(200).json({
          hasNextPage,
          hasPreviousPage,
          lastPage,
          currentPage,
          isActivePage: page,
          nextPage: currentPage + 1,
          previousPage: currentPage - 1,
          enquiries,
        });
      }

      for (const enq of enquiries) {
        updatedEnquiries.push({
          ...enq,
          author: {
            full_name: `${enq.user.first_name!} ${enq.user.last_name!}`,
            email: enq.user.email!,
          },
        });
      }

      return res.status(200).json({
        message: "enquiries retrieved",
        hasNextPage,
        hasPreviousPage,
        lastPage,
        currentPage,
        isActivePage: page,
        nextPage: currentPage + 1,
        previousPage: currentPage - 1,
        enquiries: updatedEnquiries,
        success: true,
      });
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({
        error: e.message,
      });
    }
  }

  async updateEnquiry(req: Request, res: Response, id: string) {
    const enquiry = await this.enquiryRepo.findOne({
      where: {
        id,
      },
    });
    if (!enquiry) throw new NotFoundException("Enquiry doesn't exist");

    const { isRead, isUnRead, isBooking, isContact, saved } = req.body;

    if (isBooking) {
      enquiry.order.read = isRead ?? false;
      enquiry.order.unRead = isUnRead ?? true;
      enquiry.order.saved = saved ?? false;
    }

    if (isContact) {
      enquiry.contact.read = isRead ?? false;
      enquiry.contact.unRead = isUnRead ?? true;
      enquiry.contact.saved = saved ?? false;
    }

    await this.enquiryRepo.save(enquiry);
    return { message: "enquiry updated", success: true };
  }

  async deleteEnquiry(id: string, res: Response) {
    await this.enquiryRepo.delete(id);
    return res.status(204).json({ message: "enquiry deleted", success: true });
  }

  async createEnquiry(data: any) {
    await this.enquiryRepo.save(data);
  }

  async sendAppointmentReminder(req: Request) {
    const { message, email, contact, date } = req.body;

    const cleanMsg = sanitizeInput(message);
    const cleanEmail = sanitizeInput(email);
    const cleanContact = sanitizeInput(contact);
    const cleanDate = sanitizeInput(date);

    //dispatching 
    await lastValueFrom(
      this.emailClient.emit("appointment_reminder", {
        email: cleanEmail,
        emailBody: {
          message: cleanMsg,
          contact: cleanContact,
          date: cleanDate,
        },
        access_token: req.cookies['access_token']
      })
    );

    return{
      message: 'reminder sent'
    };
  }
}
