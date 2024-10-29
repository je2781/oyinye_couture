import { NextRequest, NextResponse } from "next/server";
import * as argon from "argon2";
import * as jwt from 'jsonwebtoken';
import { models } from "@/db/connection";

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { email, password } = reqBody;


    const user = await models.User.findOne({
      where: { email }
    });
    
    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { message: "User doesn't exist" },
        { status: 200 }
      );
    }


    if (user.is_admin && !user.password) {
      const adminHashedPass = await argon.hash(password);
      user.password = adminHashedPass;
      await user.save();
    }

    if (!user.account_is_verified) {
      return NextResponse.json(
        { message: `Check ${user.email} to verify your account` },
        { status: 200 }
      );
    }

    // Check if password is correct
    const isMatch = await argon.verify(user.password, password);

    if (!isMatch) {
      return NextResponse.json({ message: "Invalid password" }, { status: 200 });
    }

    // Create token data
    const tokenData = {
      sub: user.id,
      email: user.email,
      username: `${user.first_name} ${user.last_name}`
    };

    // Create token
    const remainingMilliseconds = 2629746000; // 1 month
    const expiryDate = new Date(new Date().getTime() + remainingMilliseconds);
    const token = jwt.sign(tokenData, process.env.JWT_SECRET!, {
      expiresIn: '30d' // 1 month in a more readable format
    });


    const res = NextResponse.json({
      message: 'User Signin successful',
      user,
      success: true
    }, {
      status: 200
    });

    res.cookies.set('access_token', token, {
      httpOnly: true,
      expires: expiryDate,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    res.cookies.set('admin_status', `${user.is_admin}`, {
      httpOnly: true,
      expires: expiryDate,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    if(user.is_admin){
      res.cookies.set('admin', user.id, {
        httpOnly: true,
        expires: expiryDate,
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return res;

  } catch (error: any) {
    console.log('failed logging in', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
