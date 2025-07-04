import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { FilterService } from './filter.service';
import { Request, Response } from 'express';
import { JwtGuard } from '@app/common';
import { FilterProductsDto } from './dto/filter-product.dto';
import { Csrf } from 'ncsrf';



@Controller('api/products/filter')
export class FilterController {
    constructor(private readonly filterService: FilterService){
        
    }
    
    @UseGuards(JwtGuard)
    @Csrf()
    @Post()
    async updateFilter(@Res() res: Response, @Query('type') type: string, @Body() body: FilterProductsDto){
        return this.filterService.updateFilter(type, body, res);
    }
}
