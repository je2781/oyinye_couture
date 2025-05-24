import { NextRequest, NextResponse } from "next/server";
import * as argon from "argon2";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { sanitizeInput } from "packages/utils/sanitize";
import { initializeSequelize} from "@/admin/src/db/connection";

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {

    const {models} = await initializeSequelize();

    const qParams = await params;
    
    const ip = req.headers.get('x-forwarded-for');

    const { success, limit, remaining, reset } = await ratelimit.limit(String(ip));

    if (!success) {
      const res = NextResponse.json(
        { message: 'Rate limit exceeded' },
        { status: 429 }
      );
      res.headers.set('X-RateLimit-Limit', limit.toString());
      res.headers.set('X-RateLimit-Remaining', remaining.toString());
      res.headers.set('X-RateLimit-Reset', reset.toString());
      return res;
    }

    const user = await models.User.findByPk(qParams.id);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {models} = await initializeSequelize();

    const qParams = await params;

    const ip = req.headers.get('x-forwarded-for');

    const { success, limit, remaining, reset } = await ratelimit.limit(String(ip));

    if (!success) {
      const res = NextResponse.json(
        { message: 'Rate limit exceeded' },
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
      enableEmailMarketing,
      avatar,
      email,
    } = reqBody;

    const cleanEmail = sanitizeInput(email);
    const cleanFirstName = sanitizeInput(firstName);
    const cleanLastName = sanitizeInput(lastName);
    const cleanPass = sanitizeInput(password);

    const user = await models.User.findByPk(qParams.id);

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { message: "user doesn't exist" },
        { status: 404 }
      );
    }

    // Update user fields
    if (cleanPass && cleanPass.length > 0) {
      // Hash the passowrd
      const hash = await argon.hash(cleanPass);
      user.password = hash;
    }
    user.enable_email_marketing = enableEmailMarketing ? true : false;
    user.first_name = cleanFirstName!;
    user.last_name = cleanLastName!;
    if (avatar) {
      user.avatar = avatar;
    }
    if (cleanEmail) {
      user.email = cleanEmail;
    }

    const savedUser = await user.save();

    return NextResponse.json(
      {
        message: "User data updated successfully",
        success: true,
        emailJob: {
          user: savedUser,
          password: cleanPass
        },
      },
      { status: 201 }
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
