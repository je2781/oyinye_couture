import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDataFromCart } from "@/helpers/getDataFromCart";
import { getDataFromOrder } from "@/helpers/getDataFromOrder";
import { models } from "@/db/connection";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const ip = req.headers.get('x-forwarded-for');

    const { success, limit, remaining, reset } = await ratelimit.limit(String(ip));

    if (!success) {
      const res = NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
      res.headers.set('X-RateLimit-Limit', limit.toString());
      res.headers.set('X-RateLimit-Remaining', remaining.toString());
      res.headers.set('X-RateLimit-Reset', reset.toString());
      return res;
    }

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

        for (let item of cartItems) {
          orderItems.push({
            id: (await crypto.randomBytes(6)).toString("hex"),
            variant_id: item.variant_id,
            quantity: item.quantity,
            product: item.product,
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
      throw new Error("invalid order and cart id");
    }
  } catch (error) {
    const e = error as Error;
    return NextResponse.json(
      {
        error: e.message,
      },
      { status: 500 }
    );
  }
}
