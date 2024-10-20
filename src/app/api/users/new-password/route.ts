
import { models } from "@/db/connection";
import * as argon from "argon2";
import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";

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
    const reqBody = await req.json();

    const {password, confirmPassword, token } = reqBody;

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
