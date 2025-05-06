import { models } from '@/db/connection';
import { getBrowser, getDeviceType } from '@/helpers/getHelpers';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { cookies, headers } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import * as crypto from 'crypto';

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

        const res =  NextResponse.json({
          products,
          success: true
        }, {
          status: 200
        });
        
        //creating cookie to track leads
        const visitId = cookies().get('visit')?.value;
        
        if (!visitId) {
          const ip = headers().get('x-forwarded-for') || '0.0.0.0';
          const userAgent = headers().get('user-agent') || '';
          
          const device = getDeviceType(userAgent);
      
          const browser = getBrowser(userAgent);
      
          const newVisitor = await models.Visitor.create({
            id: (await crypto.randomBytes(6)).toString("hex"),
            ip,
            browser,
            device
          });
      
          const remainingMilliseconds = 5184000000; // 2 months
          const now = new Date();
          const expiryDate = new Date(now.getTime() + remainingMilliseconds);
      
          res.cookies.set({
            name: 'visit',
            value: newVisitor.id,
            expires: expiryDate,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'strict'
          });
        }

        if (!products) {
          return NextResponse.json(
            { error: "No products have been uploaded" },
            { status: 404 }
          );
        }

        return res;

       
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