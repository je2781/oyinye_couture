import { Module } from "@nestjs/common";
import { FilterService } from "./filter.service";
import { FilterController } from "./filter.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Filter } from "./filter.entity";
import { RMQModule } from "@app/common";
import { AUTH_SERVICE } from "../constants/service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Filter]),
    RMQModule.register(AUTH_SERVICE),
  ],
  providers: [FilterService],
  controllers: [FilterController],
})
export class FilterModule {}
