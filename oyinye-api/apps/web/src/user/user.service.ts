import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";
import { User } from "./user.entity";
import { Request, Response } from "express";
import { sanitizeInput } from "libs/common/utils/sanitize";
import * as argon from "argon2";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ADMIN_SERVICE, EMAIL_SERVICE } from "../constants/service";
import { ClientProxy } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import * as jwt from "jsonwebtoken";
import { EmailType } from "libs/common/interfaces";
import { CreateUserDto } from "./dto/creat-user.dto";
import { getUserData } from "libs/common/utils/getUserData";
import { getVisitData } from "libs/common/utils/getVisitData";
import { ConfigService } from "@nestjs/config";
import { Visitor } from "../visitor/visitor.entity";
import * as crypto from "crypto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private configService: ConfigService,
    @Inject(EMAIL_SERVICE) private emailClient: ClientProxy,
    @Inject(ADMIN_SERVICE) private adminClient: ClientProxy,
    @InjectRepository(Visitor) private visitorRepo: Repository<Visitor>
  ) {}

  async getUser(id: string, res: Response) {
    try {
      const user = await this.userRepo.findOneBy({ id });

      if (!user) throw new NotFoundException("user doesn't exit");

      return res.status(200).json({
        success: true,
        userEmail: user.email,
        title: user.is_admin ? "Administrator" : "Guest",
        userId: user.id,
        userName: `${user.first_name} ${user.last_name}`,
        shippingInfo: user.shipping_info ?? "",
        billingInfo: user.billing_info ?? "",
        saveBillingInfo: user.save_billing_info,
        saveShippingInfo: user.save_shipping_info,
      });
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({
        error: e.message || "An unexpected error occurred",
      });
    }
  }

  async updateUser(id: string, res: Response, body: UpdateUserDto) {
    try {
      const {
        firstName,
        lastName,
        password,
        enableEmailMarketing = false,
        checkingOut,
      } = body;

      const cleanFirstName = sanitizeInput(firstName);
      const cleanLastName = sanitizeInput(lastName);
      const cleanPass = sanitizeInput(password);

      let user = await this.userRepo.findOneBy({ id });

      if (!user) throw new NotFoundException("user doesn't exist");

      // Update user fields
      if (cleanPass && cleanPass.length > 0) {
        // Hash the passowrd
        const hash = await argon.hash(cleanPass);
        user.password = hash;
      }
      user.enable_email_marketing = enableEmailMarketing;
      user.first_name = cleanFirstName!;
      user.last_name = cleanLastName!;

      const savedUser = await this.userRepo.save(user);

      if (checkingOut) {
        //dispatching password_created job
        await lastValueFrom(
          this.emailClient.emit("password_created", {
            email: user.email,
            password: cleanPass,
          })
        );
      }

      return res.status(201).json({
        message: "User data updated successfully",
        success: true,
        savedUser,
      });
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({
        error: e.message || "An unexpected error occurred",
      });
    }
  }

  async createSession(
    res: Response,
    body: { email: string; password: string }
  ) {
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

      // Create token data
      const tokenData = {
        sub: user.id,
        email: user.email,
        username: `${user.first_name} ${user.last_name}`,
      };

      // Create token
      const remainingMilliseconds = 2629746000; // 1 month
      const expiryDate = new Date(new Date().getTime() + remainingMilliseconds);
      const token = jwt.sign(
        tokenData,
        this.configService.get<string>("JWT_SECRET")!,
        {
          expiresIn: "30d", // 1 month in a more readable format
        }
      );

      const updatedRes = res.status(201).json({
        message: "User Signin successful",
        user,
        success: true,
      });

      updatedRes.cookie("access_token", token, {
        httpOnly: true,
        expires: expiryDate,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      if (user.is_admin) {
        updatedRes.cookie("admin_status", `${user.is_admin}`, {
          httpOnly: true,
          expires: expiryDate,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
      }

      updatedRes.cookie("user", user.id, {
        httpOnly: true,
        expires: expiryDate,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return updatedRes;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async endSession(res: Response) {
    const updatedRes = res
      .status(204)
      .json({ message: "logout successful", success: true });

    updatedRes.clearCookie("access_token");

    updatedRes.clearCookie("admin_status");

    return updatedRes;
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
        throw new BadRequestException("Invlaid email");
      }

      //dispatching password_reset
      const resetPasswordToken = (await crypto.randomBytes(32)).toString("hex");
      await this.userRepo.update(user.id, {
        reset_token: resetPasswordToken,
        reset_token_expiry_date: new Date(Date.now() + 3600000),
      });
      await lastValueFrom(
        this.emailClient.emit("password_reset", {
          token: resetPasswordToken,
          emailType: EmailType.reset,
        })
      );

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

  async register(res: Response, body: CreateUserDto, req: Request) {
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
      const visitId = getVisitData(req);

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

      //getting visior relation for user registration
      const getVisitor = await this.visitorRepo.findOneBy({ id: visitId });

      //setting up verify token for verify)account job and updating user service with it
      const verifyAccountToken = (await crypto.randomBytes(32)).toString("hex");
      await this.userRepo.update(user!.id, {
        verify_token: verifyAccountToken,
        verify_token_expiry_date: new Date(Date.now() + 3600000),
      });

      //checking if only email is provided
      if (cleanEmail && !cleanPassword && !cleanFirstName && !cleanLastName) {
        user = this.userRepo.create({
          email: cleanEmail!,
          visitor: getVisitor!,
        });

        await user!.save();

        //dispatching user_created job
        await lastValueFrom(this.adminClient.emit("user_created", user));

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
          visitor: getVisitor!,
          last_name: cleanLastName,
        });

        await user!.save();

        //dispatching user_created job
        await lastValueFrom(this.adminClient.emit("user_created", user));

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
          visitor: getVisitor!,
        });

        await user!.save();

        //dispatching user_created job
        await lastValueFrom(this.adminClient.emit("user_created", user));

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

  async verifyEmail(params: any, res: Response) {
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

      return res
        .status(200)
        .json({
          message: `${
            params.type.charAt(0).toUpperCase() + params.type.slice(1)
          } verified`,
          success: true,
        });
    } catch (error) {}
  }
}
