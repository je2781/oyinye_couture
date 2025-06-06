import { Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { FilterService } from './filter.service';
import { Request, Response } from 'express';
import { JwtGuard } from '@app/common';
import { Csrf } from 'ncsrf';



@Controller('api/products/filter')
export class FilterController {
    constructor(private readonly filterService: FilterService){
        
    }
    
    @UseGuards(JwtGuard)
    @Csrf()
    @Post()
    async getFilters(@Req() req: Request, @Res() res: Response, @Query('type') type: string){
        return this.filterService.getFilters(type, req, res);
    }
}
