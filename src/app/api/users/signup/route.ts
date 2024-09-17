import { connect } from "@/db/config";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import * as argon from "argon2";
import { sendMail } from "@/helpers/mailer";
import { EmailType } from "@/interfaces";
import { getVisitData } from "@/helpers/getVisitData";
import mongoose from "mongoose";
import { error } from "console";


connect();

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { firstName, lastName, email, password} = reqBody;

    const user = await User.findOne({ email });
    //check if user laready exists
    if (user) {
      return NextResponse.json(
        { error: "User already exists"},
        {
          status: 200
        }
      );
    }

    const visitId = getVisitData(req);
    const newVisitId = mongoose.Types.ObjectId.createFromHexString(visitId!);

    if(password && firstName  && lastName && email){
      
          const hash = await argon.hash(password);
      
          const newUser = new User({
            email,
            password: hash,
            firstName,
            lastName,
            'visitor.visitId': mongoose.Types.ObjectId.isValid(newVisitId) ? newVisitId : null 
          });
      
          const savedUser = await newUser.save();
      
          //sending verification email
          const msgInfo = await sendMail({
            email: savedUser.email,
            emailType: EmailType.verify_account,
            userId: savedUser._id
          });
      
          return NextResponse.json(
            {
              message: "User created successfully",
              success: true,
              savedUser,
            },
            { status: 201 }
          );

    }else{
      const newUser = new User({
        email,
        'visitor.visitId': mongoose.Types.ObjectId.isValid(newVisitId) ? newVisitId : null 
      });
  
      const savedUser = await newUser.save();

      return NextResponse.json(
        {
          message: "User created successfully",
          success: true,
          id: savedUser._id.toString(),
        },
        { status: 201 }
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
