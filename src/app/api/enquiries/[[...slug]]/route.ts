import { connect } from '@/db/config';
import { months, randomReference } from '@/helpers/getHelpers';
import { getVisitData } from '@/helpers/getVisitData';
import Enquiries from '@/models/enquiries';
import * as argon from "argon2";
import User from '@/models/user';
import mongoose from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { sendMail } from '@/helpers/mailer';
import { EmailType } from '@/interfaces';

connect();

export async function DELETE(req: NextRequest, { params }: { params: { slug?: string[] } }) {
    try {

        const newEnqId = mongoose.Types.ObjectId.createFromHexString(params.slug![1]);

        
        if(mongoose.Types.ObjectId.isValid(newEnqId)){
          await Enquiries.findByIdAndUpdate(newEnqId);

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

        const newEnqId = mongoose.Types.ObjectId.createFromHexString(params.slug![1]);

        
        if(mongoose.Types.ObjectId.isValid(newEnqId)){
          const enq = await Enquiries.findById(newEnqId);

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


        const user = await User.findOne({email});
    
        if(!user){
          const visitId = getVisitData(req);
          const newVisitId = mongoose.Types.ObjectId.createFromHexString(visitId!);
    
          let newPassword = randomReference();
    
          const hash = await argon.hash(newPassword);
          
          const newUser = new User({
            email,
            password: hash,
            firstName: name.split(' ').length === 2 ? name.split(' ')[0] : name,
            lastName: name.split(' ').length === 2 ? name.split(' ')[1] : name,
            'visitor.visitId': mongoose.Types.ObjectId.isValid(newVisitId) ? newVisitId : null 
          });
    
          const savedUser = await newUser.save();
    
          // Send password creation email
          await sendMail({
            password: newPassword,
            email: savedUser.email,
            emailType: EmailType.reminder,
          });
          
          //sending verification email
          await sendMail({
            email: user.email,
            emailType: EmailType.verify_account,
            userId: user._id
          });
    
          if(params.slug![0] === 'custom-order'){
            //creating new appointment
            const newEquiry = new Enquiries({
              'author.authorId': savedUser._id,
              'author.order.styles': styles,
              'author.order.size': size,
              'author.order.residence': country,
              'author.order.phoneNo': phone,
              'order.eventDate': eventDate,
              'order.content': content
            });

            await newEquiry.save();
          }else{
            const newEquiry = new Enquiries({
              'author.authorId': savedUser._id,
              'contact.subject': subject,
              'contact.message': message
            });

            await newEquiry.save();

          }
    
    
          return NextResponse.json(
            {
              message: "enquiry created",
              success: true,
            },
            { status: 201 }
          );
        }else{
          user.firstName = name.split(' ').length === 2 ? name.split(' ')[0] : name,
          user.lastName = name.split(' ').length === 2 ? name.split(' ')[1] : name,

          await user.save();

          if(params.slug![0] === 'custom-order'){

            //updating product with user review
            //creating new appointment
            const newOrder = new Enquiries({
              'author.authorId': user._id,
              'author.order.styles': styles,
              'author.order.size': size,
              'author.order.residence': country,
              'author.order.phoneNo': phone,
              'order.eventDate': eventDate,
              'order.content': content,
            });
      
            await newOrder.save();
          }else{
              const newEquiry = new Enquiries({
                'author.authorId': user._id,
                'contact.subject': subject,
                'contact.message': message
              });
  
              await newEquiry.save();
  
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
  
          let totalEnquiries = await Enquiries.find().countDocuments();
          let enquiries = await Enquiries.find().skip((updatedPage-1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
  
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
            const updatedEnq = await enq.populate('author.authorId');
            const authorData = {...updatedEnq.author.authorId._doc};
            updatedEnquiries.push({
              ...enq._doc,
              author: {
                ...enq.author,
                fullName: `${authorData.firstName} ${authorData.lastName}`,
                email: authorData.email,
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


