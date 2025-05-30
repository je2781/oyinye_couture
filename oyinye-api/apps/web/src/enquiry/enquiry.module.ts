import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visitor } from '../visitor/visitor.entity';
import { Enquiry } from './enquiry.entity';
import { User } from '../user/user.entity';
import { EnquiryController } from './enquiry.controller';
import { EnquiryService } from './enquiry.service';
import { RMQModule } from '@app/common/rmq/rmq.module';
import { ADMIN_SERVICE, EMAIL_SERVICE } from '../constants/service';

@Module({
    imports: [TypeOrmModule.forFeature([Enquiry, User, Visitor]), RMQModule.register(ADMIN_SERVICE), RMQModule.register(EMAIL_SERVICE)],
    controllers: [EnquiryController],
    providers: [EnquiryService]
})
export class EnquiryModule {}
