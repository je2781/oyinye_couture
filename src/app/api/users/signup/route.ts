import { connect } from "@/db/config";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import * as argon from "argon2";
import { sendMail } from "@/helpers/mailer";
import { EmailType } from "@/interfaces";

connect();

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { firstName, lastName, email, password } = reqBody;

    const user = await User.findOne({ email });
    //check if user laready exists
    if (user) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hash = await argon.hash(password);

    const newUser = new User({
      email,
      password: hash,
      firstName,
      lastName
    });

    const savedUser = await newUser.save();

    //sending verification email
    const msgInfo = await sendMail({
      email: savedUser.email,
      emailType: EmailType.verify,
      userId: savedUser._id
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        success: true,
        verificationData: msgInfo,
        savedUser,
      },
      { status: 201 }
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
