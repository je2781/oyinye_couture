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
    
    if (mongoose.Types.ObjectId.isValid(newCartId) && getDataFromOrder(req).length === 0) {
      const buffer = await crypto.randomBytes(32);
      const hashedToken = buffer.toString("hex");
  
      const remainingMilliseconds = 5184000000; // 2 month
      const now = new Date();
      const expiryDate = new Date(now.getTime() + remainingMilliseconds);
      

      // Retrieving cart data for the current public session
      const cart = await Cart.findById(newCartId);

      if (!cart) {
        return NextResponse.json({ error: "Cart not found" }, { status: 404 });
      }

      let updatedCart = await cart.populate("items.productId");

      const cartItems = updatedCart.items.map((cartItem: any) => {
        return {
          product: { ...cartItem.productId._doc },
          quantity: cartItem.quantity,
          variantId: cartItem.variantId,
        };
      });

      //creating checkout state in order
      let orderId = (await crypto.randomBytes(6)).toString("hex");

      const newOrder = new Order({
        _id: orderId,
        items: cartItems.map((item: any) => ({
          product: item.product,
          quantity: item.quantity,
          variantId: item.variantId
        })),
        status: 'checkout',
        'user.userId': cart.user.userId
      });

      await newOrder.save();

      const res = NextResponse.json(
        {
          message: "Order created!",
          checkout_session_token: hashedToken,
          success: true,
        },
        { status: 201 }
      );

      res.cookies.set("checkout_session_token", hashedToken, {
        expires: expiryDate,
        httpOnly: true,
      });

      res.cookies.set("order", newOrder._id.toString(), {
        expires: expiryDate,
        httpOnly: true,
      });

      return res;
    } else if (getDataFromOrder(req).length > 0) {
      const [orderId, checkoutSessionToken] = getDataFromOrder(req);

      if(orderId){
        // Retrieving order data for the current checkout session
        const order = await Order.findById(orderId);

        if(order && order.items.length === 0){
          
          // Retrieving cart data for the current public session
          const cart = await Cart.findById(newCartId);

          if (!cart) {
            return NextResponse.json({ error: "Cart not found" }, { status: 404 });
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
          order.status = 'checkout';
  
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

      }else{
        return NextResponse.json(
          {
            message: "No order id",
          },
          { status: 404 }
        );
      }



      
    } else {
      return NextResponse.json({ error: "No cart and order have been created" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
