import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import joi from 'joi';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        SENDGRID_API_KEY:joi.string().required(),
        DEV_RABBITMQ_URL:joi.string().required(),
        PROD_RABBITMQ_URL:joi.string().required(),
        RABBITMQ_EMAIL_QUEUE:joi.string().required()
      }),
      envFilePath: './apps/email/.env'
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
