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
  { params }: { params: { id: string } }
) {
  try {
    // Validate ObjectId before creating one
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const newUserId = mongoose.Types.ObjectId.createFromHexString(params.id);
    const user = await User.findById(newUserId);

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
        userId: user._id.toString(),
        shippingInfo: user.shippingInfo ?? "",
        billingInfo: user.billingInfo ?? "",
        saveBillingInfo: user.saveBillingInfo,
        saveShippingInfo: user.saveShippingInfo,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error in GET /api/users/[id]:', error);
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
    // Validate ObjectId before creating one
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const newUserId = mongoose.Types.ObjectId.createFromHexString(params.id);
    const reqBody = await req.json();
    const { firstName, lastName, password, enableEmailMarketing } = reqBody;

    const user = await User.findById(newUserId);

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { message: "Go back to cart and register your email" },
        { status: 200 }
      );
    }

    // Hash the password
    const hash = await argon.hash(password);

    // Update user fields
    user.password = hash;
    user.enableEmailMarketing = enableEmailMarketing;
    user.firstName = firstName;
    user.lastName = lastName;

    const savedUser = await user.save();

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
      userId: savedUser._id
    });

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
