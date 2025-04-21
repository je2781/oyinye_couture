import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { models } from "@/db/connection";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});



export async function POST(req: NextRequest, res: NextResponse) {
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

    const searchParams = req.nextUrl.searchParams;
    let type = searchParams.get("type");

    const {
      noOfFilters,
      isVisible,
      showOutOfStock,
      productType,
      priceRange,
      currentPriceBoundary,
      color,
      customProp,
    } = reqBody;

    const filterSettings = await models.Filter.findAll();

    if (filterSettings.length > 0) {
      if (type === "search") {
        await models.Filter.update(
          {
            search: {
              noOfFilters,
              isVisible,
              showOutOfStock,
              productType,
              priceRange,
              currentPriceBoundary,
            },
          },
          {
            where: {},
          }
        );
      }
      if (type === "collections") {
        await models.Filter.update(
          {
            collections: {
              color,
              noOfFilters,
              isVisible,
              customProperty: customProp,
            },
          },
          {
            where: {},
          }
        );
      }
    } else {
      if (type === "search") {
        const newSettings = await models.Filter.create({
          id: (await crypto.randomBytes(6)).toString("hex"),
          search: {
            noOfFilters,
            isVisible,
            showOutOfStock,
            productType,
            priceRange,
            currentPriceBoundary,
          },
        });

        await newSettings.save();
      }
      if (type === "collections") {
        const newSettings = await models.Filter.create({
          id: (await crypto.randomBytes(6)).toString("hex"),
          collections: {
            color,
            noOfFilters,
            isVisible,
            customProperty: customProp,
          },
        });

        await newSettings.save();
      }
    }

    return NextResponse.json(
      {
        message: "filter settings saved successfully",
        success: true,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
