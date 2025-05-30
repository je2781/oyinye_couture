import { Body, Controller, Get, Param, Patch, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RateLimitGuard } from 'libs/common/guard/rate-limit.guard';
import { Response } from 'express';
import { UpdateAdminUserDto } from './dto/update-admin-user.dt';
import { JwtGuard } from 'libs/common/guard';

@Controller('users')
@UseGuards(RateLimitGuard)
@UseGuards(JwtGuard)
export class UserController {
    constructor(private readonly userService: UserService){

    }

    @Get(':id')
    getUser(@Param('id') id: string, @Res() res: Response){
        return this.userService.getUser(id, res);
    }

    @Patch(':id')
    updateUser(@Param('id') id: string, @Res() res: Response, @Body() user: UpdateAdminUserDto){
        return this.userService.updateUserPersonalDetails(id, res, user);
    }
}

























