import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import * as argon from "argon2";
import { sanitizeInput } from "libs/common/utils/sanitize";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { ClientProxy } from "@nestjs/microservices";
import { ADMIN_SERVICE, EMAIL_SERVICE, WEB_SERVICE } from "./constants/service";
import { lastValueFrom } from "rxjs";
import { EmailType } from "libs/common/interfaces";
import * as crypto from "crypto";
import { AuthDto } from "./dto/auth.dto";
import { getUserData } from "libs/common/utils/getUserData";
import { ConfigService } from "@nestjs/config";
import { Session } from "./entities/session.entity";
import { RefreshToken } from "./entities/refresh-token.entity";
import { User } from "./entities/user.entity";
import { getGuestData } from "libs/common/utils/getGuest";

@Injectable()
export class AuthService {
  private refreshTokenExpiryDays = 2629746000; // 1 month in millisec;

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject(ADMIN_SERVICE) private adminClient: ClientProxy,
    @Inject(EMAIL_SERVICE) private emailClient: ClientProxy,
    @Inject(WEB_SERVICE) private webClient: ClientProxy,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  async verifyUser(body: AuthDto) {
    try {
      const cleanEmail = sanitizeInput(body.email);
      const cleanPassword = sanitizeInput(body.password);

      const user = await this.userRepo.findOne({
        where: { email: cleanEmail! },
      });

      if (!user) throw new NotFoundException("user doesn't exist");

      if (user.is_admin && !user.password) {
        const adminHashedPass = await argon.hash(cleanPassword!);
        user.password = adminHashedPass;
        await user.save();
      }

      if (!user.account_is_verified) {
        throw new UnauthorizedException(
          `Check ${user.email} to verify your account`
        );
      }

      // Check if password is correct
      const isMatch = await argon.verify(user.password!, cleanPassword!);

      if (!isMatch) {
        throw new BadRequestException("Invalid password");
      }

      delete user.password;

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createSession(req: Request, res: Response, user: User) {
    try {
      const tokenData = {
        sub: user.id,
        email: user.email,
      };

      // 1. Create Session
      const session = this.sessionRepo.create({
        user,
        ip: req.header("x-forwarded-for") || req.ip,
        user_agent: req.header("user-agent") || "unknown",
      });
      await this.sessionRepo.save(session);

      // 2. Create Access Token
      const accessToken = this.jwtService.sign(tokenData, {
        expiresIn: "1hr", // 1 hour
      });

      // 3. Create Refresh Token (raw + hashed)
      const rawRefreshToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = this.hashToken(rawRefreshToken);
      const refreshToken = this.refreshTokenRepo.create({
        token_hash: hashedToken,
        expires_at: new Date(Date.now() + this.refreshTokenExpiryDays),
        session,
      });
      await this.refreshTokenRepo.save(refreshToken);

      //4. changing user that is not admin from guest to auth user
      if (!user.is_admin) {
        const guest = await this.userRepo.findOneBy({ id: getGuestData(req) });
        guest!.is_guest = false;
        await guest!.save();

        //dispatching user_updated job
        await lastValueFrom(
          this.webClient.emit("user_updated", {
            id: user.id,
            data: user,
            access_token: req.cookies["access_token"],
          })
        );
        //clearing guest cookie because guest no longer exists
        res.clearCookie("guest");
      }
      

      res.cookie("access_token", accessToken, {
        httpOnly: true,
        maxAge: 3600000, //ihr
        path: "/",
        secure: this.configService.get("NODE_ENV") === "production",
        sameSite: "lax",
      });

      res.cookie("refresh_token", rawRefreshToken, {
        httpOnly: true,
        maxAge: this.refreshTokenExpiryDays,
        path: "/",
        secure: this.configService.get("NODE_ENV") === "production",
        sameSite: "lax",
      });

      res.cookie("session", session.id, {
        httpOnly: true,
        maxAge: this.refreshTokenExpiryDays,
        path: "/",
        secure: this.configService.get("NODE_ENV") === "production",
        sameSite: "lax",
      });

      if (user.is_admin) {
        res.cookie("admin_status", `${user.is_admin}`, {
          httpOnly: true,
          maxAge: this.refreshTokenExpiryDays,
          path: "/",
          secure: this.configService.get("NODE_ENV") === "production",
          sameSite: "lax",
        });
      }

      res.cookie("user", user.id, {
        httpOnly: true,
        path: "/",
        secure: this.configService.get("NODE_ENV") === "production",
        sameSite: "lax",
      });

      res.status(201).json({
        message: "User Signin successful",
        user,
        success: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async endSession(req: Request, res: Response) {
    const refreshToken = req.cookies["refresh_token"];
    if (!refreshToken) {
      throw new UnauthorizedException("No refresh token provided.");
    }

    // Hash the incoming token to match the DB version
    const hashedToken = this.hashToken(refreshToken);

    // Find the token in the DB
    const token = await this.refreshTokenRepo.findOne({
      where: { token_hash: hashedToken },
      relations: ["session"],
    });

    if (token) {
      // Revoke token and session
      token.is_revoked = true;
      await this.refreshTokenRepo.save(token);

      if (token.session) {
        token.session.is_active = false;
        await this.sessionRepo.save(token.session);
      }
    }

    // Clear cookies
    res.clearCookie("access_token");
    res.clearCookie("session");
    res.clearCookie("refresh_token");
    res.clearCookie("admin_status");

    res.status(204).json({ message: "logout successful", success: true });
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { password, confirmPassword, token } = req.body;

      if (password.trim() !== confirmPassword.trim()) {
        throw new BadRequestException("Passwords do not match!");
      }

      const user = await this.userRepo.findOne({
        where: {
          reset_token: token,
          reset_token_expiry_date: MoreThan(new Date()),
        },
      });

      if (!user) {
        throw new HttpException(
          "Reset password link has expired",
          HttpStatus.FORBIDDEN
        );
      }

      const newHashedPassword = await argon.hash(password);

      user.password = newHashedPassword;
      user.reset_token = undefined;
      user.reset_token_expiry_date = undefined;

      await user.save();

      //dispatching user updated job
      if (user.is_admin) {
        await lastValueFrom(
          this.adminClient.emit("user_updated", {
            id: user!.id,
            data: user!,
            access_token: req.cookies["access_token"],
          })
        );
      } else {
        await lastValueFrom(
          this.webClient.emit("user_updated", {
            id: user!.id,
            data: user!,
            access_token: req.cookies["access_token"],
          })
        );
      }

      return res.status(201).json({ message: "Password reset", success: true });
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({
        error: e.message,
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const cleanEmail = sanitizeInput(email);

      const user = await this.userRepo.findOne({
        where: {
          email: cleanEmail!,
        },
      });

      if (!user) {
        throw new BadRequestException("Invalid email");
      }

      //dispatching password_reset job
      const resetPasswordToken = (await crypto.randomBytes(32)).toString("hex");
      user.reset_token = resetPasswordToken;
      user.reset_token_expiry_date = new Date(Date.now() + 3600000);
      await user.save();

      await lastValueFrom(
        this.emailClient.emit("password_reset", {
          token: resetPasswordToken,
          emailType: EmailType.reset,
        })
      );

      //dispatching user updated job
      if (user.is_admin) {
        await lastValueFrom(
          this.adminClient.emit("user_updated", {
            id: user.id,
            data: user,
            access_token: req.cookies["access_token"],
          })
        );
      } else {
        await lastValueFrom(
          this.webClient.emit("user_updated", {
            id: user.id,
            data: user,
            access_token: req.cookies["access_token"],
          })
        );
      }

      return res
        .status(201)
        .json({ message: "Password reset email sent!", success: true, user });
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({
        error: e.message || "An unexpected error occurred",
      });
    }
  }

  async register(res: Response, body: AuthDto, req: Request) {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        enableEmailMarketing,
      } = body;

      const cleanFirstName = sanitizeInput(firstName);
      const cleanLastName = sanitizeInput(lastName);
      const cleanEmail = sanitizeInput(email);
      const cleanPassword = sanitizeInput(password);

      //retrieving user id for users created earlier and also visitor id
      const userId = getUserData(req);

      let user = await this.userRepo.findOne({
        where: { email: cleanEmail! },
      });

      //check if user with email exists
      if (user) {
        throw new BadRequestException("user already exists");
      }

      //check if user with id exists
      if (userId) {
        user = await this.userRepo.findOneBy({ id: userId });
        user!.email = cleanEmail ?? "";
        user!.first_name = cleanFirstName ?? "";
        user!.last_name = cleanLastName ?? "";
        user!.password = cleanPassword ? await argon.hash(cleanPassword!) : "";
        user!.enable_email_marketing = enableEmailMarketing ? true : false;
        await user!.save();

        //dispatching user updated job
        await lastValueFrom(
          this.webClient.emit("user_updated", {
            id: user!.id,
            data: user!,
            access_token: req.cookies["access_token"],
          })
        );

        return res.status(201).json({
          message: `${
            enableEmailMarketing
              ? "user has joined mailing list"
              : "User created successfully"
          }`,
          success: true,
          user,
        });
      }

      //setting up verify token for verify_account job and updating user service with it
      const verifyAccountToken = (await crypto.randomBytes(32)).toString("hex");
      await this.userRepo.update(user!.id, {
        verify_token: verifyAccountToken,
        verify_token_expiry_date: new Date(Date.now() + 3600000),
      });

      //checking if only email is provided
      if (cleanEmail && !cleanPassword && !cleanFirstName && !cleanLastName) {
        user = this.userRepo.create({
          email: cleanEmail!,
        });

        await user!.save();

        //dispatching user_created job
        await lastValueFrom(
          this.webClient.emit("user_created", {
            user,
            access_token: req.cookies["access_token"],
          })
        );

        //dispatching account_verify job
        await lastValueFrom(
          this.emailClient.emit("account_verify", {
            token: verifyAccountToken,
            EmailType: EmailType.verify_account,
          })
        );

        return res.status(201).json({
          message: "User created successfully",
          success: true,
          user,
        });
      }

      //checking if on signup page or footer to sign up for mailing list
      if (cleanPassword && cleanFirstName && cleanLastName && cleanEmail) {
        const hash = await argon.hash(cleanPassword);

        user = this.userRepo.create({
          email: cleanEmail,
          password: hash,
          first_name: cleanFirstName,
          last_name: cleanLastName,
        });

        await user!.save();

        //dispatching user_created job
        await lastValueFrom(
          this.webClient.emit("user_created", {
            user,
            access_token: req.cookies["access_token"],
          })
        );

        //dispatching account_verify job
        await lastValueFrom(
          this.emailClient.emit("account_verify", {
            token: verifyAccountToken,
            EmailType: EmailType.verify_account,
          })
        );

        return res.status(201).json({
          message: "User created successfully",
          success: true,
          user,
        });
      } else {
        user = this.userRepo.create({
          email: cleanEmail!,
          enable_email_marketing: true,
        });

        await user.save();

        //dispatching user_created job
        await lastValueFrom(
          this.webClient.emit("user_created", {
            user,
            access_token: req.cookies["access_token"],
          })
        );

        //dispatching account_verify job
        await lastValueFrom(
          this.emailClient.emit("account_verify", {
            token: verifyAccountToken,
            EmailType: EmailType.verify_account,
          })
        );

        return res.status(201).json({
          message: "user has joined mailing list",
          success: true,
          user,
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async verifyEmail(params: any, res: Response, req: Request) {
    try {
      const user = await this.userRepo.findOne({
        where: {
          verify_token: params.slug[1],
          verify_token_expiry_date: MoreThan(new Date()),
        },
      });

      if (!user) {
        throw new UnauthorizedException("verification link has expired");
      }

      switch (params.type) {
        case "buyer":
          user.buyer_is_verified = true;
          break;
        case "reviewer":
          user.reviewer_is_verified = true;
          break;
        default:
          user.account_is_verified = true;
          break;
      }
      user.verify_token = undefined;
      user.verify_token_expiry_date = undefined;

      await user.save();

      //dispatching user_updated job
      if (user.is_admin) {
        await lastValueFrom(
          this.adminClient.emit("user_updated", {
            id: user.id,
            data: user,
            access_token: req.cookies["access_token"],
          })
        );
      }
      await lastValueFrom(
        this.webClient.emit("user_updated", {
          id: user.id,
          data: user,
          access_token: req.cookies["access_token"],
        })
      );

      return res.status(200).json({
        message: `${
          params.type.charAt(0).toUpperCase() + params.type.slice(1)
        } verified`,
        success: true,
      });
    } catch (error) {}
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies["refresh_token"];
    if (!refreshToken) throw new UnauthorizedException("No refresh token");

    const hashed = this.hashToken(refreshToken);
    const tokenInDb = await this.refreshTokenRepo.findOne({
      where: { token_hash: hashed },
      relations: ["session"],
    });

    if (
      !tokenInDb ||
      tokenInDb.is_revoked ||
      tokenInDb.expires_at < new Date()
    ) {
      throw new ForbiddenException("Invalid or expired refresh token");
    }

    // Issue new tokens
    const newAccessToken = this.jwtService.sign(
      { sub: tokenInDb.session.user.id, email: tokenInDb.session.user.email },
      { expiresIn: "30m" }
    );

    const newRawRefresh = crypto.randomBytes(32).toString("hex");
    const newHashed = this.hashToken(newRawRefresh);
    const newRefresh = this.refreshTokenRepo.create({
      token_hash: newHashed,
      session: tokenInDb.session,
      expires_at: new Date(Date.now() + this.refreshTokenExpiryDays),
    });
    await this.refreshTokenRepo.save(newRefresh);

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      maxAge: 1800000, // 30mins
      path: "/",
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "lax",
    });

    res.cookie("refresh_token", newRawRefresh, {
      httpOnly: true,
      maxAge: this.refreshTokenExpiryDays,
      path: "/",
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "lax",
    });

    return res
      .status(200)
      .json({ message: "Token refreshed", accessToken: newAccessToken });
  }

  async getGuestToken(req: Request, res: Response) {
    let token: string, user: any;
    if (getUserData(req)) {
      user = await this.userRepo.findOneBy({ id: getUserData(req) });

      token = this.jwtService.sign({ sub: getUserData(req) });

      //updating non-admin user
      if(!user.is_admin){
        //1. changing auth user back to guest
        user!.is_guest = true;
        await user!.save();
        
        //2. clearing user cookie because no longer exists
        res.clearCookie("user");
      }

    } else if (getGuestData(req)) {
      token = this.jwtService.sign({ sub: getGuestData(req) });
      user = {id: getGuestData(req)};
    } else {
      //2. creating guest
      user = this.userRepo.create({ is_guest: true });
      await user.save();
      token = this.jwtService.sign({ sub: user.id });
    }

    res.cookie("access_token", token, {
      httpOnly: true,
      maxAge: 3600000, //1hr
      path: "/",
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "lax",
    });

    //saving guest cookie for non-admin users
    if(!user.is_admin){
      res.cookie("guest", user!.id, {
        httpOnly: true,
        path: "/",
        secure: this.configService.get("NODE_ENV") === "production",
        sameSite: "lax",
      });
    }

    return res.status(200).json({ accessToken: token });
  }
}
