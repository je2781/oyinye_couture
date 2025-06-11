import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Body,
  UseGuards,
} from "@nestjs/common";
import { Request, Response } from "express";
import { OrderService } from "./order.service";
import { JwtGuard } from "@app/common";
import { Csrf } from "ncsrf";

@Controller("api/orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtGuard)
  @Csrf()
  @Post("update/transaction-status")
  async updateTransactionStatus(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: any
  ) {
    return this.orderService.handlePostRequest(
      req,
      res,
      body,
      "transaction-status"
    );
  }

  @UseGuards(JwtGuard)
  @Csrf()
  @Post()
  async updateOrder(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: any
  ) {
    return this.orderService.handlePostRequest(req, res, body);
  }
}
