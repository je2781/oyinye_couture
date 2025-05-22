import { NextRequest, NextResponse } from "next/server";
import { SignatureError } from "@upstash/qstash";
import { verifySignatureAppRouter} from "@upstash/qstash/nextjs";
import { sendMail } from "@helpers/mailer";
import { EmailType } from "@interfaces/index";

export const POST = verifySignatureAppRouter(
  async (req: NextRequest) => {
    try {
      const reqBody = await req.json();

      const { email, userId, password, emailBody } = reqBody;

      const type = req.nextUrl.searchParams.get('type')!;

      await sendMail({
        email,
        emailType:
          type === "verify_account"
            ? EmailType.verify_account
            : type === "reset"
            ? EmailType.reset
            : type === "reminder"
            ? EmailType.reminder
            : type === "request"
            ? EmailType.request
            : type === "verify_reviewer"
            ? EmailType.verify_reviewer
            : EmailType.verify_buyer,
        userId,
        emailBody,
        password,
      });

      return NextResponse.json(
        {
          message: "email sent",
        },
        {
          status: 201,
        }
      );
    } catch (error : any) {
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
);
