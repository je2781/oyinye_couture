
import { initializeSequelize } from "@/web/src/db/connection";
import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";


export async function GET(req: NextRequest, {params}: {params: Promise<{slug: string[]}>}) {
  try {

    const {models} = await initializeSequelize();

    const qParams = await params;
    
    const user = await models.User.findOne({
      where: {
        verify_token: qParams.slug[1],
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
          { status: 403 }
        ); 
    }

    switch (qParams.slug[0]) {
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
      { message: `${qParams.slug[0].charAt(0).toUpperCase() + qParams.slug[0].slice(1)} verified`, success: true},
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
