import { models } from "@/db/connection";
import { sendMail } from "@/helpers/mailer";
import { EmailType } from "@/interfaces";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();

    const {email} = reqBody;

    const user = await models.User.findOne({
      where: {
        email
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
