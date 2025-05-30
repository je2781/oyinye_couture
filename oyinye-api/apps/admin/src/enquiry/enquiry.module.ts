import { Module } from '@nestjs/common';
import { EnquiryController } from './enquiry.controller';
import { EnquiryEventController } from './enquiry.event.controller';
import { EnquiryService } from './enquiry.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Enquiry } from './enquiry.entity';
import { RMQModule } from '@app/common/rmq/rmq.module';
import { EMAIL_SERVICE } from '../constants/service';

@Module({
    imports: [TypeOrmModule.forFeature([Enquiry, User]), RMQModule.register(EMAIL_SERVICE)],
    controllers: [EnquiryController, EnquiryEventController],
    providers: [EnquiryService]
})
export class EnquiryModule {}
