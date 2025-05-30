import { Module } from '@nestjs/common';
import { VisitorService } from './visitor.service';
import { VisitorController } from './visitor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visitor } from './visitor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Visitor])],
  providers: [VisitorService],
  controllers: [VisitorController]
})
export class VisitorModule {}
