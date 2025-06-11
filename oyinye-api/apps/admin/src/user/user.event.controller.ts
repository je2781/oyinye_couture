import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { UserService } from "./user.service";
import { Controller, UseGuards } from "@nestjs/common";
import { JwtGuard, RMQService } from "@app/common";

@Controller()
@UseGuards(JwtGuard)
export class UserEventController{
    constructor(private readonly userService: UserService, private rmqService: RMQService){

    }

    @EventPattern('user_created')
    async handleUserCreate(@Payload() data, @Ctx() context: RmqContext){
        await this.userService.createUser(data.user);
        this.rmqService.ack(context);
    }

    @EventPattern('user_updated')
    async handleUserUpdate(@Payload() update, @Ctx() context: RmqContext){
        await this.userService.updateUser(update.id, update.data);
        this.rmqService.ack(context);
    }
}