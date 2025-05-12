import { NextRequest, NextResponse } from "next/server";
import * as argon from "argon2";
import { sendMail } from "@/helpers/mailer";
import { EmailType } from "@/interfaces";
import { models } from "@/db/connection";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { sanitizeInput } from "@/helpers/sanitize";

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
  res: NextResponse
) {
  try {
    const ip = req.headers.get('x-forwarded-for');

    const { success, limit, remaining, reset } = await ratelimit.limit(String(ip));

    if (!success) {
      const res = NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
      res.headers.set('X-RateLimit-Limit', limit.toString());
      res.headers.set('X-RateLimit-Remaining', remaining.toString());
      res.headers.set('X-RateLimit-Reset', reset.toString());
      return res;
    }

    const user = await models.User.findByPk(params.id);

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "User doesn't exist" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        userEmail: user.email,
        title: user.is_admin ? "Administrator" : "Guest",
        userId: user.id,
        userName: `${user.first_name} ${user.last_name}`,
        shippingInfo: user.shipping_info ?? "",
        billingInfo: user.billing_info ?? "",
        saveBillingInfo: user.save_billing_info,
        saveShippingInfo: user.save_shipping_info,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = req.headers.get('x-forwarded-for');

    const { success, limit, remaining, reset } = await ratelimit.limit(String(ip));

    if (!success) {
      const res = NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
      res.headers.set('X-RateLimit-Limit', limit.toString());
      res.headers.set('X-RateLimit-Remaining', remaining.toString());
      res.headers.set('X-RateLimit-Reset', reset.toString());
      return res;
    }

    const reqBody = await req.json();

    const {
      firstName,
      lastName,
      password,
      enableEmailMarketing = false,
      avatar,
      checkingOut,
      email,
    } = reqBody;

    const cleanEmail = sanitizeInput(email);
    const cleanFirstName = sanitizeInput(firstName);
    const cleanLastName = sanitizeInput(lastName);
    const cleanPass = sanitizeInput(password);

    const user = await models.User.findByPk(params.id);

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { message: "user doesn't exist" },
        { status: 200 }
      );
    }

    // Update user fields
    if (cleanPass && cleanPass.length > 0) {
      // Hash the passowrd
      const hash = await argon.hash(cleanPass);
      user.password = hash;
    }
    user.enable_email_marketing = enableEmailMarketing;
    user.first_name = cleanFirstName;
    user.last_name = cleanLastName;
    if (avatar) {
      user.avatar = avatar;
    }
    if (cleanEmail) {
      user.email = cleanEmail;
    }

    const savedUser = await user.save();

    if (checkingOut) {
      // Send password creation email
      await sendMail({
        password: cleanPass,
        email: savedUser.email,
        emailType: EmailType.reminder,
      });

      //sending verification email
      await sendMail({
        email: savedUser.email,
        emailType: EmailType.verify_buyer,
        userId: savedUser.id,
      });
    }

    return NextResponse.json(
      {
        message: "User data updated successfully",
        success: true,
        savedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
