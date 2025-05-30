import { Module } from "@nestjs/common";
import { CartModule } from "./cart/cart.module";
import { ProductService } from "./product/product.service";
import { ProductModule } from "./product/product.module";
import { EnquiryModule } from "./enquiry/enquiry.module";
import { OrderModule } from "./order/order.module";
import { UserModule } from "./user/user.module";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "@app/common";
import joi from 'joi';
import { RMQModule } from "@app/common/rmq/rmq.module";

@Module({
  imports: [
    CartModule,
    ProductModule,
    EnquiryModule,
    OrderModule,
    DatabaseModule,
    UserModule,
    RMQModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        DB_PASS: joi.string().required(),
        DB_PORT: joi.number().required(),
        DB_NAME: joi.string().required(),
        DB_USER: joi.string().required(),
        DB_HOST: joi.string().required(),
        PORT: joi.number().required(),
        DEV_RABBITMQ_URL: joi.string().required(),
        PROD_RABBITMQ_URL: joi.string().required(),
        RABBITMQ_ADMIN_QUEUE: joi.string().required(),
      }),
      envFilePath: "./apps/admin/.env",
    }),
  ],
})
export class AdminModule {}
