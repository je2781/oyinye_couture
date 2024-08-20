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
    const newUserId = mongoose.Types.ObjectId.createFromHexString(params.id);

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
          email: user.email,
        },
        { status: 200 }
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
