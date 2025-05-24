import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse, NextRequest } from "next/server";
import { SignatureError } from "@upstash/qstash";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { initializeSequelize } from "@/admin/src/db/connection";


const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  try {
    const {models} = await initializeSequelize();
    
    const utility = req.nextUrl.searchParams.get("utility");
    if (!utility) {
      return NextResponse.json(
        { message: "Missing utility parameter" },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";

    const { success, limit, remaining, reset } = await ratelimit.limit(
      String(ip)
    );

    if (!success) {
      const res = NextResponse.json(
        { message: "Rate limit exceeded" },
        { status: 429 }
      );
      res.headers.set("X-RateLimit-Limit", limit.toString());
      res.headers.set("X-RateLimit-Remaining", remaining.toString());
      res.headers.set("X-RateLimit-Reset", reset.toString());
      return res;
    }

    const body = await req.json();

    if (utility === "order_created") {
      const { order } = body;

      const extractedOrder = await models.Order.findByPk(order.id);

      if (extractedOrder) {
        extractedOrder.items = order.items;
        await extractedOrder.save();

        return NextResponse.json(
          {
            message: "order updated",
          },
          {
            status: 201,
          }
        );
      }

      await models.Order.create(order);

      return NextResponse.json({ message: "Order created" }, { status: 201 });
    } else if (utility === "enquiry_created") {
      const { enquiry } = body;

      await models.Enquiry.create(enquiry);

      return NextResponse.json({ message: "enquiry created" }, { status: 201 });
    } else if (utility === "user_created") {
      const { user } = body;

      await models.User.create(user);

      return NextResponse.json({ message: "user created" }, { status: 201 });
    } else if (utility === "visitor_created") {

      const { visitor } = body;

      const extractedVisitor = await models.Visitor.findByPk(visitor.id);

      if(!extractedVisitor){
        await models.Visitor.create(visitor);
        return NextResponse.json({ message: "visitor created" }, { status: 201 });

      }

      return NextResponse.json({ message: "visitor already exists" }, { status: 400 });


    }

    return NextResponse.json(
      { message: "Invalid utility parameter" },
      { status: 400 }
    );
  } catch (error: any) {
    if (error instanceof SignatureError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: error?.message || "Unexpected error occurred" },
      { status: 500 }
    );
  }
});
