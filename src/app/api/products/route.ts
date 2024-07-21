import { connect } from '@/db/config';
import Product from '@/models/product';
import { NextResponse, type NextRequest } from 'next/server';

connect();
 
export async function GET(request: NextRequest) {
    try {

        const products = await Product.find();

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