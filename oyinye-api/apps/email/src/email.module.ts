import { Module } from "@nestjs/common";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";
import { ConfigModule } from "@nestjs/config";
import joi from "joi";
import { RMQModule } from "@app/common/rmq/rmq.module";
import { AUTH_SERVICE } from "./constants/service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        SENDGRID_API_KEY: joi.string().required(),
        DEV_RABBITMQ_URL: joi.string().required(),
        NODE_ENV: joi.string().required(),
        PROD_RABBITMQ_URL: joi.string().required(),
        RABBITMQ_EMAIL_QUEUE: joi.string().required(),
        RABBITMQ_AUTH_QUEUE: joi.string().required(),
        APP_NAME: joi.string().required(),
      }),
      envFilePath: ".env.email",
    }),
    RMQModule.register(AUTH_SERVICE),
  ],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
