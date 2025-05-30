import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Visitor } from "../visitor/visitor.entity";
import { RMQModule } from "@app/common/rmq/rmq.module";
import { ADMIN_SERVICE, EMAIL_SERVICE } from "../constants/service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Visitor]),
    RMQModule.register(EMAIL_SERVICE),
    RMQModule.register(ADMIN_SERVICE),
  ],
  providers: [UserService],
})
export class UserModule {}
