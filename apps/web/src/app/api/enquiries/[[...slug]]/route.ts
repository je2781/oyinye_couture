import { randomReference } from 'packages/utils/getHelpers';
import { getVisitData } from 'packages/utils/getVisitData';
import * as argon from "argon2";
import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'crypto';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { sanitizeInput } from 'packages/utils/sanitize';
import Enquiry from '@/admin/src/models/enquiries';
import { initializeSequelize } from '@/web/src/db/connection';

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    try {
      const {models} = await initializeSequelize();

      const qParams = await params;

      const ip = req.headers.get('x-forwarded-for');

        const { success, limit, remaining, reset } = await ratelimit.limit(String(ip));

        if (!success) {
          const res = NextResponse.json(
            { message: 'Rate limit exceeded' },
            { status: 429 }
          );
          res.headers.set('X-RateLimit-Limit', limit.toString());
          res.headers.set('X-RateLimit-Remaining', remaining.toString());
          res.headers.set('X-RateLimit-Reset', reset.toString());
          return res;
        }

        const {
            email,
            name,
            content,
            country,
            size,
            phone,
            eventDate,
            styles,
            subject,
            message
        } = await req.json();

        const cleanEmail = sanitizeInput(email);
        const cleanName = sanitizeInput(name);
        const cleanContent = sanitizeInput(content);
        const cleanCountry = sanitizeInput(country);
        const cleanPhone = sanitizeInput(phone);
        const cleanDate= sanitizeInput(eventDate);
        const cleanSubject = sanitizeInput(subject);
        const cleanMsg = sanitizeInput(message);


        let newEnquiry: Enquiry | null = null;


        const user = await models.User.findOne({where: {email: cleanEmail!}});
    
        if(!user){
          const visitId = getVisitData(req);
    
          const newPassword = randomReference();
    
          const hash = await argon.hash(newPassword);
          
          const newUser = await models.User.create({
            id: (await crypto.randomBytes(6)).toString("hex"),
            email: cleanEmail!,
            password: hash,
            visitor_id: visitId ?? '',
            first_name: cleanName!.split(' ').length === 2 ? cleanName!.split(' ')[0] : cleanName!,
            last_name: cleanName!.split(' ').length === 2 ? cleanName!.split(' ')[1] : cleanName!,
          },{
            include: [{ model: models.Visitor, as: 'visitor' }],
          });

    
          if(qParams.slug![0] === 'custom-order'){
            //creating new appointment
            newEnquiry =  await models.Enquiry.create({
              id: (await crypto.randomBytes(6)).toString("hex"),
              user_id: newUser.id,
              order: {
                styles,
                size,
                residence: cleanCountry,
                phone: cleanPhone,
                eventDate: cleanDate,
                content: cleanContent
              }
            });

          }else{
            newEnquiry =  await models.Enquiry.create({
              id: (await crypto.randomBytes(6)).toString("hex"),
              user_id: newUser.id,
              contact: {
                subject: cleanSubject,
                message: cleanMsg
              }
            });
  
          }
    
    
          return NextResponse.json(
            {
              message: "enquiry created",
              enquiry: newEnquiry.get({plain: true}),
              emailJob: {
                user,
                password: newPassword
              },
              success: true,
            },
            { status: 201 }
          );
        }else{
          user.first_name = cleanName!.split(' ').length === 2 ? cleanName!.split(' ')[0] : cleanName!,
          user.last_name = cleanName!.split(' ').length === 2 ? cleanName!.split(' ')[1] : cleanName!,

          await user.save();

          if(qParams.slug![0] === 'custom-order'){

            //creating new appointment
            newEnquiry =  await models.Enquiry.create({
              id: (await crypto.randomBytes(6)).toString("hex"),
              user_id: user.id,
              order: {
                styles,
                size,
                residence: cleanCountry,
                phone: cleanPhone,
                eventDate: cleanDate,
                content: cleanContent
              }
            });
      
          }else{
            newEnquiry =  await models.Enquiry.create({
              id: (await crypto.randomBytes(6)).toString("hex"),
              user_id: user.id,
              contact: {
                subject: cleanSubject,
                message: cleanMsg
              }
            }
            );
    
            }
    
          return NextResponse.json(
            {
              message: "enquiry created",
              enquiry: newEnquiry.get({plain: true}),
              success: true,
            },
            { status: 201 }
          );
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



