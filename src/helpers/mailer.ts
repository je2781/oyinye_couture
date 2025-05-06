import { SendMail } from "@/interfaces/send-mail-interface";
import User from "@/models/user";
import { EmailType } from "@/interfaces/send-mail-interface";
import sgMail from '@sendgrid/mail';
import crypto from "crypto";
import ejs from "ejs";
import path from "path";
import { months } from "./getHelpers";


const resetPasswordEmailData = async (
  resetPasswordToken: string
) => {
  const title = "Forgot your password? It happens to the best of us.";
  const mainInfo =
    "To reset your password, click the button below. The link will self-destruct after 1 hour";
  const extraInfo = `If you do not want to change your password or didn't request a reset, you can ignore and delete this email.`;

  //preparing email template and its data
    const templatePath = path.join(
      process.cwd(),
      '..',
      'templates/notification.ejs'
    );

  const ejsData = {
    title,
    mainInfo,
    extraInfo,
    isNewPass: false,
    isReset: true,

    link: `${process.env.DOMAIN!}/resetpassword?token=${resetPasswordToken}`,
    year: new Date().getFullYear(),
  };
  return ejs.renderFile(templatePath, { ...ejsData });
};

const reminderData = async (
  to: string,
  password?: string,
  reminderDate?: string,
  body?: string,
) => {
  const title = password ? "Your new password." : 'Appointment';
  const date = reminderDate ?? `${months[new Date().getMonth()]} ${new Date().getDate()}. ${new Date().getFullYear()}`;
  const message =
    password ? "Use this password to login into your account and access restricted content. If you did not register your details with us, you can ignore and delete this email.": body;

  //preparing email template and its data
  const templatePath = path.join(
    process.cwd(),
    '..',
    'templates/reminder.ejs'
  );

  const ejsData = {
    title,
    contact: to,
    message,
    date

  };
  return ejs.renderFile(templatePath, { ...ejsData });
};

const verifyData = async (
  verifyAccountToken: string,
  emailType: EmailType
) => {
  const title =
    `${emailType === EmailType.verify_account ? 'Please verify your account.' : emailType === EmailType.verify_reviewer ? 'Please verify you wrote a review' : 'Please verify you made a purchase.'}`;
  const mainInfo =
    "To verify your credentials, click the button below. The link will self-destruct after 1 hour";
  const extraInfo = `If were not expecting this email, you can ignore and delete this email.`;

  //preparing email template and its data
  const templatePath = path.join(
    process.cwd(),
    '..',
    'templates/notification.ejs'
  );

  const ejsData = {
    title,
    mainInfo,
    extraInfo,
    isNewPass: false,
    isReset: false,
    link: `${process.env.DOMAIN!}/verifyemail/${emailType === EmailType.verify_account ? 'account' : emailType === EmailType.verify_reviewer ? 'reviewer' : 'buyer'}?token=${verifyAccountToken}`,
    year: new Date().getFullYear(),
  };

  return ejs.renderFile(templatePath, { ...ejsData });
};

const requestData = async (
  id: string,
  total: number,
  tel: string,
  paymentUrl: string,
  cartItems: any[] = []
) => {

  const header = cartItems.length === 0 ? "Here's a quick view of the total amount this invoice is for, contact the seller for a detailed breakdown of the total amount" : 
  "Here's a quick view of the cart items, and the breakdown of the total amount of each item";
  const footer = cartItems.length === 0 ? 'Complete payment relax and wait for delivery<br> for this purchase' : 
  'Checkout cart and proceed to payment';
  const message = cartItems.length === 0 ? 'Awaiting notification of successful payment for order amount below, delivery of purchase will commerce on confirmation' : 
  'Waiting on you to finalize cart items and checkout. Offers and promotions will be added at checkout to subsidize payment';
  const actionWord = cartItems.length === 0 ? 'PAY' : 'VIEW';
  //preparing email template and its data
  const templatePath = path.join(
    process.cwd(),
    '..',
    'templates/request.ejs'
  );

  const ejsData = {
    total,
    businessTel: tel,
    id,
    url: paymentUrl,
    footer,
    actionWord,
    header,
    isCart: cartItems.length > 0 ? true : false,
    message,
    cartItems
  };

  return ejs.renderFile(templatePath, { ...ejsData });
};


export const sendMail = async ({ password, email, emailType, userId, emailBody }: SendMail) => {
  try {
    
    crypto.randomBytes(32, async (err, buffer) => {
      let resetPasswordEmailBody, updatedTo, verifyEmailBody, reminderEmailBody, paymentRequestBody = '';

      //create a hash token
      const hashedToken = buffer.toString("hex");

      if (emailType === EmailType.verify_account || emailType === EmailType.verify_reviewer || emailType === EmailType.verify_buyer) {
        await User.update(userId, {
          where: {
            verify_token: hashedToken,
            verify_token_expiry_date: new Date(Date.now() + 3600000),
          }
        });
        verifyEmailBody = await verifyData(hashedToken, emailType);

      } else if(emailType === EmailType.reminder) {
        if(password){
          reminderEmailBody = await reminderData(email, password, undefined, undefined);
        }else{
          reminderEmailBody = await reminderData(emailBody.contact, undefined, emailBody.date, emailBody.message);
        }
      } else if(emailType === EmailType.request) {
        paymentRequestBody = await requestData(
          emailBody.id, emailBody.total, '+2349061681807', emailBody.link, emailBody.items
        );
      } else {
        await User.update(userId, {
          where: {
            reset_token: hashedToken,
            reset_token_expiry_date: new Date(Date.now() + 3600000),
          }
        });
        resetPasswordEmailBody = await resetPasswordEmailData(hashedToken);
      }

      sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

      const msg: sgMail.MailDataRequired = {
        to: email,
        from: {
          name: 'Oyinye Couture',
          email: 'hello@oyinye.com'
        },
        subject: emailType === EmailType.reset ? "Password Reset" : emailType === EmailType.reminder && password ? 'New Password' : emailType === EmailType.reminder && !password ? 'Appointment Update' : emailType === EmailType.request ? 'Payment Update' : "Verify your Email",
        html: emailType === EmailType.reset ? resetPasswordEmailBody! : emailType === EmailType.request ? paymentRequestBody  : verifyEmailBody!
      };

      await sgMail.send(msg);
      
    });
  } catch (error) {

    throw error;
  }
};
