// cart.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Req,
  Res,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { CartService } from "./cart.service";
import { Request, Response } from "express";
import { CreateCartDto } from "./dto";
import { JwtGuard } from "@app/common";
import { Csrf } from "ncsrf";

@Controller("api/products/cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(":id")
  async getCart(@Param("id") id: string, @Res() res: Response) {
    return this.cartService.getCart(id, res);
  }

  @Post("remove")
  @Csrf()
  @UseGuards(JwtGuard)
  async RemoveFromCart(@Req() req: Request, @Res() res: Response) {
    return this.cartService.removeFromCart(req, res);
  }

  @Patch("update")
  @Csrf()
  @UseGuards(JwtGuard)
  async updateCart(@Req() req: Request, @Res() res: Response) {
    return this.cartService.updateCart(req, res);
  }

  @Post()
  @Csrf()
  @UseGuards(JwtGuard)
  async createCart(
    @Body() dto: CreateCartDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.cartService.createCart(dto, req, res);
  }

  @Get("checkouts")
  async checkout(@Req() req: Request, @Res() res: Response) {
    return this.cartService.checkout(req, res);
  }
}
