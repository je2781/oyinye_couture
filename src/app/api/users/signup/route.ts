import { NextRequest, NextResponse } from "next/server";
import * as argon from "argon2";
import { EmailType } from "@/interfaces";
import { getVisitData } from "@/helpers/getVisitData";
import crypto from "crypto";
import { models } from "@/db/connection";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { Client } from "@upstash/qstash";
import { sanitizeInput } from "@/helpers/sanitize";
import { qstashClient } from "@/helpers/getHelpers";

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const ip = req.headers.get("x-forwarded-for");

    const { success, limit, remaining, reset } = await ratelimit.limit(
      String(ip)
    );

    if (!success) {
      const res = NextResponse.json(
        { error: "Rate limit exceeded" },
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

    const user = await models.User.findOne({
      where: { email: cleanEmail },
    });
    //check if user laready exists
    if (user) {
      if (!user.email) {
        user.email = cleanEmail;
        await user.save();

        return NextResponse.json(
          { message: "User updated" },
          {
            status: 201,
          }
        );
      } else if (enableEmailMarketing) {
        user.enable_email_marketing = enableEmailMarketing;
        await user.save();

        return NextResponse.json(
          { message: "User has joined mailing list" },
          {
            status: 201,
          }
        );
      } else {
        return NextResponse.json(
          { message: "User already exists" },
          {
            status: 400,
          }
        );
      }
    }

    const visitId = getVisitData(req);

    if (cleanPassword && cleanFirstName && cleanLastName && cleanEmail) {
      const hash = await argon.hash(cleanPassword);

      const newUser = await models.User.create({
        id: (await crypto.randomBytes(6)).toString("hex"),
        email: cleanEmail,
        password: hash,
        first_name: cleanFirstName,
        last_name: cleanLastName,
      });

      if (visitId) {
        const visitor = await models.Visitor.findByPk(visitId);
        await newUser.setVisitor(visitor!);
      }

      //dispatching verification email job
      await qstashClient.publishJSON({
        url: `${process.env.DOMAIN}/api/mailer/${
          EmailType[EmailType.verify_account]
        }`,
        body: {
          email: newUser.email,
          userId: newUser.id,
        },
      });

      return NextResponse.json(
        {
          message: "User created successfully",
          success: true,
          newUser,
        },
        { status: 201 }
      );
    } else {
      const newUser = await models.User.create({
        id: (await crypto.randomBytes(6)).toString("hex"),
        email: cleanEmail,
        enable_email_marketing: enableEmailMarketing ? true : false,
      });

      if (visitId) {
        const visitor = await models.Visitor.findByPk(visitId);
        await newUser.setVisitor(visitor!);
      }

      return NextResponse.json(
        {
          message: `${
            enableEmailMarketing
              ? "user has joined mailing list"
              : "User created successfully"
          }`,
          success: true,
          id: newUser.id,
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
