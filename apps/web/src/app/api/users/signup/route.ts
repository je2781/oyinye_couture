import { NextRequest, NextResponse } from "next/server";
import * as argon from "argon2";
import { getVisitData } from "packages/utils/getVisitData";
import crypto from "crypto";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { sanitizeInput } from "packages/utils/sanitize";
import { getUserData } from "packages/utils/getUserData";
import { initializeSequelize } from "@/web/src/db/connection";

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});

export async function POST(req: NextRequest) {
  try {
    const {models} = await initializeSequelize();
    
    const ip = req.headers.get("x-forwarded-for");

    const { success, limit, remaining, reset } = await ratelimit.limit(
      String(ip)
    );

    if (!success) {
      const res = NextResponse.json(
        { message: "Rate limit exceeded" },
        { status: 429 }
      );
      res.headers.set("X-RateLimit-Limit", limit.toString());
      res.headers.set("X-RateLimit-Remaining", remaining.toString());
      res.headers.set("X-RateLimit-Reset", reset.toString());
      return res;
    }
    const reqBody = await req.json();
    const {
      firstName,
      lastName,
      email,
      password,
      enableEmailMarketing,
    } = reqBody;

    const cleanFirstName = sanitizeInput(firstName);
    const cleanLastName = sanitizeInput(lastName);
    const cleanEmail = sanitizeInput(email);
    const cleanPassword = sanitizeInput(password);

    //retrieving user id for users created earlier and also visitor id
    const userId = getUserData(req);
    const visitId = getVisitData(req);

    let user = await models.User.findOne({
      where: { email: cleanEmail! },
    });

    //check if user with email exists
    if (user) {
      return NextResponse.json(
        { message: "User already exists" },
        {
          status: 400,
        }
      );
    }

    //check if user with id exists
    if (userId) {
      user = await models.User.findByPk(userId);
      user!.email = cleanEmail ?? "";
      user!.first_name = cleanFirstName ?? "";
      user!.last_name = cleanLastName ?? "";
      user!.password = cleanPassword
        ? await argon.hash(cleanPassword!)
        : "";
      user!.enable_email_marketing = enableEmailMarketing
        ? true
        : false;
      await user!.save();

      return NextResponse.json(
        {
          message: `${
            enableEmailMarketing
              ? "user has joined mailing list"
              : "User created successfully"
          }`,
          success: true,
          user: user!.get({plain: true}),
        },
        {
          status: 201,
        }
      );
    }

    //checking if only email is provided
    if (cleanEmail && !cleanPassword && !cleanFirstName && !cleanLastName) {
      user = await models.User.create({
        id: (await crypto.randomBytes(6)).toString("hex"),
        email: cleanEmail,
        visitor_id: visitId ?? "",
      });

      return NextResponse.json(
        {
          message: "User created successfully",
          success: true,
          user: user.get({plain: true}),
          id: user.id,
        },
        { status: 201 }
      );
    }

    //checking if on signup page or footer to sign up for mailing list
    if (cleanPassword && cleanFirstName && cleanLastName) {
      const hash = await argon.hash(cleanPassword);

      user = await models.User.create({
        id: (await crypto.randomBytes(6)).toString("hex"),
        email: cleanEmail!,
        password: hash,
        first_name: cleanFirstName,
        visitor_id: visitId ?? "",
        last_name: cleanLastName,
      });


      return NextResponse.json(
        {
          message: "User created successfully",
          success: true,
          user: user.get({plain: true}),
        },
        { status: 201 }
      );
    } else {
      user = await models.User.create({
        id: (await crypto.randomBytes(6)).toString("hex"),
        email: cleanEmail!,
        enable_email_marketing: true,
        visitor_id: visitId ?? "",
      });

      return NextResponse.json(
        {
          message: "user has joined mailing list",
          success: true,
          user: user.get({plain: true}),
          id: user.id,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    const e = error as Error;
    return NextResponse.json(
      {
        error: e.message,
      },
      { status: 500 }
    );
  }
}
