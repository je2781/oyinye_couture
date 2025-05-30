import { Controller } from "@nestjs/common";
import { EnquiryService } from "./enquiry.service";
import { EventPattern, Payload } from "@nestjs/microservices";

@Controller()
export class EnquiryEventController{
    constructor(private readonly enquiryService: EnquiryService){

    }

    @EventPattern('enquiry_created')
    async handleEnquiryCreate(@Payload() data){
       await this.enquiryService.createEnquiry(data);
    }
}