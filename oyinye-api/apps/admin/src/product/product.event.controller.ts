import { Controller, UseGuards } from "@nestjs/common";
import { ProductService } from "./product.service";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { JwtGuard, RMQService } from "@app/common";

@Controller()
@UseGuards(JwtGuard)
export class ProductEventController{
    constructor(private productService: ProductService, private rmqService: RMQService){}

    @EventPattern('product_updated')
    async handleProductUpdated(@Payload() update, @Ctx() context: RmqContext){
        await this.productService.updateProductReviews(update.id, update.data);
        this.rmqService.ack(context);
    }
}