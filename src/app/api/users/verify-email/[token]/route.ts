import { connect } from "@/db/config";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { sendMail } from "@/helpers/mailer";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(req: NextRequest, {params}: {params: {token: string}}) {
  try {

    const user = await User.findOne({
        verifyToken: params.token,
        verifyTokenExpirationDate: {$gt: new Date()}
    });

    if(!user){
      return NextResponse.json(
          { message: "verification link has expired",
            success: false
          },
          { status: 200 }
        ); 
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpirationDate = undefined;

    await user.save();

    return NextResponse.json(
      { message: "User verified", success: true},
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
