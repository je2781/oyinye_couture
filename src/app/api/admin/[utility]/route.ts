import { qstashClient } from '@/helpers/getHelpers';
import { sanitizeInput } from '@/helpers/sanitize';
import { EmailType } from '@/interfaces';
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse, type NextRequest } from 'next/server';

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10s'),
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
        

        const {message, email, contact, date} = await req.json();

    
        const cleanMsg = sanitizeInput(message);
        const cleanEmail = sanitizeInput(email);
        const cleanContact = sanitizeInput(contact);
        const cleanDate = sanitizeInput(date);

         //dispatching reminder email job
        await qstashClient.publishJSON({
        url: `${process.env.DOMAIN}/api/mailer/${EmailType[EmailType.reminder]}`,
        body: {
            email: cleanEmail,
            emailBody: {
                message: cleanMsg,
                contact: cleanContact,
                date: cleanDate
            }
        }
        });


        return NextResponse.json({
            message: 'reminder sent',
            
        }, {
            status: 201
        });
        

    } catch (error) {
        const e  = error as Error;
        return NextResponse.json(
            {
                error: e.message,
            },
            { status: 500 }
        );
    }
}


