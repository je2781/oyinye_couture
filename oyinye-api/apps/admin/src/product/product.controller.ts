import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ProductService } from "./product.service";
import { JwtGuard } from "@app/common";
import { Product } from "./product.entity";
import { Request, Response } from "express";
import { Csrf } from "ncsrf";

@Controller("api/products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Patch("update/:id")
  @Csrf()
  @UseGuards(JwtGuard)
  async hideProduct(
    @Param("id") id: string,
    @Query("hide", ParseBoolPipe) hide: boolean
  ) {
    return this.productService.hide(id, hide);
  }

  @Post("new")
  @Csrf()
  @UseGuards(JwtGuard)
  async createProduct(@Body() product: Product) {
    return this.productService.createProduct(product);
  }

  @Patch(":id")
  @Csrf()
  @UseGuards(JwtGuard)
  async updateProduct(@Param("id") id: string, @Body() product: Product) {
    return this.productService.updateProduct(id, product);
  }

  @Get()
  getProducts(
    @Query("hidden", ParseBoolPipe) hidden: boolean,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.productService.getProducts(req, res, hidden);
  }

  @Get("search")
  getSearchResults(
    @Query()
    queryParams: { q: string; page: string },
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.productService.getSearchResults(queryParams, req, res);
  }
}
