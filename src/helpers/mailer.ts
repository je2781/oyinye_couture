import { SendMail } from "@/interfaces/send-mail-interface";
import User from "@/models/user";
import { EmailType } from "@/interfaces/send-mail-interface";
import nodemailer from "nodemailer";
import crypto from "crypto";

export const sendMail = async ({ email, emailType, userId }: SendMail) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      //create a hash token
      const hashedToken = buffer.toString("hex");

      if (emailType === EmailType.verify) {
        await User.findOneAndUpdate(userId, {
          verifyToken: hashedToken,
          verifyTokenExpirationDate: new Date(Date.now() + 3600000),
        });
      } else {
        await User.findOneAndUpdate(userId, {
          resetToken: hashedToken,
          resetTokenExpirationDate: new Date(Date.now() + 3600000),
        });
      }

      const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: process.env.MAIL_USER!,
          pass: process.env.MAIL_PASS!,
        },
      })!;

      return transport.sendMail({
        from: "sender@yourdomain.com",
        to: email,
        subject:
          emailType === EmailType.reset
            ? "Password Reset"
            : "Verify your email",
        html: `<p>Click <a href='${process.env.DOMAIN!}/${
          emailType === EmailType.verify ? "verifyemail" : "resetpassword"
        }?token=${hashedToken}'>here</a>
               to ${
                 emailType === EmailType.verify
                   ? "verify your email"
                   : "reset your password"
               } 
               or copy and paste the link in your browser <br /> ${process.env
                 .DOMAIN!}/${
                  emailType === EmailType.verify ? "verifyemail" : "resetpassword"
                  }?token=${hashedToken}</p>`,
      });
    });
  } catch (error) {
    throw error;
  }
};
