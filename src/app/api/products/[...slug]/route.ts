import { qstashClient, randomReference } from "@/helpers/getHelpers";
import { getVisitData } from "@/helpers/getVisitData";
import * as argon from "argon2";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { EmailType } from "@/interfaces";
import { Op } from "sequelize";
import { models } from "@/db/connection";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { cookies } from "next/headers";

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const ip = req.headers.get("x-forwarded-for");
    const { success, limit, remaining, reset } = await ratelimit.limit(
      String(ip)
    );

    if (!success) {
      const rateLimitRes = NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
      rateLimitRes.headers.set("X-RateLimit-Limit", limit.toString());
      rateLimitRes.headers.set("X-RateLimit-Remaining", remaining.toString());
      rateLimitRes.headers.set("X-RateLimit-Reset", reset.toString());
      return rateLimitRes;
    }

    let extractedProductsArray: any[] = [];
    let authors: any[] = [];
    let updatedProducts: any[] = [];

    const viewedProducts = req.nextUrl.searchParams.get('viewed_p') === 'undefined' ? undefined : req.nextUrl.searchParams.get('viewed_p');

    // ===== Load the product first =====
    const title =
      params.slug[0].charAt(0).toUpperCase() +
      params.slug[0].replace("-", " ").slice(1);
    const product = await models.Product.findOne({ where: { title } });

    if (!product) {
      return NextResponse.json(
        { error: "product doesn't exist" },
        { status: 404 }
      );
    }

    const extractedColorObj = product.colors.find(
      (color: any) => color.name === params.slug[1].replace("-", " ")
    );
    if (!extractedColorObj) {
      return NextResponse.json(
        { error: "product color doesn't exist" },
        { status: 404 }
      );
    }

    if (viewedProducts) {
      const viewedProductsArray = JSON.parse(viewedProducts);

      for (let viewedProduct of viewedProductsArray) {
        let extractedProduct = await models.Product.findOne({
          where: {
            colors: {
              [Op.contains]: [{ sizes: [{ variant_id: viewedProduct }] }],
            },
          },
        });
        if (extractedProduct) {
          extractedProductsArray.push(extractedProduct);
        }
      }
    }

    const extractedProductsOfSimilarColor = await models.Product.findAll({
      where: {
        colors: {
          [Op.contains]: [
            { name: extractedColorObj.name },
            { sizes: [{ variant_id: { [Op.ne]: params.slug[2] } }] },
          ],
        },
      },
    });

    const carts = await models.Cart.findAll({
      where: {
        items: {
          [Op.contains]: [{ product: { id: product.id } }],
        },
      },
    });

    if (carts.length > 0) {
      for (let cart of carts) {
        let products = cart.items.map((item: any) => item.product);
        updatedProducts.push(...products);
      }
    }

    const reviews = await product.getReviews();
    reviews.sort((a: any, b: any) => b.likes - a.likes);

    for (let review of reviews) {
      const user = await review.getUser();
      authors.push(user);
    }

    const updatedReviews = reviews.map((review: any) => {
      const extractedAuthor = authors.find(
        (author: any) => author.id === review.author_id
      );
      return { ...review, author: extractedAuthor };
    });

    updatedProducts = [
      ...updatedProducts,
      ...extractedProductsArray,
      ...extractedProductsOfSimilarColor,
    ];
    const relatedProducts = updatedProducts.filter(
      (prod: any) => prod.id !== product.id
    );

    // 🔥 Single response object where we set the cookie
    return NextResponse.json(
      {
        productSizes: extractedColorObj.sizes,
        productFrontBase64Images: extractedColorObj.image_front_base64,
        productId: product.id,
        productColor: extractedColorObj.name,
        productTitle: product.title,
        productColors: product.colors,
        productReviews: updatedReviews,
        relatedProducts,
        success: true,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    const e = error as Error;
    console.error("❌ Error in GET handler:", error);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
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

    if (params.slug && params.slug[1] === "likes-dislikes") {
      const { likes, dislikes, reviewId } = await req.json();

      const review = await models.Review.findByPk(reviewId);

      review!.likes = likes;
      review!.dislikes = dislikes;

      await review!.save();

      return NextResponse.json(
        {
          message: "Product reviews updated successfully",
          success: true,
        },
        { status: 201 }
      );
    } else {
      const hide = req.nextUrl.searchParams.get("hide");

      if (hide) {
        await models.Product.update(
          {
            is_hidden: hide === "true" ? true : false,
          },
          {
            where: {
              id: params.slug[1],
            },
          }
        );

        return NextResponse.json(
          {
            message: "Product hidden successfully",
            success: true,
          },
          { status: 201 }
        );
      }
    }
  } catch (error) {
    const e = error as Error;
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
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

    const {
      rating,
      email,
      name,
      review,
      headline,
      isMedia,
      avatar,
    } = await req.json();

    const title =
      params.slug[0].charAt(0).toUpperCase() +
      params.slug[0].replace("-", " ").slice(1);

    const user = await models.User.findOne({
      where: { email: email },
    });

    const product = await models.Product.findOne({
      where: { title: title },
    });

    if (!user) {
      const visitId = getVisitData(req);

      let newPassword = randomReference();

      const hash = await argon.hash(newPassword);

      const newUser = await models.User.create({
        id: (await crypto.randomBytes(6)).toString("hex"),
        email,
        password: hash,
        first_name: name.split(" ").length === 2 ? name.split(" ")[0] : name,
        last_name: name.split(" ").length === 2 ? name.split(" ")[1] : name,
        avatar,
      });

      if (visitId) {
        const visitor = await models.Visitor.findByPk(visitId);
        await newUser.setVisitor(visitor!);
      }

      //updating product with new user review
      const newReview = await models.Review.create({
        id: (await crypto.randomBytes(6)).toString("hex"),
        headline,
        rating: +rating,
        author_id: newUser.id,
        content: review,
        is_media: isMedia,
      });

      await newReview.setUser(newUser);
      await newReview.setProduct(product!);
      await product!.addReview(newReview);

      product!.collated_reviews.push(newReview.id);

      await product!.save();

      //dispatching password creation email job
      await qstashClient.publishJSON({
        url: `${process.env.DOMAIN}/api/mailer/${
          EmailType[EmailType.reminder]
        }`,
        body: {
          password: newPassword,
          email: newUser.email,
        },
      });

      //dispatching verification email job
      await qstashClient.publishJSON({
        url: `${process.env.DOMAIN}/api/mailer/${
          EmailType[EmailType.verify_reviewer]
        }`,
        body: {
          email: newUser.email,
          userId: newUser.id,
        },
      });

      return NextResponse.json(
        {
          message: "product updated successfully",
          success: true,
        },
        { status: 201 }
      );
    } else {
      //updating product and user record with new user review and avatar
      user.avatar = avatar;

      await user.save();

      const newReview = await models.Review.create({
        id: (await crypto.randomBytes(6)).toString("hex"),
        headline,
        rating: +rating,
        author_id: user!.id,
        content: review,
        is_media: isMedia,
      });

      await newReview.setUser(user!);
      await newReview.setProduct(product!);
      await product!.addReview(newReview);

      product!.collated_reviews.push(newReview.id);

      await product!.save();

      //dispatching verification email job
      await qstashClient.publishJSON({
        url: `${process.env.DOMAIN}/api/mailer/${
          EmailType[EmailType.verify_reviewer]
        }`,
        body: {
          email: user.email,
          userId: user.id,
        },
      });

      return NextResponse.json(
        {
          message: "Product updated successfully",
          success: true,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    const e = error as Error;
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const product = await models.Product.findByPk(params.slug[1]);

    await product!.destroy();

    return NextResponse.json(
      {
        message: "product deleted",
        success: true,
      },
      {
        status: 201,
      }
    );
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
