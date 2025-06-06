import { Module } from "@nestjs/common";
import { ProductService } from "./product.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductController } from "./product.controller";
import { Product } from "./product.entity";
import { RMQModule } from "@app/common";
import { AUTH_SERVICE } from "../constants/service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    RMQModule.register(AUTH_SERVICE),
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
