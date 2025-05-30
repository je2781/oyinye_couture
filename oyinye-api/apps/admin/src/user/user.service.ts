import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { Response } from "express";
import { UpdateAdminUserDto } from "./dto/update-admin-user.dt";
import { sanitizeInput } from "libs/common/utils/sanitize";
import * as argon from "argon2";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) {}

  async updateUserOrderDetails(userId: string, data: any) {
    await this.userRepo.update(userId, data);
  }

  async createUser(data: any) {
    await this.userRepo.save(data);
  }

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
        error: e.message
      });
    }
  }

  async updateUserPersonalDetails(
    id: string,
    res: Response,
    body: UpdateAdminUserDto
  ) {
    const { firstName, lastName, password, avatar, email } = body;

    const cleanEmail = sanitizeInput(email);
    const cleanFirstName = sanitizeInput(firstName);
    const cleanLastName = sanitizeInput(lastName);
    const cleanPass = sanitizeInput(password);

    const user = await this.userRepo.findOneBy({ id });

    if (!user) throw new NotFoundException("admin doesn't exist");

    // Update user fields
    if (cleanPass && cleanPass.length > 0) {
      // Hash the passowrd
      const hash = await argon.hash(cleanPass);
      user.password = hash;
    }
    user.first_name = cleanFirstName!;
    user.last_name = cleanLastName!;
    if (avatar) {
      user.avatar = avatar;
    }
    if (cleanEmail) {
      user.email = cleanEmail;
    }

    await this.userRepo.save(user);


    return res.status(201).json({
      message: "admin data updated successfully",
      success: true,
    });
  }
}
