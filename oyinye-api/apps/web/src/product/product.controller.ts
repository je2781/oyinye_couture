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
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ProductService } from "./product.service";
import { Request, Response } from "express";
import { SearchQueryDto } from "./dto/search-query.dto";
import { ProductParamsDto } from "./dto/product-param.dto";
import { UpdateReviewFeedbackDto } from "./dto/update-review-feedback.dto";
import { CollectionsQueryDto } from "./dto/collections-query.dto";
import { JwtGuard } from "@app/common";
import { Csrf } from "ncsrf";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";

@Controller("api/products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(":product/:color/:variantId")
  async get(
    @Param() params: ProductParamsDto,
    @Query("viewed_p") viewedP: string
  ) {
    return this.productService.get(params, viewedP);
  }

  @UseGuards(JwtGuard)
  @Csrf()
  @Patch("reviews/likes-dislikes/update")
  async updateReview(
    @Req() req: Request,
    @Body() body: UpdateReviewFeedbackDto
  ) {
    return this.productService.updateReview(req, body);
  }

  @UseGuards(JwtGuard)
  @Csrf()
  @Post(":title/update")
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: join(process.cwd(), "public/uploads"),
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    })
  )
  async createReview(@Param("title") title: string, @Req() req: Request, @UploadedFiles() files: Express.Multer.File[]) {
    return this.productService.createReview(title, req, files);
  }

  @Get("search")
  async getSearchResults(
    @Query()
    queryParams: SearchQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.productService.getResults(queryParams, req, res, "search");
  }

  @Get("collections")
  async getCollectionsResults(
    @Query()
    queryParams: CollectionsQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.productService.getResults(queryParams, req, res, "collections");
  }

  @Get()
  async getProducts(
    @Query("hidden", ParseBoolPipe) hidden: boolean,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.productService.getProducts(req, res, hidden);
  }

  @Get("cookie/:variantId")
  async setCookie(
    @Res() res: Response,
    @Req() req: Request,
    @Param("variantId") variantId: string
  ) {
    return this.productService.setViewedProductsCookie(req, res, variantId);
  }
}
