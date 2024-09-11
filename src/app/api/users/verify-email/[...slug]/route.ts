import { connect } from "@/db/config";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { sendMail } from "@/helpers/mailer";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(req: NextRequest, {params}: {params: {slug: string[]}}) {
  try {

    const user = await User.findOne({
        verifyToken: params.slug[1],
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

    switch (params.slug[0]) {
      case 'buyer':
        user.isVerified.buyer = true;
        break;
      case 'reviewer':
        user.isVerified.reviewer = true;
        break;
      default:
        user.isVerified.account = true;
        break;
    }
    user.verifyToken = undefined;
    user.verifyTokenExpirationDate = undefined;

    await user.save();

    return NextResponse.json(
      { message: `${params.slug[0].charAt(0).toUpperCase() + params.slug[0].slice(1)} verified`, success: true},
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
