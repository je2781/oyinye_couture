import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { Controller, UseGuards } from "@nestjs/common";
import { JwtGuard, RMQService } from "@app/common";
import { UserService } from "./user.service";

@Controller()
@UseGuards(JwtGuard)
export class UserEventController{
    constructor(private userService: UserService, private readonly rmqService: RMQService){

    }

    @EventPattern('user_created')
    async handleUserCreate(@Payload() data, @Ctx() context: RmqContext){
        await this.userService.createUser(data);
        this.rmqService.ack(context);
    }

    @EventPattern('user_updated')
    async handleUserDetails(@Payload() update, @Ctx() context: RmqContext){
        await this.userService.updateUserDetails(update.id, update.data);
        this.rmqService.ack(context);
    }

}