import { NextRequest, NextResponse } from "next/server";
import * as argon from "argon2";
import { sendMail } from "@/helpers/mailer";
import { EmailType } from "@/interfaces";
import { models } from "@/db/connection";


export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const user = await models.User.findByPk(params.id);

    // Check if user exists
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
        title: user.is_admin ? 'Administrator' : 'Guest',
        userId: user.id,
        userName: `${user.first_name} ${user.last_name}`,
        shippingInfo: user.shipping_info ?? "",
        billingInfo: user.billing_info ?? "",
        saveBillingInfo: user.save_billing_info,
        saveShippingInfo: user.save_shipping_info,
      },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const reqBody = await req.json();
    const { firstName, lastName, password, enableEmailMarketing = false, avatar, checkingOut, email} = reqBody;

    const user = await models.User.findByPk(params.id);

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { message: "user doesn't exist" },
        { status: 200 }
      );
    }
    
    // Update user fields
    if(password && password.length > 0){
      // Hash the password
      const hash = await argon.hash(password);
      user.password = hash;
    }
    user.enable_email_marketing = enableEmailMarketing;
    user.first_name = firstName;
    user.last_name = lastName;
    if(avatar){
      user.avatar = avatar;
    }
    if(email){
      user.email = email;
    }

    const savedUser = await user.save();

    if(checkingOut){

      // Send password creation email
      await sendMail({
        password,
        email: savedUser.email,
        emailType: EmailType.reminder,
      });

      //sending verification email
      await sendMail({
        email: savedUser.email,
        emailType: EmailType.verify_buyer,
        userId: savedUser.id
      });
    }


    return NextResponse.json(
      {
        message: "User data updated successfully",
        success: true,
        savedUser,
      },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
