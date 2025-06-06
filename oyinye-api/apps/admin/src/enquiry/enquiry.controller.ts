import {
    Controller, Get, Post, Patch, Delete, Param,
    Body, Query, Req, Res, UseGuards
  } from '@nestjs/common';
  import { EnquiryService } from './enquiry.service';
import { Request, Response } from 'express';
import { JwtGuard } from '@app/common';
import { Csrf } from 'ncsrf';

  
  @Controller('api/enquiries')
  export class EnquiryController {
    constructor(private readonly enquiryService: EnquiryService){

    }

    @Get(":pageSize")
  async getEnquiries(
    @Param("pageSize") pageSize: string,
    @Query("page") page: string,
    @Res() res: Response
  ) {
    return this.enquiryService.getEnquiries(res, +pageSize, +page || 1);
  }

  @Patch("update/:id")
  @Csrf()
  @UseGuards(JwtGuard)
  async updateEnquiry(
    @Req() req: Request,
    @Param("id") id: string,
    @Res() res: Response
  ) {
    return this.enquiryService.updateEnquiry(req, res, id);
  }

  @Delete("delete/:id")
  @Csrf()
  @UseGuards(JwtGuard)
  async deleteEnquiry(
    @Param("id") id: string,
    @Res() res: Response
  ) {
    return this.enquiryService.deleteEnquiry(id, res);
  }

  @Post("send-reminder")
  @Csrf()
  @UseGuards(JwtGuard)
  async sendAppointmentReminder(@Req() req: Request) {
    return this.enquiryService.sendAppointmentReminder(req);
  }

  }
  