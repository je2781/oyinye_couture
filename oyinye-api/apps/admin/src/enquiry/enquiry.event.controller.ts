import { Controller, UseGuards } from "@nestjs/common";
import { EnquiryService } from "./enquiry.service";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { JwtGuard, RMQService } from "@app/common";

@Controller()
@UseGuards(JwtGuard)
export class EnquiryEventController{
    constructor(private readonly enquiryService: EnquiryService, private readonly rmqService: RMQService){

    }

    @EventPattern('enquiry_created')
    async handleEnquiryCreate(@Payload() data, @Ctx() context: RmqContext){
       await this.enquiryService.createEnquiry(data.enquiry);
       this.rmqService.ack(context);
    }

 
}