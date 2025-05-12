
import { models } from "@/db/connection";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import * as argon from "argon2";
import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});

// export async function GET(req: NextRequest) {
//   try {
//     const token = req.url.split('=')[1];

//     return NextResponse.json(
//       { token},
//       { status: 200 }
//     );
//   } catch (error: any) {
//     return NextResponse.json(
//       {
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

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

    const {password, confirmPassword, token} = reqBody;

    if (password.trim() !== confirmPassword.trim()) {
      return NextResponse.json(
        { message: "Passwords do not match!" },
        { status: 200 }
      );
    }

    const user = await models.User.findOne(
      {
        where: { reset_token: token, reset_token_expiry_date: { [Op.gt]: new Date()  } }
      }
      
    );

    
    if(!user){
        return NextResponse.json(
            { message: "Reset password link has expired", success: false },
            { status: 200 }
        ); 
    }
    
    const newHashedPassword = await argon.hash(password);

    user.password = newHashedPassword;
    user.reset_token = null;
    user.reset_token_expiry_date = null;

    await user.save();

    return NextResponse.json(
      { message: "Password reset", success: true },
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
