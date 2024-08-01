import { connect } from "@/db/config";
import Order from "@/models/order";
import Product from "@/models/product";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(req: NextRequest, {params}: {params: {  slug: string[]}}) {
  try {
    let relatedProducts: any[] = [];
    const title = params.slug[0].charAt(0).toUpperCase() + params.slug[0].replace('-', ' ').slice(1);

    const product = await Product.findOne({
        title: title
    });
    //check if user exists
    if (!product) {
      return NextResponse.json(
        { error: "product doesn't exist" },
        { status: 404 }
      );
    }

    const extractedColorObj = product.colors.find((color: any) => color.type === (params.slug[1].charAt(0).toUpperCase() + params.slug[1].slice(1)));

    if(extractedColorObj){
      const sizes =  extractedColorObj.sizes;
      const imageFrontBase64 = extractedColorObj.imageFrontBase64;
      const isAvailable = extractedColorObj.isAvailable;

      //finding related/grouped products of current product
      let orders = await Order.find({'items.productId': product._id});

      if(orders){
        let orderItems: any[] = [];
        for(let order of orders){
          let updatedOrder = await order.populate('items.productId');
          orderItems.concat(updatedOrder.items.map((orderItem: any) => ({
            product: {...orderItem.productId._doc}
          })));
        }
        //removing duplicates from order items and storing them
        relatedProducts = orderItems.filter((value, index, self) => 
          index === self.findIndex((t) => (
            JSON.stringify(t) === JSON.stringify(value)
          ))
        ).map(order => order.product);
      }

      return NextResponse.json({
        product: {
          productSizes: sizes,
          productFrontBase64Images: imageFrontBase64,
          productId: product._id.toString(),
          productColors: product.colors
        },
        relatedProducts,
        success: true
      }, {
        status: 200
      });
    }else{
      return NextResponse.json(
        { error: "product color doesn't exist" },
        { status: 404 }
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
