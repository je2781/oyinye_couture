import { NextRequest, NextResponse } from "next/server";
import { Receiver, SignatureError } from "@upstash/qstash";
import { sendMail } from "@/helpers/mailer";
import { EmailType } from "@/interfaces";

export async function POST(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    //extracting request body and header
    const body = await req.text();

    const signature =
      req.headers.get("upstash-signature") ||
      req.headers.get("Upstash-Signature");

    const r = new Receiver({
      currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
      nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
    });

    const isVerified = await r.verify({
      signature: signature!,
      body,
    });

    if(isVerified){
      const reqBody = await req.json();
  
      const { email, userId, password, emailBody } = reqBody;


      await sendMail({
        email,
        emailType: params.type === 'verify_account' 
        ?  EmailType.verify_account 
        : params.type === 'reset' 
        ? EmailType.reset 
        : params.type === 'reminder'
        ? EmailType.reminder
        : params.type === 'request'
        ? EmailType.request
        :params.type === 'verify_reviewer'
        ? EmailType.verify_reviewer
        : EmailType.verify_buyer,
        userId,
        emailBody,
        password
      });
    }

  } catch (error: any) {
    if (error instanceof SignatureError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        error: error?.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
