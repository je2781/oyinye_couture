import { connect } from "@/db/config";
import Cart from "@/models/cart";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Order from "@/models/order";
import { getDataFromCart } from "@/helpers/getDataFromCart";
import { getDataFromOrder } from "@/helpers/getDataFromOrder";

connect();

export async function GET(req: NextRequest) {
  try {
    const cartId = getDataFromCart(req);

    const newCartId = mongoose.Types.ObjectId.createFromHexString(cartId);

    const [orderId, checkoutSessionToken] = getDataFromOrder(req);

    if (orderId && mongoose.Types.ObjectId.isValid(newCartId)) {
      // Retrieving order data for the current checkout session
      const order = await Order.findById(orderId);

      if (order) {
        // Retrieving cart data for the current public session
        const cart = await Cart.findById(newCartId);

        if (!cart) {
          return NextResponse.json(
            { error: "Cart not found" },
            { status: 404 }
          );
        }

        let updatedCart = await cart.populate("items.productId");

        const cartItems = updatedCart.items.map((cartItem: any) => {
          return {
            product: { ...cartItem.productId._doc },
            quantity: cartItem.quantity,
            variantId: cartItem.variantId,
          };
        });

        //updating order with checkout state
        order.items = cartItems;
        order.status = "checkout";
        order.sales = cart.totalAmount;

        await order.save();
      }

      return NextResponse.json(
        {
          message: "session token retrieved",
          checkout_session_token: checkoutSessionToken,
          success: true,
        },
        { status: 200 }
      );
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
