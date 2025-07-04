import {
    Controller, Get, Post, Patch, Delete, Param,
    Body, Query, Req, Res, UseGuards
  } from '@nestjs/common';
  import { EnquiryService } from './enquiry.service';
import { Request, Response } from 'express';
import { JwtGuard } from '@app/common';
import { Csrf } from 'ncsrf';
import { MessageFilterDto } from './dto/filter-message.dto';
import { ReminderMessageDto } from './dto/reminder-message.dto';

  
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
    @Body() body: MessageFilterDto,
    @Param("id") id: string,
  ) {
    return this.enquiryService.updateEnquiry(id, body);
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
  async sendAppointmentReminder(@Body() body: ReminderMessageDto, @Req() req: Request) {
    return this.enquiryService.sendAppointmentReminder(req, body);
  }

  }
  