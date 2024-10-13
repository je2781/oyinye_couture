import { getDataFromToken } from "@/helpers/getDataFromToken";
import { sendMail } from "@/helpers/mailer";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";


export async function GET(req: NextRequest, {params}: {params: {slug: string[]}}) {
  try {

    const user = await User.findOne({
      where: {
        verify_token: params.slug[1],
        verify_token_expiry_date: {
          [Op.gt]:  new Date()
        }
    }
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
        user.buyer_is_verified = true;
        break;
      case 'reviewer':
        user.reviewer_is_verified = true;
        break;
      default:
        user.account_is_verified = true;
        break;
    }
    user.verify_token = null;
    user.verify_token_expiry_date = null;

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
