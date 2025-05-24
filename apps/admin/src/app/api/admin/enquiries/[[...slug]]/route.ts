
import { NextResponse, NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { initializeSequelize} from '@/admin/src/db/connection';

const redis = Redis.fromEnv();

// Allow 5 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10s"),
  analytics: true,
});

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    try {
        const {models} = await initializeSequelize();
      
        const qParams = await params;

        if(qParams.slug && qParams.slug.length > 0){
          const enq = await models.Enquiry.findByPk(qParams.slug![1]);

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
    try {
      const {models} = await initializeSequelize();

      const ip = req.headers.get('x-forwarded-for');

      const qParams = await params;

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
            isRead,
            isUnRead,
            isBooking,
            isContact,
            saved
        } = await req.json();


        
        if(qParams.slug && qParams.slug.length > 0){
          const enq = await models.Enquiry.findByPk(qParams.slug![1]);

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
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

        const updatedEnquiries = [];

        if (!qParams.slug || qParams.slug.length === 0) {
          return NextResponse.json(
            { message: 'Invalid request: missing slug', success: false },
            { status: 400 }
          );
        }
    

        if(qParams.slug && qParams.slug.length > 0){
          const searchParams = req.nextUrl.searchParams;
          let page = searchParams.get('page');
          const updatedPage = +page! || 1;
          const ITEMS_PER_PAGE = +qParams.slug[0];
  
          const totalEnquiries = (await models.Enquiry.findAndCountAll()).count;
          const enquiries = await models.Enquiry.findAll({
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
              
          for(const enq of enquiries){
            const user = await models.User.findByPk(enq.user_id);
            updatedEnquiries.push({
              ...enq.get({ plain: true }),
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


