import { Controller } from "@nestjs/common";
import { OrderService } from "./order.service";
import { EventPattern, Payload } from "@nestjs/microservices";

@Controller()
export class OrderEventController {
  constructor(private readonly orderService: OrderService) {}

  @EventPattern("order_updated")
  async handleOrderUpdate(@Payload() update) {
    return this.orderService.updateOrder(update.id, update.data);
  }

  @EventPattern("order_created")
  async handleOrderCreate(@Payload() data) {
    await this.orderService.createOrder(data);
  }

}
