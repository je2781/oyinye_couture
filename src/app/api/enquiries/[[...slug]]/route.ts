import { qstashClient, randomReference } from '@/helpers/getHelpers';
import { getVisitData } from '@/helpers/getVisitData';
import * as argon from "argon2";
import { NextResponse, type NextRequest } from 'next/server';
import { EmailType } from '@/interfaces';
import crypto from 'crypto';
import { models } from '@/db/connection';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { sanitizeInput } from '@/helpers/sanitize';

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});

export async function DELETE(req: NextRequest, { params }: { params: { slug?: string[] } }, res: NextResponse) {
    try {

        if(params.slug && params.slug.length > 0){
          const enq = await models.Enquiry.findByPk(params.slug![1]);

          await enq!.destroy();

          return NextResponse.json(
            {
              message: "enquiry deleted",
              success: true,
            },
            { status: 201 }
          );
        }else{

          return NextResponse.json(
            {
                message: 'invalid enquiry id',
                success: false
            },
            { status: 400 }
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

export async function PATCH(req: NextRequest, { params }: { params: { slug?: string[] } }) {
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
        const {
            isRead,
            isUnRead,
            isBooking,
            isContact,
            saved
        } = await req.json();


        
        if(params.slug && params.slug.length > 0){
          const enq = await models.Enquiry.findByPk(params.slug![1]);

          if(!enq ){
            return NextResponse.json(
              {
                message: "Enquiry doesn't exist",
                success: false,
              },
              { status: 200 }
            );
          }else{
            if(isBooking){
              enq.order.read = isRead ?? false;
              enq.order.unRead = isUnRead ?? true;
              enq.order.saved = saved ?? false;
  
              await enq.save();
            }
            if(isContact){
              enq.contact.read = isRead ?? false;
              enq.contact.unRead = isUnRead ?? true;
              enq.contact.saved = saved ?? false;
  
              await enq.save();
            }
      
            return NextResponse.json(
              {
                message: "enquiry updated",
                success: true,
              },
              { status: 201 }
            );
          }
        }else{
          return NextResponse.json(
            {
                message: 'invalid enquiry id',
                success: false
            },
            { status: 400 }
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

export async function POST(req: NextRequest, { params }: { params: { slug?: string[] } }) {
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


        const user = await models.User.findOne({where: {email: cleanEmail!}});
    
        if(!user){
          const visitId = getVisitData(req);
    
          let newPassword = randomReference();
    
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


          //dispatching password creation email job
          await qstashClient.publishJSON({
            url: `${process.env.DOMAIN}/api/mailer/${EmailType[EmailType.reminder]}`,
            body: {
                email: newUser.email,
                password: newPassword
            }
          });

          //dispatching verification email job
          await qstashClient.publishJSON({
            url: `${process.env.DOMAIN}/api/mailer/${EmailType[EmailType.verify_account]}`,
            body: {
                email: newUser.email,
                userId: newUser.id
            }
          });

    
          if(params.slug![0] === 'custom-order'){
            //creating new appointment
            await models.Enquiry.create({
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
            },{
              include: [{ model: models.User, as: 'orderUser' }]
            });

          }else{
            await models.Enquiry.create({
              id: (await crypto.randomBytes(6)).toString("hex"),
              user_id: newUser.id,
              contact: {
                subject: cleanSubject,
                message: cleanMsg
              }
            },{
              include: [{ model: models.User, as: 'user' }]
            });
  
          }
    
    
          return NextResponse.json(
            {
              message: "enquiry created",
              success: true,
            },
            { status: 201 }
          );
        }else{
          user.first_name = cleanName!.split(' ').length === 2 ? cleanName!.split(' ')[0] : cleanName!,
          user.last_name = cleanName!.split(' ').length === 2 ? cleanName!.split(' ')[1] : cleanName!,

          await user.save();

          if(params.slug![0] === 'custom-order'){

            //creating new appointment
            await models.Enquiry.create({
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
            },{
              include: [{ model: models.User, as: 'orderUser' }]
            });
      
          }else{
            await models.Enquiry.create({
              id: (await crypto.randomBytes(6)).toString("hex"),
              user_id: user.id,
              contact: {
                subject: cleanSubject,
                message: cleanMsg
              }
            },{
              include: [{ model: models.User, as: 'user' }]
            });
    
            }
    
          return NextResponse.json(
            {
              message: "enquiry created",
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

export async function GET(req: NextRequest, { params }: { params: { slug?: string[] } }) {
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

        let updatedEnquiries = [];

        if(params.slug && params.slug.length > 0){
          const searchParams = req.nextUrl.searchParams;
          let page = searchParams.get('page');
          const updatedPage = +page! || 1;
          const ITEMS_PER_PAGE = +params.slug[0];
  
          let totalEnquiries = (await models.Enquiry.findAndCountAll()).count;
          let enquiries = await models.Enquiry.findAll({
            offset: (updatedPage-1) * ITEMS_PER_PAGE,
            limit: ITEMS_PER_PAGE,
            include: [{ model: models.User, as: 'user' }]
          });
  
          const currentPage = updatedPage;
          const hasPreviousPage = currentPage > 1;
          const hasNextPage =
              totalEnquiries > currentPage * ITEMS_PER_PAGE;
          const lastPage = 
               Math.ceil(totalEnquiries / ITEMS_PER_PAGE);

          if (enquiries.length === 0) {
            return NextResponse.json(
              {
                hasNextPage,
                hasPreviousPage,
                lastPage,
                currentPage,
                isActivePage: updatedPage,
                nextPage: currentPage + 1,
                previousPage: currentPage - 1,
                enquiries
            },
                { status: 200 }
            );
          }
              
          for(let enq of enquiries){
            const user = await models.User.findByPk(enq.user_id);
            updatedEnquiries.push({
              ...enq,
              author: {
                full_name: `${user!.first_name} ${user!.last_name}`,
                email: user!.email,
              }
            });
          }
  
      
          return NextResponse.json(
            {
              message: "enquiries retrieved",
              hasNextPage,
              hasPreviousPage,
              lastPage,
              currentPage,
              isActivePage: updatedPage,
              nextPage: currentPage + 1,
              previousPage: currentPage - 1,
              enquiries: updatedEnquiries,
              success: true,
            },
            { status: 200 }
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


