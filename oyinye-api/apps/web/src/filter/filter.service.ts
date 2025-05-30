import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Filter } from './filter.entity';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';

@Injectable()
export class FilterService {
    constructor(@InjectRepository(Filter) private readonly filterRepo: Repository<Filter>){

    }

    async getFilters(type: string, req: Request, res: Response){
        const {
            noOfFilters,
            isVisible,
            showOutOfStock,
            productType,
            priceRange,
            currentPriceBoundary,
            color,
            customProp,
          } = req.body;

          const filterSettings = await this.filterRepo.find();

          if (filterSettings.length > 0) {
            if (type === "search") {
              await this.filterRepo.updateAll(
                {
                  search: {
                    noOfFilters,
                    isVisible,
                    showOutOfStock,
                    productType,
                    priceRange,
                    currentPriceBoundary,
                  },
                },
         
              );
            }
            if (type === "collections") {
              await this.filterRepo.updateAll(
                {
                  collections: {
                    color,
                    noOfFilters,
                    isVisible,
                    customProperty: customProp,
                  },
                },
    
              );
            }
          } else {
            if (type === "search") {
              const newSettings = this.filterRepo.create({
                search: {
                  noOfFilters,
                  isVisible,
                  showOutOfStock,
                  productType,
                  priceRange,
                  currentPriceBoundary,
                },
              });
      
              await this.filterRepo.save(newSettings);
            }
            if (type === "collections") {
              const newSettings = this.filterRepo.create({
                collections: {
                  color,
                  noOfFilters,
                  isVisible,
                  customProperty: customProp,
                },
              });
      
              await this.filterRepo.save(newSettings);
            }
          }
      
          return res.status(201).json(
            {
              message: "filter settings saved successfully",
              success: true,
            },

          );
    }
}
