import { connect } from "@/db/config";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { sendMail } from "@/helpers/mailer";
import User from "@/models/user";
import * as argon from "argon2";
import { NextRequest, NextResponse } from "next/server";

connect();

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

    const user = await User.findOne(
      { resetToken: token, resetTokenExpirationDate: { $gt: new Date() } }
      
    );

    
    if(!user){
        return NextResponse.json(
            { message: "Reset password link has expired", success: false },
            { status: 200 }
        ); 
    }
    
    const newHashedPassword = await argon.hash(password);

    user.password = newHashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpirationDate = undefined;

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
