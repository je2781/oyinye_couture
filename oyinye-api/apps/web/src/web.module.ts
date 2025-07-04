import { Module } from "@nestjs/common";
import { CartModule } from "./cart/cart.module";
import { ProductModule } from "./product/product.module";
import { EnquiryModule } from "./enquiry/enquiry.module";
import { OrderModule } from "./order/order.module";
import { ConfigModule } from "@nestjs/config";
import joi from "joi";
import { ReviewModule } from "./review/review.module";
import { FilterModule } from "./filter/filter.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { DatabaseModule, LoggingInterceptor, RMQModule } from "@app/common";
import { UserModule } from "./user/user.module";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";

@Module({
  imports: [
    CartModule,
    ProductModule,
    EnquiryModule,
    PrometheusModule.register(),
    OrderModule,
    DatabaseModule,
    RMQModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000,
          limit: 10,
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        DB_PASS: joi.string().required(),
        DB_PORT: joi.number().required(),
        DB_NAME: joi.string().required(),
        DB_USER: joi.string().required(),
        DB_HOST: joi.string().required(),
        PORT: joi.string().required(),
        DEV_RABBITMQ_URL: joi.string().required(),
        PROD_RABBITMQ_URL: joi.string().required(),
        RABBITMQ_ADMIN_QUEUE: joi.string().required(),
        RABBITMQ_EMAIL_QUEUE: joi.string().required(),
        RABBITMQ_AUTH_QUEUE: joi.string().required(),
        RABBITMQ_WEB_QUEUE: joi.string().required(),
        NODE_ENV: joi.string().required()
      }),
      envFilePath: ".env.web",
    }),
    ReviewModule,
    FilterModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [RMQModule],
})
export class WebModule {}
