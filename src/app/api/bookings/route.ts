import { connect } from '@/db/config';
import { randomReference } from '@/helpers/getHelpers';
import { getVisitData } from '@/helpers/getVisitData';
import Appointments from '@/models/appointments';
import * as argon from "argon2";
import User from '@/models/user';
import mongoose from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { sendMail } from '@/helpers/mailer';
import { EmailType } from '@/interfaces';

connect();

export async function POST(req: NextRequest) {
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
            styles,
            size,
            residence: country,
            eventDate,
            content,
            phoneNo: phone
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
            styles,
            size,
            residence: country,
            eventDate,
            content,
            phoneNo: phone
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


