import { getBrowser, getDeviceType } from 'packages/utils/getHelpers';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { cookies, headers } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import * as crypto from 'crypto';
import { getVisitData } from 'packages/utils/getVisitData';
import Visitor from '@/admin/src/models/visitor';
import { initializeSequelize } from '@/web/src/db/connection';

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10s'),
  analytics: true,
});

export async function GET(req: NextRequest) {
  try {
    const { models } = await initializeSequelize();

    const ip = req.headers.get('x-forwarded-for') || '0.0.0.0';
    const { success, limit, remaining, reset } = await ratelimit.limit(String(ip));

    if (!success) {
      const res = NextResponse.json({ message: 'Rate limit exceeded' }, { status: 429 });
      res.headers.set('X-RateLimit-Limit', limit.toString());
      res.headers.set('X-RateLimit-Remaining', remaining.toString());
      res.headers.set('X-RateLimit-Reset', reset.toString());
      return res;
    }

    const notHidden = req.nextUrl.searchParams.get('hidden');
    let products: any[] = [];

    if (notHidden) {
      products = await models.Product.findAll({
        where: { is_hidden: false },
      });
    } else {
      products = await models.Product.findAll();
    }

    let newVisitor: Visitor | null = null;
    const visitId = getVisitData(req);

    if (!visitId) {
      const userAgent = (await headers()).get('user-agent') || '';
      const device = getDeviceType(userAgent);
      const browser = getBrowser(userAgent);

      if (browser !== 'Unknown') {
        newVisitor = await models.Visitor.create({
          id: (await crypto.randomBytes(6)).toString('hex'),
          ip,
          browser,
          device,
        });

        const remainingMilliseconds = 5184000000; // 2 months
        const now = new Date();
        const expiryDate = new Date(now.getTime() + remainingMilliseconds);

        const response = NextResponse.json(
          {
            products,
            success: true,
            visitor: newVisitor.get({ plain: true }),
          },
          { status: 200 }
        );

        response.cookies.set('visit', newVisitor.id, {
          expires: expiryDate,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          sameSite: 'strict',
        });

        return response;
      }
    }

    // fallback response if no visitor is created
    return NextResponse.json(
      {
        products,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    const e = error as Error;
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
