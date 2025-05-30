import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { RMQModule } from '@app/common/rmq/rmq.module';
import { EMAIL_SERVICE } from '../constants/service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Cart } from '../cart/cart.entity';
import { User } from '../user/user.entity';
import { OrderEventController } from './order.event.controller';

@Module({
  imports: [RMQModule.register(EMAIL_SERVICE), TypeOrmModule.forFeature([Cart, Order])],
  providers: [OrderService],
  controllers: [OrderController, OrderEventController]
})
export class OrderModule {}
