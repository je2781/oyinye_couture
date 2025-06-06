import { Module } from "@nestjs/common";
import { CartService } from "./cart.service";
import { CartEventController } from "./cart.event.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cart } from "./cart.entity";
import { RMQModule } from "@app/common";
import { AUTH_SERVICE } from "../constants/service";

@Module({
  imports: [TypeOrmModule.forFeature([Cart]), RMQModule.register(AUTH_SERVICE)],
  providers: [CartService],
  controllers: [CartEventController],
})
export class CartModule {}
