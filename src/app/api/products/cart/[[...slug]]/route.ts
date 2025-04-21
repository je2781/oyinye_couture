import { getDataFromCart } from "@/helpers/getDataFromCart";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { models } from "@/db/connection";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});


export async function GET(
  req: NextRequest,
  { params }: { params: { slug?: string[] } },
  res: NextResponse
) {
  try {
    const ip = req.headers.get("x-forwarded-for");

    const { success, limit, remaining, reset } = await ratelimit.limit(
      String(ip)
    );

    if (!success) {
      const res = NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
      res.headers.set("X-RateLimit-Limit", limit.toString());
      res.headers.set("X-RateLimit-Remaining", remaining.toString());
      res.headers.set("X-RateLimit-Reset", reset.toString());
      return res;
    }

    if (params.slug && params.slug[0]) {
      let cart = await models.Cart.findByPk(params.slug![0]);

      const cartItems = cart!.items.map((item: any) => {
        return {
          product: item.product,
          quantity: item.quantity,
          variantId: item.variant_id,
        };
      });

      return NextResponse.json(
        {
          cartItems,
          total: cart!.total_amount,
          success: true,
        },
        {
          status: 200,
        }
      );
    } else {
      throw new Error("Invalid cart id");
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

export async function POST(
  req: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
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

    if (
      params.slug &&
      Array.isArray(params.slug) &&
      params.slug.length > 0 &&
      params.slug[0] === "remove"
    ) {
      const { quantity, variantId, price} = await req.json();

      const cartId = getDataFromCart(req);

      if (cartId) {
        const cart = await models.Cart.findByPk(cartId);

        await cart!.deductFromCart(variantId, quantity, price);

        const updatedCartItems = cart!.items.filter(
          (item) => item.quantity > 0
        );

        cart!.items = updatedCartItems;
        await cart!.save();

        if (cart!.items.length === 0) {
          await cart!.destroy();
          const res = NextResponse.json(
            {
              message: "Cart updated successfully",
              totalAmount: 0,
              items: [],
              success: true,
            },
            { status: 201 }
          );

          res.cookies.set("cart", "", {
            httpOnly: true,
            path: "/",
            maxAge: 0,
          });
          return res;
        }

        const cartItems = cart!.items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          variantId: item.variant_id,
        }));

        return NextResponse.json(
          {
            message: "Cart updated successfully",
            totalAmount: cart!.total_amount,
            items: cartItems,
            success: true,
          },
          { status: 201 }
        );
      } else {
        throw new Error("Invalid cart id");
      }
    } else {
      const { price, quantity, variantId, id, totalAmount } = await req.json();

      const cartId = getDataFromCart(req);

      const product = await models.Product.findByPk(id);

      if (!cartId) {
        const newCart = await models.Cart.create({
          id: (await crypto.randomBytes(6)).toString("hex"),
          items: [
            {
              id: (await crypto.randomBytes(6)).toString("hex"),
              variant_id: variantId,
              quantity: parseInt(quantity),
              product: product!,
            },
          ],
          total_amount: parseFloat(totalAmount),
        });

        const remainingMilliseconds = 5184000000; // 2 months
        const expiryDate = new Date(Date.now() + remainingMilliseconds);

        const res = NextResponse.json(
          {
            message: "Cart created successfully",
            success: true,
          },
          { status: 201 }
        );

        res.cookies.set("cart", newCart.id, {
          expires: expiryDate,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          sameSite: "strict",
          httpOnly: true,
        });

        return res;
      } else {
        const cart = await models.Cart.findByPk(cartId);
        await cart!.addToCart(
          product!,
          parseInt(quantity),
          variantId,
          parseInt(price)
        );

        const cartItems = cart!.items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          variantId: item.variant_id,
        }));

        return NextResponse.json(
          {
            message: "Cart updated successfully",
            totalAmount: cart!.total_amount,
            items: cartItems,
            success: true,
          },
          { status: 201 }
        );
      }
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
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

    const reqBody = await req.json();

    const { userId } = reqBody;

    const cartId = getDataFromCart(req);

    //creating checkout session token
    const buffer = await crypto.randomBytes(32);
    const hashedToken = buffer.toString("hex");

    const remainingMilliseconds = 5184000000; // 2 month
    const now = new Date();
    const expiryDate = new Date(now.getTime() + remainingMilliseconds);

    if (cartId) {
      //retrieving cart data for the current public session and storing user data
      const cart = await models.Cart.findByPk(cartId);

      if (userId) {
        const user = await models.User.findByPk(userId);
        await cart!.setUser(user!);

        //creating add to cart state in order
        const newOrder = await models.Order.create({
          id: (await crypto.randomBytes(6)).toString("hex"),
          status: "add to cart",
          sales: cart!.total_amount,
        });

        await newOrder.setUser(user!);

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
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        res.cookies.set("order", newOrder.id, {
          expires: expiryDate,
          httpOnly: true,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        res.cookies.set("user", userId, {
          expires: expiryDate,
          httpOnly: true,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        return res;
      }

      //creating add to cart state in order
      const newOrder = await models.Order.create({
        id: (await crypto.randomBytes(6)).toString("hex"),
        status: "add to cart",
        sales: cart!.total_amount,
      });

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
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.cookies.set("order", newOrder.id, {
        expires: expiryDate,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res;
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}
