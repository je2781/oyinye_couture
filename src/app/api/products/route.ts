import Product from '@/models/product';
import { NextResponse, type NextRequest } from 'next/server';
 

export async function GET(req: NextRequest) {
    try {

        const products = await Product.findAll();

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