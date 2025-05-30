import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from '../review/review.entity';
import { Cart } from '../cart/cart.entity';
import { Product } from './product.entity';
import { Visitor } from '../visitor/visitor.entity';
import { User } from '../user/user.entity';
import { Filter } from '../filter/filter.entity';
import { Order } from '../order/order.entity';
import { RMQModule } from '@app/common/rmq/rmq.module';
import { ADMIN_SERVICE, EMAIL_SERVICE } from '../constants/service';
import { ProductService } from './product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Product, Cart, User, Visitor, Filter, Order]), RMQModule.register(EMAIL_SERVICE), RMQModule.register(ADMIN_SERVICE)],
  controllers: [ProductController],
  providers: [ProductService]
})
export class ProductModule {}
