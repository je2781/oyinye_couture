import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserEventController } from "./user.event.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { AUTH_SERVICE } from "../constants/service";
import { RMQModule } from "@app/common";

@Module({
  imports: [TypeOrmModule.forFeature([User]), RMQModule.register(AUTH_SERVICE), RMQModule],
  controllers: [UserEventController],
  providers: [UserService],
})
export class UserModule {}
