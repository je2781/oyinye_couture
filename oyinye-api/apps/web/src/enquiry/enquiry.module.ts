import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EnquiryController } from "./enquiry.controller";
import { EnquiryService } from "./enquiry.service";
import { RMQModule } from "@app/common/rmq/rmq.module";
import { ADMIN_SERVICE, AUTH_SERVICE, EMAIL_SERVICE } from "../constants/service";
import { Enquiry } from "./enquiry.entity";
import { User } from "../user/user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Enquiry, User]),
    RMQModule.register(ADMIN_SERVICE),
    RMQModule.register(EMAIL_SERVICE),
    RMQModule.register(AUTH_SERVICE),
  ],
  controllers: [EnquiryController],
  providers: [EnquiryService],
})
export class EnquiryModule {}
