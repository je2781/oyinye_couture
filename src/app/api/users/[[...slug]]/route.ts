import { connect } from "@/db/config";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import * as argon from "argon2";
import { sendMail } from "@/helpers/mailer";
import { EmailType } from "@/interfaces";
import mongoose from "mongoose";

connect();

export async function GET(
  req: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  try {
    const newUserId = mongoose.Types.ObjectId.createFromHexString(params.slug![0]);

    if (mongoose.Types.ObjectId.isValid(newUserId)) {
      const user = await User.findById(newUserId);
      //check if user laready exists
      if (!user) {
        return NextResponse.json(
          { error: "User doesn't exist" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          userEmail: user.email,
          userId: user._id.toString(),
          shippingInfo: user.shippingInfo,
          billingInfo: user.billingInfo,
          saveBillingInfo: user.saveBillingInfo,
          saveShippingInfo: user.saveShippingInfo
        },
        { status: 200 }
      );
    }else{
      return NextResponse.json(
        {
          message: "invalid user id",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}


export async function PATCH(req: NextRequest,{ params }: { params: { slug?: string[] } }
) {
  try {
    const newUserId = mongoose.Types.ObjectId.createFromHexString(params.slug![0]);

    const reqBody = await req.json();
    const { firstName, lastName, password, enableEmailMarketing } = reqBody;

    if(mongoose.Types.ObjectId.isValid(newUserId)){

      const user = await User.findById(newUserId);
      //check if user exists
      if (!user) {
        return NextResponse.json(
          { message: "Go back to cart and register your email"},
        {
          status: 200
        });
      }
        
      const hash = await argon.hash(password);
  
      user.password = hash;
      user.enableEmailMarketing = enableEmailMarketing;
      user.firstName = firstName;
      user.lastName = lastName;
  
      const savedUser = await user.save();

      //sending password creation email
      await sendMail({
        password,
        email: savedUser.email,
        emailType: EmailType.reminder,
      });
  
      return NextResponse.json(
        {
          message: "User data updated successfully",
          success: true,
          savedUser,
        },
        { status: 201 }
      );
      
    }else{
      return NextResponse.json(
        {
          message: "invalid user id",
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}

