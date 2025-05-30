import { Body, Controller, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { RateLimitGuard } from 'libs/common/guard/rate-limit.guard';
import { CreateUserDto } from './dto/creat-user.dto';

@Controller('users')
@UseGuards(RateLimitGuard)
export class UserController {
    constructor(private readonly userService: UserService){}

    @Get(':id')
    async getUser(@Param('id') id: string, @Res() res: Response){
        return this.userService.getUser(id, res);
    }

    @Patch(':id')
    async updateUser(@Param('id') id: string, @Res() res: Response, @Body() user: UpdateUserDto){
        return this.userService.updateUser(id, res, user);
    }

    @Post('login')
    async createSession(@Res() res: Response, @Body() user: {email: string, password: string}){
        return this.userService.createSession(res, user);
    }

    @Post('logout')
    async endSession(@Res() res: Response){
        return this.userService.endSession(res);
    }

    @Post('new-password')
    async forgotPassword(@Res() res: Response, @Req() req: Request){
        return this.userService.forgotPassword(req, res);
    }

    @Post('reset')
    async resetPassword(@Res() res: Response, @Req() req: Request){
        return this.userService.forgotPassword(req, res);
    }

    @Post('signup')
    async register(@Res() res: Response, @Body() body: CreateUserDto, @Req() req: Request){
        return this.userService.register(res, body, req);
    }

    @Get('verify-email/:type/:token')
    async verifyEmail(@Param() params: {type: string, token: string}, @Res() res: Response){
        return this.userService.verifyEmail(params, res);
    }
}
