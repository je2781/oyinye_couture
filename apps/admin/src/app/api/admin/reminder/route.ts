import { sanitizeInput } from 'packages/utils/sanitize';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse, NextRequest } from 'next/server';

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10s'),
  analytics: true,
});



export async function POST(req: NextRequest){
 
    try {
      
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
      const { success, limit, remaining, reset } = await ratelimit.limit(String(ip));
  
      if (!success) {
        const res = NextResponse.json({ message: 'Rate limit exceeded' }, { status: 429 });
        res.headers.set('X-RateLimit-Limit', limit.toString());
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());
        return res;
      }
  
      const body = await req.json();
  
        const { message, email, contact, date } = body;
  
        const cleanMsg = sanitizeInput(message);
        const cleanEmail = sanitizeInput(email);
        const cleanContact = sanitizeInput(contact);
        const cleanDate = sanitizeInput(date);
  
        return NextResponse.json(
          {
            message: 'Reminder sent',
            emailJob: {
              email: cleanEmail,
              emailBody: {
                message: cleanMsg,
                contact: cleanContact,
                date: cleanDate,
              },
            },
          },
          { status: 201 }
        );
      
  

    } catch (error: any) {
  
      return NextResponse.json({ error: error?.message || 'Unexpected error occurred' }, { status: 500 });
    }
  
}


