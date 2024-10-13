import { sendMail } from '@/helpers/mailer';
import { EmailType } from '@/interfaces';
import { NextResponse, type NextRequest } from 'next/server';


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


