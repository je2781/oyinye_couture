import { Controller, UseGuards } from "@nestjs/common";
import { OrderService } from "./order.service";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { JwtGuard, RMQService } from "@app/common";

@Controller()
@UseGuards(JwtGuard)
export class OrderEventController {
  constructor(private readonly orderService: OrderService, private readonly rmqService: RMQService) {}

  @EventPattern("order_updated")
  async handleOrderUpdate(@Payload() update, @Ctx() context: RmqContext) {
    await  this.orderService.updateOrder(update.id, update.data);
    this.rmqService.ack(context);
  }

  @EventPattern("order_created")
  async handleOrderCreate(@Payload() data, @Ctx() context: RmqContext) {
    await this.orderService.createOrder(data.order);
    this.rmqService.ack(context);
  }

}
