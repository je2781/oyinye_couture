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
import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { Product } from "./product.entity";
import { JwtGuard, RateLimitGuard } from "libs/common/guard";

@Controller("products")
@UseGuards(JwtGuard)
@UseGuards(RateLimitGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Patch("update/:id")
  async hideProduct(
    @Param("id") id: string,
    @Query("hide", ParseBoolPipe) hide: boolean,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.productService.hide(id, hide, req, res);
  }

  @Post("new")
  async createProduct(
    @Body() product: Product,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.productService.createProduct(product, req, res);
  }

  @Patch(":id")
  async updateProduct(
    @Param("id") id: string,
    @Body() product: Product,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.productService.updateProduct(id, product, req, res);
  }

  @Get("search")
  GetSearchResults(
    @Query()
    queryParams: { q: string; page: string },
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.productService.getSearchResults(queryParams, req, res);
  }

  @Get()
  getProducts(
    @Query('hidden', ParseBoolPipe) hidden: boolean,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.productService.getProducts(req, res, hidden);
  }
}
