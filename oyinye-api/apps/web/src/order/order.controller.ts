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

@Controller('orders')
@UseGuards(RateLimitGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('update/transaction-status')
  async updateTransactionStatus(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
  ) {
    return this.orderService.handlePostRequest(req, res, body, 'transaction-status');
  }

  @Post()
  async updateOrder(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
  ) {
    return this.orderService.handlePostRequest(req, res, body);
  }
}
