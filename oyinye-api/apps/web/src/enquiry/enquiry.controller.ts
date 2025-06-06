import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { EnquiryService } from "./enquiry.service";
import { Request, Response } from "express";
import { JwtGuard } from "@app/common";
import { Csrf } from "ncsrf";

@Controller("api/enquiries")
export class EnquiryController {
  constructor(private readonly enquiryService: EnquiryService) {}

  @UseGuards(JwtGuard)
  @Csrf()
  @Post("contact")
  async createContact(@Req() req: Request, @Res() res: Response) {
    return this.enquiryService.createEnquiry(req, "contact", res);
  }

  @UseGuards(JwtGuard)
  @Csrf()
  @Post("custom-order")
  async createCustomOrder(@Req() req: Request, @Res() res: Response) {
    return this.enquiryService.createEnquiry(req, "custom-order", res);
  }
}
