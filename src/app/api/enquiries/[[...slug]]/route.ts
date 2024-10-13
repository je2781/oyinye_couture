import { months, randomReference } from '@/helpers/getHelpers';
import { getVisitData } from '@/helpers/getVisitData';
import * as argon from "argon2";
import User from '@/models/user';
import { NextResponse, type NextRequest } from 'next/server';
import { sendMail } from '@/helpers/mailer';
import { EmailType } from '@/interfaces';
import Enquiry from '@/models/enquiries';
import crypto from 'crypto';
import Visitor from '@/models/visitor';


export async function DELETE(req: NextRequest, { params }: { params: { slug?: string[] } }) {
    try {

        if(params.slug![1]){
          const enq = await Enquiry.findByPk(params.slug![1]);

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

        const {
            isRead,
            isUnRead,
            isBooking,
            isContact,
            saved
        } = await req.json();

        
        if(params.slug![1]){
          const enq = await Enquiry.findByPk(params.slug![1]);

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


        const user = await User.findOne({where: {email}});
    
        if(!user){
          const visitId = getVisitData(req);
    
          let newPassword = randomReference();
    
          const hash = await argon.hash(newPassword);
          
          const newUser = await User.create({
            id: (await crypto.randomBytes(6)).toString("hex"),
            email,
            password: hash,
            first_name: name.split(' ').length === 2 ? name.split(' ')[0] : name,
            last_name: name.split(' ').length === 2 ? name.split(' ')[1] : name,
          });

          if(visitId){
            const visitor = await Visitor.findByPk(visitId);
            await newUser.setVisitor(visitor!);
          }
          // Send password creation email
          await sendMail({
            password: newPassword,
            email: newUser.email,
            emailType: EmailType.reminder,
          });
          
          //sending verification email
          await sendMail({
            email: newUser.email,
            emailType: EmailType.verify_account,
            userId: newUser.id
          });
    
          if(params.slug![0] === 'custom-order'){
            //creating new appointment
            const newOrder = await Enquiry.create({
              id: (await crypto.randomBytes(6)).toString("hex"),
              order: {
                styles,
                size,
                residence: country,
                phone,
                eventDate,
                content
              }
            });

            await newOrder.setUser(newUser);
          }else{
            const newEquiry = await Enquiry.create({
              id: (await crypto.randomBytes(6)).toString("hex"),
              contact: {
                subject,
                message
              }
            });
  
            await newEquiry.setUser(newUser);

          }
    
    
          return NextResponse.json(
            {
              message: "enquiry created",
              success: true,
            },
            { status: 201 }
          );
        }else{
          user.first_name = name.split(' ').length === 2 ? name.split(' ')[0] : name,
          user.last_name = name.split(' ').length === 2 ? name.split(' ')[1] : name,

          await user.save();

          if(params.slug![0] === 'custom-order'){

            //creating new appointment
            const newOrder = await Enquiry.create({
              id: (await crypto.randomBytes(6)).toString("hex"),
              order: {
                styles,
                size,
                residence: country,
                phone,
                eventDate,
                content
              }
            });
      
            await newOrder.setUser(user);
          }else{
            const newEquiry = await Enquiry.create({
              id: (await crypto.randomBytes(6)).toString("hex"),
              contact: {
                subject,
                message
              }
            });
  
              await newEquiry.setUser(user);
  
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
        let updatedEnquiries = [];

        if(params.slug){
          const searchParams = req.nextUrl.searchParams;
          let page = searchParams.get('page');
          const updatedPage = +page! || 1;
          const ITEMS_PER_PAGE = +params.slug[0];
  
          let totalEnquiries = (await Enquiry.findAndCountAll()).count;
          let enquiries = await Enquiry.findAll({
            offset: (updatedPage-1) * ITEMS_PER_PAGE,
            limit: ITEMS_PER_PAGE,
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
            updatedEnquiries.push({
              ...enq,
              author: {
                full_name: `${(await enq.getUser()).first_name} ${(await enq.getUser()).last_name}`,
                email: (await enq.getUser()).email,
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


