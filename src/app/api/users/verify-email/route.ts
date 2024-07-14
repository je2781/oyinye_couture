import { connect } from "@/db/config";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { sendMail } from "@/helpers/mailer";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();

    const {token} = reqBody;

    const user = await User.findOne({
        verifyToken: token,
        verifyTokenExpirationDate: {$gt: new Date()}
    });

    if(!user){
        return NextResponse.json(
            { message: "Invalid token"},
            { status: 400 }
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
