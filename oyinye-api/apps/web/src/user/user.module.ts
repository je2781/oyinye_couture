import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserEventController } from "./user.event.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { RMQModule } from "@app/common";
import { AUTH_SERVICE } from "../constants/service";

@Module({
  imports: [TypeOrmModule.forFeature([User]), RMQModule.register(AUTH_SERVICE), RMQModule],
  controllers: [UserEventController],
  providers: [UserService],
})
export class UserModule {}
