import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';
import { ProductModule } from './product/product.module';
import { EnquiryModule } from './enquiry/enquiry.module';
import { OrderModule } from './order/order.module';
import { DatabaseModule } from '@app/common';
import { VisitorModule } from './visitor/visitor.module';
import { UserModule } from './user/user.module';
import { RMQModule } from '@app/common/rmq/rmq.module';
import { ConfigModule } from '@nestjs/config';
import joi from 'joi';
import { HttpModule } from '@nestjs/axios';
import { ReviewController } from './review/review.controller';
import { ReviewModule } from './review/review.module';
import { FilterModule } from './filter/filter.module';

@Module({
  imports: [    CartModule,
      ProductModule,
      EnquiryModule,
      OrderModule,
      DatabaseModule,
      VisitorModule,
      UserModule,
      RMQModule,
      HttpModule,
      ConfigModule.forRoot({
        isGlobal: true,
        validationSchema: joi.object({
          DB_PASS: joi.string().required(),
          DB_PORT: joi.number().required(),
          DB_NAME: joi.string().required(),
          DB_USER: joi.string().required(),
          DB_HOST: joi.string().required(),
          JWT_SECRET: joi.string().required(),
          PORT: joi.number().required(),
          DEV_RABBITMQ_URL: joi.string().required(),
          PROD_RABBITMQ_URL: joi.string().required(),
          RABBITMQ_ADMIN_QUEUE: joi.string().required(),
          RABBITMQ_EMAIL_QUEUE: joi.string().required(),
        }),
        envFilePath: "./apps/web/.env",
      }),
      ReviewModule,
      FilterModule,],
  controllers: [ReviewController],

})
export class WebModule {}
