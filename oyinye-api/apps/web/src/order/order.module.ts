import { Module } from "@nestjs/common";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { RMQModule } from "@app/common/rmq/rmq.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cart } from "../cart/cart.entity";
import { ADMIN_SERVICE, AUTH_SERVICE } from "../constants/service";
import { HttpModule } from "@nestjs/axios";
import { User } from "../user/user.entity";
import { Order } from "./order.entity";

@Module({
  imports: [
    RMQModule.register(ADMIN_SERVICE),
    RMQModule.register(AUTH_SERVICE),
    TypeOrmModule.forFeature([Cart, Order, User]),
    HttpModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
