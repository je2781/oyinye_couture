import { EventPattern, Payload } from "@nestjs/microservices";
import { CartService } from "./cart.service";
import { Controller } from "@nestjs/common";

@Controller()
export class CartEventController{
    constructor(private readonly cartService: CartService){

    }

    @EventPattern("cart_destroyed")
    async handleCartDestroy(@Payload() cartId: string) {
      await this.cartService.deleteCart(cartId);
    }

    @EventPattern("cart_updated")
    async handleCartUpdate(@Payload() update) {
      await this.cartService.updateCart(update.id, update.data);
    }

    @EventPattern("cart_created")
    async handleCartCreate(@Payload() data) {
      await this.cartService.createCart(data);
    }
}