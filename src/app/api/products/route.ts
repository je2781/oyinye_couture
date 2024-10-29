import { models } from '@/db/connection';
import { NextResponse, type NextRequest } from 'next/server';
 

export async function GET(req: NextRequest) {
    try {
        const notHidden = req.nextUrl.searchParams.get('hidden');
        let products: any[] = [];

        if(notHidden){

          products = await models.Product.findAll({
            where: {
              is_hidden: false
            }
          });
        }else{
          products = await models.Product.findAll();
        }

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
      console.error("Error fetching products:", error);
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }
}