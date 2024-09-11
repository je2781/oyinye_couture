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
    
    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "User doesn't exist" },
        { status: 400 }
      );
    }


    if (user.isAdmin && !user.password) {
      const adminHashedPass = await argon.hash(password);
      user.password = adminHashedPass;
      await user.save();
    }

    if (!user.isAdmin && !user.isVerified.account) {
      return NextResponse.json(
        { message: `Check ${user.email} to verify your account` },
        { status: 200 }
      );
    }

    // Check if password is correct
    const isMatch = await argon.verify(user.password, password);

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    // Create token data
    const tokenData = {
      sub: user._id,
      email: user.email,
      username: `${user.firstName} ${user.lastName}`
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
      secure: process.env.NODE_ENV === 'production',
    });

    res.cookies.set('admin_status', `${user.isAdmin}`, {
      httpOnly: true,
      expires: expiryDate,
      secure: process.env.NODE_ENV === 'production',
    });

    return res;

  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
