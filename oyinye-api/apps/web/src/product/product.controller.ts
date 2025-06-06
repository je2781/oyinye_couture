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
import { Request, Response } from "express";
import { SearchQueryDto } from "./dto/search-query.dto";
import { ProductParamsDto } from "./dto/product-param.dto";
import { UpdateReviewFeedbackDto } from "./dto/update-review-feedback.dto";
import { CollectionsQueryDto } from "./dto/collections-query.dto";
import { JwtGuard } from "@app/common";
import { Csrf } from "ncsrf";

@Controller("api/products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(":product/:color/:variantId")
  get(
    @Param() params: ProductParamsDto,
    @Query("viewed_p") viewedP: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.productService.get(params, viewedP, req, res);
  }

  @UseGuards(JwtGuard)
  @Csrf()
  @Patch("reviews/likes-dislikes/update")
  updateReview(
    @Res() res: Response,
    @Req() req: Request,
    @Body() body: UpdateReviewFeedbackDto
  ) {
    return this.productService.updateReview(req, res, body);
  }

  @UseGuards(JwtGuard)
  @Csrf()
  @Post(":title/update")
  createReview(
    @Param("title") title: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.productService.createReview(title, req, res);
  }

  @Get("search")
  getSearchResults(
    @Query()
    queryParams: SearchQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.productService.getResults(queryParams, req, res, "search");
  }

  @Get("collections")
  getCollectionsResults(
    @Query()
    queryParams: CollectionsQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.productService.getResults(queryParams, req, res, "collections");
  }

  @Get()
  getProducts(
    @Query("hidden", ParseBoolPipe) hidden: boolean,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.productService.getProducts(req, res, hidden);
  }
}
