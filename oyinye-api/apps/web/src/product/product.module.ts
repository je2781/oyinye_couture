import { Module } from "@nestjs/common";
import { ProductController } from "./product.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RMQModule } from "@app/common";
import { ADMIN_SERVICE, AUTH_SERVICE, EMAIL_SERVICE } from "../constants/service";
import { ProductService } from "./product.service";
import { Product } from "./product.entity";
import { Order } from "../order/order.entity";
import { Filter } from "../filter/filter.entity";
import { User } from "../user/user.entity";
import { Review } from "../review/review.entity";
import { Cart } from "../cart/cart.entity";
import { ProductEventController } from "./product.event.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Cart, Review, User, Filter, Order]),
    RMQModule.register(EMAIL_SERVICE),
    RMQModule.register(ADMIN_SERVICE),
    RMQModule.register(AUTH_SERVICE),
  ],
  controllers: [ProductController, ProductEventController],
  providers: [ProductService],
})
export class ProductModule {}
