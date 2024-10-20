import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDataFromCart } from "@/helpers/getDataFromCart";
import { getDataFromOrder } from "@/helpers/getDataFromOrder";
import { models } from "@/db/connection";

export async function GET(req: NextRequest) {
  try {
    const cartId = getDataFromCart(req);
    let orderItems: any[] = [];

    const [orderId, checkoutSessionToken] = getDataFromOrder(req);

    if (orderId && cartId) {
      // Retrieving order data for the current checkout session
      const order = await models.Order.findByPk(orderId);

      if (order) {
        // Retrieving cart data for the current public session
        const cart = await models.Cart.findByPk(cartId);

        if (!cart) {
          return NextResponse.json(
            { error: "Cart not found" },
            { status: 404 }
          );
        }

        const cartItems = cart.items.map((item, i) => {
          return {
            product: item.product,
            quantity: item.quantity,
            variant_id: item.variant_id,
          };
        });

        for(let item of cartItems){
          orderItems.push({
            id: (await crypto.randomBytes(6)).toString("hex"),
            variant_id: item.variant_id,
            quantity: item.quantity,
            product: item.product
          });
        }

        //updating order with checkout state
        order.items = orderItems;
        order.status = "checkout";
        order.sales = cart.total_amount;

        await order.save();
        
        return NextResponse.json(
          {
            message: "session token retrieved",
            checkout_session_token: checkoutSessionToken,
            success: true,
          },
          { status: 200 }
        );
      }

    } else {
      throw new Error('invalid order and cart id');
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
