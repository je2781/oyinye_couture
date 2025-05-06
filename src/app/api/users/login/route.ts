import { NextRequest, NextResponse } from "next/server";
import * as argon from "argon2";
import * as jwt from "jsonwebtoken";
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


export async function POST(req: NextRequest) {
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

    const { email, password } = reqBody;

    const cleanEmail = sanitizeInput(email);
    const cleanPassword = sanitizeInput(password);

    const user = await models.User.findOne({
      where: { email: cleanEmail! },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { message: "User doesn't exist" },
        { status: 200 }
      );
    }

    if (user.is_admin && !user.password) {
      const adminHashedPass = await argon.hash(cleanPassword!);
      user.password = adminHashedPass;
      await user.save();
    }

    if (!user.account_is_verified) {
      return NextResponse.json(
        { message: `Check ${user.email} to verify your account` },
        { status: 200 }
      );
    }

    // Check if password is correct
    const isMatch = await argon.verify(user.password, password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 200 }
      );
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
    const token = jwt.sign(tokenData, process.env.JWT_SECRET!, {
      expiresIn: "30d", // 1 month in a more readable format
    });

    const res = NextResponse.json(
      {
        message: "User Signin successful",
        user,
        success: true,
      },
      {
        status: 200,
      }
    );

    res.cookies.set("access_token", token, {
      httpOnly: true,
      expires: expiryDate,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.cookies.set("admin_status", `${user.is_admin}`, {
      httpOnly: true,
      expires: expiryDate,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.cookies.set("user", user.id, {
      httpOnly: true,
      expires: expiryDate,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      
    });
    

    return res;
  } catch (error: any) {
    console.log("failed logging in", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
