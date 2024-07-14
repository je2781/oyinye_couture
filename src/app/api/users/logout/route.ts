import { connect } from "@/db/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {   

    const res =  NextResponse.json(
      { message: "logout successful", success: true},
    );

    res.cookies.set('access_token', '', {
        httpOnly: true
    })

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
