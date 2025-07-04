import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { EnquiryService } from "./enquiry.service";
import { Request, Response } from "express";
import { JwtGuard } from "@app/common";
import { CreateEnquiryDto } from "./dto/create-enq.dto";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { Csrf } from "ncsrf";

@Controller("api/enquiries")
export class EnquiryController {
  constructor(private readonly enquiryService: EnquiryService) {}

  @UseGuards(JwtGuard)
  @Csrf()
  @Post("contact")
  async createContact(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateEnquiryDto
  ) {
    return this.enquiryService.createEnquiry(req, "contact", res, body);
  }

  @UseGuards(JwtGuard)
  @Csrf()
  @Post("custom-order")
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: join(process.cwd(), "public/uploads"),
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    })
  )
  async createCustomOrder(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateEnquiryDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.enquiryService.createEnquiry(
      req,
      "custom-order",
      res,
      body,
      files
    );
  }
}
