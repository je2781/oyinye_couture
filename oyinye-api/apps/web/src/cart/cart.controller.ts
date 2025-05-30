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
  } from '@nestjs/common';
  import { CartService } from './cart.service';
  import { Request, Response } from 'express';
import { RateLimitGuard } from 'libs/common/guard/rate-limit.guard';
import { CreateCartDto } from './dto';
  
  @Controller('products/cart')
  @UseGuards(RateLimitGuard)
  export class CartController {
    constructor(private readonly cartService: CartService) {}
  
    
    @Get(':id')
    async getCart(@Param('id') id: string, @Res() res: Response) {
      return this.cartService.getCart(id, res);
    }
  
    
    @Post('remove')
    async RemoveFromCart(
      @Req() req: Request,
      @Res() res: Response
    ) {
      return this.cartService.removeFromCart(req, res);
    }
  
    
    @Patch('update')
    async updateCart(
      @Req() req: Request,
      @Res() res: Response
    ) {
      return this.cartService.updateCart(req, res);
    }
  
    
    @Post()
    async createCart(@Body() dto: CreateCartDto, @Req() req: Request,  @Res() res: Response) {
      return this.cartService.createCart(dto, req, res);
    }
  
    
    @Get('checkouts')
    async checkout(@Req() req: Request,  @Res() res: Response) {
      return this.cartService.checkout(req, res);
    }
  }
  