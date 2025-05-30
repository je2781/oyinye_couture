import { Controller, Get } from '@nestjs/common';
import { VisitorService } from './visitor.service';

@Controller('visitors')
export class VisitorController {
    constructor(private readonly visitorService: VisitorService){}

    @Get()
    async getAll(){
        return this.visitorService.getAll();
    }
}
