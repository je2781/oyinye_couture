import { models } from "@/db/connection";
import { sendMail } from "@/helpers/mailer";
import { sanitizeInput } from "@/helpers/sanitize";
import { EmailType } from "@/interfaces";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

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

    const {email} = reqBody;

    const cleanEmail = sanitizeInput(email);

    const user = await models.User.findOne({
      where: {
        email: cleanEmail
    }
    });

    if(!user){
        return NextResponse.json(
            { message: "Invalid email"},
            { status: 400 }
          ); 
    }

    //sending reset your password email
    await sendMail({
        email: user.email,
        emailType: EmailType.reset,
        userId: user.id
    });

    return NextResponse.json(
      { message: "Password reset email sent!", success: true},
      { status: 200 }
    );
  

  } catch (error: any) {
    
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
