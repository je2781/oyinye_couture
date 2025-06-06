import { Module } from "@nestjs/common";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RMQModule } from "@app/common/rmq/rmq.module";
import { ADMIN_SERVICE, AUTH_SERVICE } from "../constants/service";
import { Product } from "../product/product.entity";
import { Order } from "../order/order.entity";
import { User } from "../user/user.entity";
import { Cart } from "./cart.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, User, Product, Order]),
    RMQModule.register(ADMIN_SERVICE),
    RMQModule.register(AUTH_SERVICE),
  ],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
