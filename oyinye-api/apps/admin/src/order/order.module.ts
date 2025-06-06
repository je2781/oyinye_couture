import { Module } from "@nestjs/common";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { RMQModule } from "@app/common/rmq/rmq.module";
import { AUTH_SERVICE, EMAIL_SERVICE } from "../constants/service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderEventController } from "./order.event.controller";
import { Order } from "./order.entity";
import { Cart } from "../cart/cart.entity";
import { User } from "../user/user.entity";

@Module({
  imports: [
    RMQModule.register(EMAIL_SERVICE),
    RMQModule.register(AUTH_SERVICE),
    TypeOrmModule.forFeature([Order, Cart, User]),
  ],
  providers: [OrderService],
  controllers: [OrderController, OrderEventController],
})
export class OrderModule {}
