import { Module } from '@nestjs/common';
import { FilterService } from './filter.service';
import { FilterController } from './filter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Filter } from './filter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Filter])],
  providers: [FilterService],
  controllers: [FilterController]
})
export class FilterModule {}
