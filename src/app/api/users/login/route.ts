import { connect } from "@/db/config";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import * as argon from "argon2";
import * as jwt from 'jsonwebtoken';

connect();

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { email, password } = reqBody;

    const user = await User.findOne({ email });
    //check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "User doesn't exists" },
        { status: 400 }
      );
    }

    //check if password is correct
    const isMatch = await argon.verify(user.password, password);

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    //create token data
    const tokenData = {
        sub: user._id,
        email: user.email,
        username: `${user.firstName} ${user.lastName}`
    };

    //create token
    const remainingMilliseconds = 60 * 60 * 1000;
    const expiryDate = new Date(
      new Date().getTime() + remainingMilliseconds
    ); 
    const token = await jwt.sign(tokenData, process.env.JWT_SECRET!, {
      expiresIn: '1hr'
    });

    const res = NextResponse.json({
      message: 'User Signin successful',
      success: true
    }, {
      status: 200
    });

    res.cookies.set('access_token', token, {
      httpOnly: true,
      expires: expiryDate
    });

    return res;


  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
