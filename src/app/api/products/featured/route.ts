import { connect } from "@/db/config";
import Product from "@/models/product";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(req: NextRequest) {
  try {

    const products = await Product.find().limit(4);
    //check if user exists
    if (!products) {
      return NextResponse.json(
        { error: "No products have been uploaded" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      products,
      success: true
    }, {
      status: 200
    });


  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
