import { EventPattern, Payload } from "@nestjs/microservices";
import { UserService } from "./user.service";
import { Controller } from "@nestjs/common";

@Controller()
export class UserEventController{
    constructor(private userService: UserService){

    }

    @EventPattern('user_created')
    async handleUserCreate(@Payload() data){
        await this.userService.createUser(data);
    }

    @EventPattern('user_updated')
    async handleUserOrderDetailsUpdate(@Payload() update){
        await this.userService.updateUserOrderDetails(update.id, update.data);
    }

}