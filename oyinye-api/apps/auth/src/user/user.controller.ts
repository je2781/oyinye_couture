import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { Request, Response } from "express";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtGuard } from "@app/common";
import { Csrf } from "ncsrf";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";

@Controller("api/auth/users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  async getUser(@Param("id") id: string, @Res() res: Response) {
    return this.userService.getUser(id, res);
  }

  @Patch(":id")
  @Csrf()
  @UseGuards(JwtGuard)
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
  async updateUser(
    @Param("id") id: string,
    @Req() req: Request,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() user: UpdateUserDto
  ) {
    return this.userService.updateUser(req, id, files, user);
  }
}
