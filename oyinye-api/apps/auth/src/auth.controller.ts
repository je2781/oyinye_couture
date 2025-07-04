import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { GetUser } from "./decorator";
import { Request, Response } from "express";
import { LocalAuthGuard } from "./guard/local.guard";
import { AuthDto } from "./dto/auth.dto";
import { MessagePattern } from "@nestjs/microservices";
import { JwtAuthGaurd } from "./guard";
import { User } from "./entities/user.entity";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @UseGuards(LocalAuthGuard)
  async createSession(
    @GetUser() user: User,
    @Res() res: Response,
    @Req() req: Request
  ) {
    return this.authService.createSession(req, res, user);
  }

  @Post("logout")
  async endSession(@Res() res: Response, @Req() req: Request) {
    return this.authService.endSession(req, res);
  }

  @Post("signup")
  async register(
    @Res() res: Response,
    @Body() body: AuthDto,
    @Req() req: Request
  ) {
    return this.authService.register(res, body, req);
  }

  @Post("new-password")
  async forgotPassword(@Res() res: Response, @Req() req: Request) {
    return this.authService.forgotPassword(req, res);
  }

  @Post("reset")
  async resetPassword(@Res() res: Response, @Req() req: Request) {
    return this.authService.resetPassword(req, res);
  }

  @Get("verify-email/:type/:token")
  async verifyEmail(
    @Req() req: Request,
    @Param() params: { type: string; token: string },
    @Res() res: Response
  ) {
    return this.authService.verifyEmail(params, res, req);
  }

  @MessagePattern("validate_user")
  @UseGuards(JwtAuthGaurd)
  validateUser(@GetUser() user: User) {
    return user;
  }

  @Post("refresh")
  async refresh(@Req() req: Request, @Res() res: Response) {
    return this.authService.refreshToken(req, res);
  }

  @Get("guest-token")
  getGuestToken(@Req() req: Request, @Res() res: Response) {
    return this.authService.getGuestToken(req, res);
  }

  @Get("token")
  getCsrfToken(@Req() req): any {
    return {
      token: req.csrfToken()
    };
  }
}
