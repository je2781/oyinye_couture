import { Controller, UseGuards } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { ProductService } from "./product.service";
import { JwtGuard, RMQService } from "@app/common";

@Controller()
@UseGuards(JwtGuard)
export class ProductEventController{
    constructor( private productService: ProductService, private rqmService: RMQService){}

    @EventPattern('product_created')
    async handleProductCreated(@Payload() data, @Ctx() context: RmqContext){
        await this.productService.createProduct(data.product);
        this.rqmService.ack(context);
    }

    @EventPattern('product_updated')
    async handleProductUpdated(@Payload() update, @Ctx() context: RmqContext){
        await this.productService.updateProduct(update.id, update.data);
        this.rqmService.ack(context);
    }
}