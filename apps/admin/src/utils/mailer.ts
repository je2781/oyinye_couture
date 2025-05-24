import { SendMail } from "@interfaces/send-mail-interface";
import { EmailType } from "@interfaces/send-mail-interface";
import sgMail from "@sendgrid/mail";
import ejs from "ejs";
import path from "path";
import { months } from "@utils/getHelpers";

const reminderData = async (
  to: string,
  password?: string,
  reminderDate?: string,
  body?: string
) => {
  const title = password ? "Your new password." : "Appointment";
  const date =
    reminderDate ??
    `${
      months[new Date().getMonth()]
    } ${new Date().getDate()}. ${new Date().getFullYear()}`;
  const message = password
    ? `Use ${password} to login into your account and access restricted content. If you did not register your details with us, you can ignore and delete this email.`
    : body;

  //preparing email template and its data
  const templatePath = path.join(process.cwd(), "src/templates/reminder.ejs");

  const ejsData = {
    title,
    contact: to,
    message,
    password,
    date,
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
  const header =
    cartItems.length === 0
      ? "Here's a quick view of the total amount this invoice is for, contact the seller for a detailed breakdown of the total amount"
      : "Here's a quick view of the cart items, and the breakdown of the total amount of each item";
  const footer =
    cartItems.length === 0
      ? "Complete payment relax and wait for delivery<br> for this purchase"
      : "Checkout cart and proceed to payment";
  const message =
    cartItems.length === 0
      ? "Awaiting notification of successful payment for order amount below, delivery of purchase will commerce on confirmation"
      : "Waiting on you to finalize cart items and checkout. Offers and promotions will be added at checkout to subsidize payment";
  const actionWord = cartItems.length === 0 ? "PAY" : "VIEW";
  //preparing email template and its data
  const templatePath = path.join(process.cwd(), "src/templates/request.ejs");

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
    cartItems,
  };

  return ejs.renderFile(templatePath, { ...ejsData });
};

export const sendMail = async ({
  password,
  email,
  emailType,
  emailBody,
}: SendMail) => {
  try {
    let htmlContent = "";

    if (emailType === EmailType.reminder) {
      if (password) {
        htmlContent = await reminderData(email, password);
      } else {
        htmlContent = await reminderData(
          emailBody.contact,
          undefined,
          emailBody.date,
          emailBody.message
        );
      }
    } else if (emailType === EmailType.request) {
      htmlContent = await requestData(
        emailBody.id,
        emailBody.total,
        "+2349061681807",
        emailBody.link,
        emailBody.items
      );
    } 

    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

    const msg: sgMail.MailDataRequired = {
      to: email,
      from: {
        name: "Oyinye Couture",
        email: "hello@streetzwyze.com", // Make sure this is a verified sender
      },
      subject:
        emailType === EmailType.reminder && password
          ? "New Password"
          : emailType === EmailType.reminder
          ? "Appointment Update"
          : "Payment Update",
         
      html: htmlContent,
    };

    await sgMail.send(msg);
  } catch (error: any) {
    console.error("SendGrid Error:", error);
    if (error?.response?.body?.errors) {
      console.error(
        "Detailed Errors:",
        JSON.stringify(error.response.body.errors, null, 2)
      );
    }
    throw error;
  }
};
