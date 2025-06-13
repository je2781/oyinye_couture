import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RMQModule } from "@app/common/rmq/rmq.module";
import { UserController } from "./user.controller";
import { UserEventController } from "./user.event.controller";
import { User } from "../entities/user.entity";
import {
  ADMIN_SERVICE,
  AUTH_SERVICE,
  EMAIL_SERVICE,
  WEB_SERVICE,
} from "../constants/service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RMQModule.register(EMAIL_SERVICE),
    RMQModule.register(AUTH_SERVICE),
    RMQModule.register(ADMIN_SERVICE),
    RMQModule.register(WEB_SERVICE),
  ],
  providers: [UserService],
  controllers: [UserController, UserEventController],
})
export class UserModule {}
