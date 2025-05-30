import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../order/order.entity';
import { Product } from '../product/product.entity';
import { User } from '../user/user.entity';
import { Cart } from './cart.entity';
import { RMQModule } from '@app/common/rmq/rmq.module';
import { ADMIN_SERVICE } from '../constants/service';
import { Visitor } from '../visitor/visitor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, User, Product, Order, Visitor]), RMQModule.register(ADMIN_SERVICE)],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
