import { connect } from '@/db/config';
import { months, randomReference } from '@/helpers/getHelpers';
import { getVisitData } from '@/helpers/getVisitData';
import Appointments from '@/models/appointments';
import * as argon from "argon2";
import User from '@/models/user';
import mongoose from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { sendMail } from '@/helpers/mailer';
import { EmailType } from '@/interfaces';

connect();

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
            styles
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
    
          //creating new appointment
          const newAppointment = new Appointments({
            'author.authorId': savedUser._id,
            'author.styles': styles,
            'author.size': size,
            'author.residence': country,
            'author.phoneNo': phone,
            eventDate,
            content,
          });
    
          await newAppointment.save();
    
          return NextResponse.json(
            {
              message: "appointment created",
              success: true,
            },
            { status: 201 }
          );
        }else{
          //updating product with user review
          //creating new appointment
          const newAppointment = new Appointments({
            'author.authorId': user._id,
            'author.styles': styles,
            'author.size': size,
            'author.residence': country,
            'author.phoneNo': phone,
            eventDate,
            content,
          });
    
          await newAppointment.save();
    
          return NextResponse.json(
            {
              message: "appointment created",
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
        let authors = [];

        if(params.slug){
          const searchParams = req.nextUrl.searchParams;
          let page = searchParams.get('page');
          const updatedPage = +page! || 1;
          const ITEMS_PER_PAGE = +params.slug[0];
  
          let totalAppointments = await Appointments.find().countDocuments();
          let appointments = await Appointments.find().skip((updatedPage-1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
  
          const currentPage = updatedPage;
          const hasPreviousPage = currentPage > 1;
          const hasNextPage =
              totalAppointments > currentPage * ITEMS_PER_PAGE;
          const lastPage = 
               Math.ceil(totalAppointments / ITEMS_PER_PAGE);

          if (appointments.length === 0) {
            return NextResponse.json(
              {
                hasNextPage,
                hasPreviousPage,
                lastPage,
                currentPage,
                isActivePage: updatedPage,
                nextPage: currentPage + 1,
                previousPage: currentPage - 1,
                appointments
            },
                { status: 200 }
            );
          }
              
          for(let appt of appointments){
            const updatedAppt = await appt.populate('author.authorId');
            const authorData = {...updatedAppt.author.authorId._doc};
            authors.push(authorData);
          }
  
          const updatedAppointments = appointments.map((appt) => {
            const extractedAuthor = authors.find((author: any) => author._id.toString() === appt.author.authorId.toString());
          
            return {
              ...appt,
              author: {
                ...appt.author,
                fullName: `${extractedAuthor.firstName} ${extractedAuthor.lastName}`,
                email: extractedAuthor.email,
              }
            };
          });
      
          return NextResponse.json(
            {
              message: "appointments retrived",
              hasNextPage,
              hasPreviousPage,
              lastPage,
              currentPage,
              isActivePage: updatedPage,
              nextPage: currentPage + 1,
              previousPage: currentPage - 1,
              appointments: updatedAppointments,
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


