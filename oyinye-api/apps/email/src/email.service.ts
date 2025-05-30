import { Injectable, InternalServerErrorException } from "@nestjs/common";
import sgMail from '@sendgrid/mail';
import ejs from "ejs";
import * as path from "path";
import { EmailType, SendMail } from "libs/common/interfaces";
import { ConfigService } from "@nestjs/config";
import { months } from "libs/common/utils/getHelpers";

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get<string>("SENDGRID_API_KEY")!);
  }

  private async renderTemplate(
    templateName: string,
    data: any
  ): Promise<string> {
    const templatePath = path.join(
      __dirname,
      "..",
      "..",
      "libs/common/templates",
      `${templateName}.ejs`
    );
    return ejs.renderFile(templatePath, data);
  }

  private async resetPasswordEmailData(token: string) {
    return this.renderTemplate('notification', {
      title: 'Forgot your password? It happens to the best of us.',
      mainInfo: 'To reset your password, click the button below. The link will self-destruct after 1 hour',
      extraInfo: `If you do not want to change your password or didn't request a reset, you can ignore and delete this email.`,
      isNewPass: false,
      isReset: true,
      link: `${process.env.DOMAIN}/resetpassword?token=${token}`,
      year: new Date().getFullYear(),
    });
  }

  private async reminderEmail(
    to: string,
    password?: string,
    date?: string,
    message?: string
  ) {
    const data = {
      title: password ? "Your new password." : "Appointment",
      contact: to,
      date:
        date ??
        `${
          months[new Date().getMonth()]
        } ${new Date().getDate()}. ${new Date().getFullYear()}`,
      message: password
        ? "Use this password to login into your account and access restricted content. If you did not register your details with us, you can ignore and delete this email."
        : message,
    };
    return this.renderTemplate("reminder", data);
  }

  private async verifyData(token: string, emailType: EmailType) {
    const linkType = emailType === EmailType.verify_account ? 'account' : emailType === EmailType.verify_reviewer ? 'reviewer' : 'buyer';
    return this.renderTemplate('notification', {
      title: emailType === EmailType.verify_account
        ? 'Please verify your account.'
        : emailType === EmailType.verify_reviewer
        ? 'Please verify you wrote a review'
        : 'Please verify you made a purchase.',
      mainInfo: 'To verify your credentials, click the button below. The link will self-destruct after 1 hour',
      extraInfo: `If you weren’t expecting this, you can ignore and delete this email.`,
      isNewPass: false,
      isReset: false,
      link: `${process.env.DOMAIN}/verifyemail/${linkType}?token=${token}`,
      year: new Date().getFullYear(),
    });
  }

  private async requestEmail(
    id: string,
    total: number,
    tel: string,
    link: string,
    items: any[]
  ) {
    const isCart = items.length > 0;
    const data = {
      id,
      total,
      businessTel: tel,
      url: link,
      footer: isCart
        ? "Checkout cart and proceed to payment"
        : "Complete payment relax and wait for delivery<br> for this purchase",
      actionWord: isCart ? "VIEW" : "PAY",
      header: isCart
        ? "Here's a quick view of the cart items, and the breakdown of the total amount of each item"
        : "Here's a quick view of the total amount this invoice is for, contact the seller for a detailed breakdown of the total amount",
      message: isCart
        ? "Waiting on you to finalize cart items and checkout. Offers and promotions will be added at checkout to subsidize payment"
        : "Awaiting notification of successful payment for order amount below, delivery of purchase will commerce on confirmation",
      cartItems: items,
      isCart,
    };
    return this.renderTemplate("request", data);
  }

  async sendMail({ password, email, emailType, userId, emailBody, token }: SendMail): Promise<void> {
    let html = '';
    let subject = 'Notification from Oyinye Couture';

    try {
      switch (emailType) {
        case EmailType.verify_account:
        case EmailType.verify_reviewer:
        case EmailType.verify_buyer:
          html = await this.verifyData(token!, emailType);
          subject = 'Verify your Email';
          break;

        case EmailType.reset:
          html = await this.resetPasswordEmailData(token!);
          subject = 'Reset your Password';
          break;

        case EmailType.reminder:
          html = await this.reminderEmail(
            password ? email : emailBody.contact,
            password,
            emailBody?.date,
            emailBody?.message
          );
          subject = password ? 'Your New Password' : 'Appointment Reminder';
          break;

        case EmailType.request:
          html = await this.requestEmail(
            emailBody.id,
            emailBody.total,
            '+2349061681807',
            emailBody.link,
            emailBody.items
          );
          subject = 'Payment Request';
          break;

       
      }

      const msg: sgMail.MailDataRequired = {
        to: email,
        from: { name: 'Oyinye Couture', email: 'hello@streetzwyze.com' },
        subject,
        html,
      };

      await sgMail.send(msg);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

}
