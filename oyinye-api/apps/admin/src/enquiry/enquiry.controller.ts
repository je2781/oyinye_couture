import {
    Controller, Get, Post, Patch, Delete, Param,
    Body, Query, Req, Res, UseGuards
  } from '@nestjs/common';
  import { EnquiryService } from './enquiry.service';
  import { Request, Response } from 'express';
import { RateLimitGuard } from 'libs/common/guard/rate-limit.guard';
import { JwtGuard } from 'libs/common/guard';
  
  @Controller('enquiries')
  @UseGuards(JwtGuard)
  export class EnquiryController {
    constructor(private readonly enquiryService: EnquiryService) {}
  
    @UseGuards(RateLimitGuard)
    @Get(':pageSize')
    async getEnquiries(
      @Req() req: Request,
      @Param('pageSize') pageSize: string,
      @Query('page') page: string,
      @Res() res: Response
    ) {
      return this.enquiryService.getEnquiries(req, res,  +pageSize, +page || 1);
    }
  
  
    @UseGuards(RateLimitGuard)
    @Patch('update/:id')
    async updateEnquiry(
      @Req() req: Request,
      @Param('id') id: string,
      @Res() res: Response
    ) {
      return this.enquiryService.updateEnquiry(req, res, id);
    }
  
    @Delete('delete/:id')
    async deleteEnquiry(
      @Param('id') id: string,
      @Res() res: Response
    ) {
      return this.enquiryService.deleteEnquiry(id, res);
    }

    @Post('send-reminder')
    async sendAppointmentReminder(@Req() req: Request){
      return this.enquiryService.sendAppointmentReminder(req);
    }
  }
  