import { connect } from '@/db/config';
import { getBrowser, getDeviceType } from '@/helpers/getHelpers';
import { getVisitData } from '@/helpers/getVisitData';
import { sendMail } from '@/helpers/mailer';
import { EmailType } from '@/interfaces';
import User from '@/models/user';
import Visitor from '@/models/visitor';
import { NextResponse, type NextRequest } from 'next/server';

connect();

export async function POST(req: NextRequest) {
    try {
       const {message, email, contact, date} = await req.json();

       await sendMail({
        emailType: EmailType.reminder,
        email,
        emailBody: {
            message,
            contact,
            date
        }
       });

        return NextResponse.json({
            message: 'reminder sent',
            
        }, {
            status: 201
        });
        

    } catch (error: any) {
        return NextResponse.json(
            {
                error: error.message,
            },
            { status: 500 }
        );
    }
}


