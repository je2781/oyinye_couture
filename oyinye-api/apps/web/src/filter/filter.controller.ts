import { Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { FilterService } from './filter.service';
import { Request, Response } from 'express';
import { RateLimitGuard } from 'libs/common/guard/rate-limit.guard';


@Controller('products/filter')
@UseGuards(RateLimitGuard)
export class FilterController {
    constructor(private readonly filterService: FilterService){

    }

    @Post()
    async getFilters(@Req() req: Request, @Res() res: Response, @Query('type') type: string){
        return this.filterService.getFilters(type, req, res);
    }
}
