import { models } from '@/db/connection';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse, type NextRequest } from 'next/server';

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});
 

export async function GET(req: NextRequest) {
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