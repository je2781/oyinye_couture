import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern('cart_reminder')
  handleCartReminder(@Payload() data) {
    return this.emailService.sendMail(data);
  }

  @EventPattern('payment_request_reminder')
  handlePaymentRequest(@Payload() data) {
    return this.emailService.sendMail(data);
  }

  @EventPattern('password_created')
  handlePasswordCreate(@Payload() data) {
    return this.emailService.sendMail(data);
  }

  @EventPattern('account_verify')
  handleAccountVerify(@Payload() data) {
    return this.emailService.sendMail(data);
  }

  @EventPattern('reviewer_verify')
  handleReviewerVerify(@Payload() data) {
    return this.emailService.sendMail(data);
  }

  @EventPattern('password_reset')
  handlePasswordReset(@Payload() data) {
    return this.emailService.sendMail(data);
  }

  @EventPattern('appointment_reminder')
  handleAppointmnetReminder(@Payload() data) {
    return this.emailService.sendMail(data);
  }
}
