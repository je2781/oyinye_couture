import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Filter } from './filter.entity';
import { Repository } from 'typeorm';
import { FilterProductsDto } from './dto/filter-product.dto';
import { Response } from 'express';

@Injectable()
export class FilterService {
  constructor(
    @InjectRepository(Filter)
    private readonly filterRepo: Repository<Filter>
  ) {}


  async updateFilter(
    type: string,
    body: FilterProductsDto,
    res: Response
  ) {
    const {
      noOfFilters,
      isVisible,
      showOutOfStock,
      productType,
      priceRange,
      currentPriceBoundary,
      color,
      customProp,
    } = body;

    const [existing] = await this.filterRepo.find();

    const searchPayload = {
      noOfFilters,
      isVisible,
      showOutOfStock,
      productType,
      priceRange,
      currentPriceBoundary,
    };

    const collectionsPayload = {
      color,
      noOfFilters,
      isVisible,
      customProperty: customProp,
    };

    if (existing) {
      await this.filterRepo.update(existing.id, {
        [type]: type === 'search' ? searchPayload : collectionsPayload,
      });
    } else {
      const newFilter = this.filterRepo.create({
        [type]: type === 'search' ? searchPayload : collectionsPayload,
      });
      await this.filterRepo.save(newFilter);
    }

    return res.status(201).send({
      message: 'Filter settings saved successfully',
      success: true,
    });
  }
}
