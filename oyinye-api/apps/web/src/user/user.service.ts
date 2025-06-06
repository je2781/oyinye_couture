import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepo: Repository<User>){

    }

    async createUser(data: any){
        await this.userRepo.save(data);
    }

    async updateUser(id: string, data: any){
        await this.userRepo.update(id, data);
    }
}
