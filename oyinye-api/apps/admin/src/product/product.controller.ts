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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ProductService } from "./product.service";
import { JwtGuard } from "@app/common";
import { Request, Response } from "express";
import { Csrf } from "ncsrf";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";

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

  @UseInterceptors(AnyFilesInterceptor())
  @Post("new")
  @Csrf()
  @UseGuards(JwtGuard)
  @UseInterceptors(AnyFilesInterceptor({
    storage: diskStorage({
      destination: join(process.cwd(), 'public/uploads'), // Ensure this path exists
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
        cb(null, filename);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async createProduct(@UploadedFiles() files: Express.Multer.File[], @Req() req: Request) {
    return this.productService.createProduct(files, req);
  }

  @Patch(":id")
  @Csrf()
  @UseGuards(JwtGuard)
  @UseInterceptors(AnyFilesInterceptor({
    storage: diskStorage({
      destination: join(process.cwd(), 'public/uploads'),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
        cb(null, filename);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async updateProduct(@Param("id") id: string, @UploadedFiles() files: Express.Multer.File[], @Req() req: Request) {
   
    return this.productService.updateProduct(id, files, req);
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
