import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RmqContext, RmqOptions, Transport } from "@nestjs/microservices";

@Injectable()
export class RMQService {
  constructor(private readonly configService: ConfigService) {}

  getOptions(queue: string, noAck = false): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        noAck,
        urls: [
          this.configService.get<string>("PROD_RABBITMQ_URL")! 

        ],
        queue: this.configService.get<string>(`RABBITMQ_${queue}_QUEUE`)!,
        persistent: true
      },
    };
  }

  ack(context: RmqContext){
    const channnel = context.getChannelRef();
    const orginalMessage = context.getMessage();
    channnel.ack(orginalMessage);
  }
}
