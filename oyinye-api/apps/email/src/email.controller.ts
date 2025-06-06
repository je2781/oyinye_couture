import { Controller, Get, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { JwtGuard, RMQService } from '@app/common';

@Controller()
@UseGuards(JwtGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService, private rmqService: RMQService) {}

  @EventPattern('cart_reminder')
 async handleCartReminder(@Payload() data, @Ctx() context: RmqContext) {
    await this.emailService.sendMail(data);
    this.rmqService.ack(context);
  }

  @EventPattern('payment_request_reminder')
  async handlePaymentRequest(@Payload() data, @Ctx() context: RmqContext) {
    await this.emailService.sendMail(data);
    this.rmqService.ack(context);
  }

  @EventPattern('password_created')
  async handlePasswordCreate(@Payload() data, @Ctx() context: RmqContext) {
    await this.emailService.sendMail(data);
    this.rmqService.ack(context);
  }

  @EventPattern('account_verify')
  async handleAccountVerify(@Payload() data, @Ctx() context: RmqContext) {
    await this.emailService.sendMail(data);
    this.rmqService.ack(context);
  }

  @EventPattern('reviewer_verify')
  async handleReviewerVerify(@Payload() data, @Ctx() context: RmqContext) {
    await this.emailService.sendMail(data);
    this.rmqService.ack(context);
  }

  @EventPattern('password_reset')
  async handlePasswordReset(@Payload() data, @Ctx() context: RmqContext) {
    await this.emailService.sendMail(data);
    this.rmqService.ack(context);
  }

  @EventPattern('appointment_reminder')
  async handleAppointmnetReminder(@Payload() data, @Ctx() context: RmqContext) {
    await this.emailService.sendMail(data);
    this.rmqService.ack(context);
  }
}
