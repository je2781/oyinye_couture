import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { RMQModule } from '@app/common/rmq/rmq.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Cart } from '../cart/cart.entity';
import { User } from '../user/user.entity';
import { ADMIN_SERVICE } from '../constants/service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [RMQModule.register(ADMIN_SERVICE), TypeOrmModule.forFeature([Cart, Order, User]), HttpModule],
  providers: [OrderService],
  controllers: [OrderController]
})
export class OrderModule {}
