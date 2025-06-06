import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { CartService } from "./cart.service";
import { Controller, UseGuards } from "@nestjs/common";
import { JwtGuard, RMQService } from "@app/common";

@Controller()
@UseGuards(JwtGuard)
export class CartEventController{
    constructor(private readonly cartService: CartService, private readonly rmqService: RMQService){

    }

    @EventPattern("cart_destroyed")
    async handleCartDestroy(@Payload() data: any, @Ctx() context: RmqContext) {
      await this.cartService.deleteCart(data.id);
      this.rmqService.ack(context);
    }

    @EventPattern("cart_updated")
    async handleCartUpdate(@Payload() update, @Ctx() context: RmqContext) {
      await this.cartService.updateCart(update.id, update.data);
      this.rmqService.ack(context);
    }

    @EventPattern("cart_created")
    async handleCartCreate(@Payload() data, @Ctx() context: RmqContext) {
      await this.cartService.createCart(data);
      this.rmqService.ack(context);
    }
}