import { SendMail } from "@/interfaces/send-mail-interface";
import User from "@/models/user";
import { EmailType } from "@/interfaces/send-mail-interface";
import sgMail from '@sendgrid/mail';
import crypto from "crypto";
import ejs from "ejs";
import path from "path";


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

    link: `${process.env.DOMAIN!}/resetpassword/${resetPasswordToken}`,
    year: new Date().getFullYear(),
  };
  return ejs.renderFile(templatePath, { ...ejsData });
};

const newPasswordEmailData = async (
  password: string,
) => {
  const title = "Your new password.";
  const mainInfo =
    "Use this password to book future consultations with your doctor";
  const extraInfo = `If you did not register your details with us, you can ignore and delete this email.`;

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
    isNewPass: true,
    password

  };
  return ejs.renderFile(templatePath, { ...ejsData });
};

const verifyEmailData = async (
  verifyAccountToken: string
) => {
  const title =
    "Please verify your account.";
  const mainInfo =
    "To verify your account, click the button below. The link will self-destruct after 1 hour";
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
    link: `${process.env.DOMAIN!}/verifyemail/${verifyAccountToken}`,
    year: new Date().getFullYear(),
  };

  return ejs.renderFile(templatePath, { ...ejsData });
};

const paymentRequestData = async (
  id: string,
  total: number,
  tel: string,
  paymentUrl: string
) => {

  //preparing email template and its data
  const templatePath = path.join(
    process.cwd(),
    '..',
    'templates/request.ejs'
  );

  const ejsData = {
    total,
    businessTel: tel,
    orderId: id,
    url: paymentUrl,
  };

  return ejs.renderFile(templatePath, { ...ejsData });
};

export const sendMail = async ({ password, email, emailType, userId, emailBody }: SendMail) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      let vendorEmailBody, resetPasswordEmailBody, updatedTo, verifyEmailBody, newPasswordEmailBody, paymentRequestBody  = '';

      //create a hash token
      const hashedToken = buffer.toString("hex");

      if (emailType === EmailType.verify) {
        await User.findOneAndUpdate(userId, {
          verifyToken: hashedToken,
          verifyTokenExpirationDate: new Date(Date.now() + 3600000),
        });
        verifyEmailBody = await verifyEmailData(hashedToken);

      } else if(emailType === EmailType.reminder) {
        if(password){

        }else{

        }
      } else if(emailType === EmailType.request) {
        paymentRequestBody = await paymentRequestData(
          emailBody.id, emailBody.total, '+2349061681807', emailBody.link
        );
      } else {
        await User.findOneAndUpdate(userId, {
          resetToken: hashedToken,
          resetTokenExpirationDate: new Date(Date.now() + 3600000),
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
        subject: emailType === EmailType.reset ? "Password Reset" : emailType === EmailType.reminder && password ? 'New Password' : emailType === EmailType.reminder && !password ? 'Reminder!' : emailType === EmailType.request ? 'Payment Update' : "Verify your Email",
        html: emailType === EmailType.reset ? resetPasswordEmailBody! : emailType === EmailType.request ? paymentRequestBody  : verifyEmailBody!
      };

      await sgMail.send(msg);
      
    });
  } catch (error) {
    throw error;
  }
};
