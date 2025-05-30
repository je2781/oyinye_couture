import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Visitor } from './visitor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VisitorService {
    constructor(@InjectRepository(Visitor) private visitorReo: Repository<Visitor>){

    }

    async getAll(){
        const visitors = await this.visitorReo.find();

        return{
            message: 'visitors retrieved',
            visitors
        };
    }
}
