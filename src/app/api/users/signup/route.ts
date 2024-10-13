import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import * as argon from "argon2";
import { sendMail } from "@/helpers/mailer";
import { EmailType } from "@/interfaces";
import { getVisitData } from "@/helpers/getVisitData";
import crypto from 'crypto';
import Visitor from "@/models/visitor";


export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { firstName, lastName, email, password, enableEmailMarketing} = reqBody;

    const user = await User.findOne({
      where: { email }
    });
    //check if user laready exists
    if (user) {
      if(enableEmailMarketing){
        user.enable_email_marketing = enableEmailMarketing;
        await user.save();

        return NextResponse.json(
          { message: "User has joined mailing list"},
          {
            status: 201
          }
        );
      }else{

        return NextResponse.json(
          { message: "User already exists"},
          {
            status: 200
          }
        );
      }
    }

    const visitId = getVisitData(req);

    if(password && firstName  && lastName && email){
      
          const hash = await argon.hash(password);
      
          const newUser = await User.create({
            id: (await crypto.randomBytes(6)).toString("hex"),
            email,
            password: hash,
            first_name: firstName,
            last_name: lastName,
          });
      
          if(visitId){
            const visitor = await Visitor.findByPk(visitId);
            await newUser.setVisitor(visitor!);
          }
      
          //sending verification email
          const msgInfo = await sendMail({
            email: newUser.email,
            emailType: EmailType.verify_account,
            userId: newUser.id
          });
      
          return NextResponse.json(
            {
              message: "User created successfully",
              success: true,
              newUser,
            },
            { status: 201 }
          );

    }else{
      const newUser = await User.create({
        id: (await crypto.randomBytes(6)).toString("hex"),
        email,
        enable_email_marketing: enableEmailMarketing ? true : false
      });
  
      if(visitId){
        const visitor = await Visitor.findByPk(visitId);
        await newUser.setVisitor(visitor!);
      }

      return NextResponse.json(
        {
          message: `${enableEmailMarketing ? 'user has joined mailing list' : 'User created successfully'}`,
          success: true,
          id: newUser.id,
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
