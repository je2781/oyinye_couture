import { Module } from "@nestjs/common";
import { EnquiryController } from "./enquiry.controller";
import { EnquiryEventController } from "./enquiry.event.controller";
import { EnquiryService } from "./enquiry.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AUTH_SERVICE, EMAIL_SERVICE } from "../constants/service";
import { RMQModule } from "@app/common";
import { Enquiry } from "./enquiry.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Enquiry]),
    RMQModule.register(EMAIL_SERVICE),
    RMQModule.register(AUTH_SERVICE),
  ],
  controllers: [EnquiryController, EnquiryEventController],
  providers: [EnquiryService],
})
export class EnquiryModule {}
