import {
    Controller, Post, Req, Res, HttpStatus, UseGuards
  } from '@nestjs/common';
  import { EnquiryService } from './enquiry.service';
  import { Request, Response } from 'express';
import { RateLimitGuard } from 'libs/common/guard/rate-limit.guard';
  
  @Controller('enquiries')
  export class EnquiryController {
    constructor(private readonly enquiryService: EnquiryService) {}
  
  
    @UseGuards(RateLimitGuard)
    @Post('contact')
    async createContact(
      @Req() req: Request,
      @Res() res: Response

    ) {
      return this.enquiryService.createEnquiry(req, 'contact', res);
    }
  
  
    @UseGuards(RateLimitGuard)
    @Post('custom-order')
    async createCustomOrder(
      @Req() req: Request,
      @Res() res: Response
    ) {
      return this.enquiryService.createEnquiry(req, 'custom-order', res);
    }
  
    
  }
  