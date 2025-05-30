import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartEventController } from './cart.event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart])],
  providers: [CartService],
  controllers: [CartEventController]
})
export class CartModule {}
