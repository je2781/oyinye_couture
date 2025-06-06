import { Body, Controller, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from '@app/common';
import { Csrf } from 'ncsrf';

@Controller('api/auth/users')
export class UserController {
    constructor(private readonly userService: UserService){}

    @Get(':id')
    async getUser(@Param('id') id: string, @Res() res: Response){
        return this.userService.getUser(id, res);
    }

    @Patch(':id')
    @Csrf()
    @UseGuards(JwtGuard)
    async updateUser(@Param('id') id: string, @Req() req: Request, @Res() res: Response, @Body() user: UpdateUserDto){
        return this.userService.updateUser(req, id, res, user);
    }

}
