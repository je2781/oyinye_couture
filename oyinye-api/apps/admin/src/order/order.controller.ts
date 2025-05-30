import {
    Controller,
    Get,
    Post,
    Req,
    Res,
    Param,
    Query,
    Body,
    UseGuards
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  import { OrderService } from './order.service';
import { RateLimitGuard } from 'libs/common/guard/rate-limit.guard';
import { JwtGuard } from 'libs/common/guard';
  
  @Controller('orders')
  @UseGuards(RateLimitGuard)
  @UseGuards(JwtGuard)
  export class OrderController {
    constructor(private readonly orderService: OrderService) {}
  
    @Get(':perPage')
    async get(
      @Req() req: Request,
      @Res() res: Response,
      @Param('perPage') perPage: string,
      @Query('page') page: string,
    ) {
      return this.orderService.getOrders(+page || 1, +perPage || 10, res);
    }
  
    @Post(':orderId/reminder')
    async sendCartReminder(
      @Req() req: Request,
      @Res() res: Response,
      @Body() body: any,
      @Param('orderId') orderId: string
    ) {
      return this.orderService.handlePostRequest(orderId, req, res, body, 'reminder');
    }
  
    @Post(':orderId/payment-status')
    async updateOrderPaymentStatus(
      @Req() req: Request,
      @Res() res: Response,
      @Body() body: any,
      @Param('orderId') orderId: string
    ) {
      return this.orderService.handlePostRequest(orderId, req, res, body, 'payment-status');
    }
  
    @Post(':orderId/payment-request')
    async sendOrderPaymentRequest(
      @Req() req: Request,
      @Res() res: Response,
      @Body() body: any,
      @Param('orderId') orderId: string
    ) {
      return this.orderService.handlePostRequest(orderId, req, res, body, 'payment-request');
    }
  
  }
  