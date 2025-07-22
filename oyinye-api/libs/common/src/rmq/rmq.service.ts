import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RmqContext, RmqOptions, Transport } from "@nestjs/microservices";
import * as fs from "fs";
import * as path from 'path';

@Injectable()
export class RMQService {
  constructor(private readonly configService: ConfigService) {}

  getOptions(queue: string, noAck = false): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        noAck,
        urls: [
          this.configService.get<string>("NODE_ENV")! === "development"
            ? this.configService.get<string>("DEV_RABBITMQ_URL")!
            : this.configService.get<string>("PROD_RABBITMQ_URL")!,
        ],
        queue: this.configService.get<string>(`RABBITMQ_${queue}_QUEUE`)!,
        queueOptions: {
          durable: true,
        },
        persistent: true,
        socketOptions: {
          cert: fs.readFileSync(path.join(process.cwd(), 'rabbitmqCerts', 'client-cert.pem')),
          key: fs.readFileSync(path.join(process.cwd(), 'rabbitmqCerts', 'client-key.pem')),
          ca: [fs.readFileSync(path.join(process.cwd(), 'rabbitmqCerts', 'ca-chain.pem'))],
          rejectUnauthorized: true,
        },
      },
    };
  }

  ack(context: RmqContext) {
    const channnel = context.getChannelRef();
    const orginalMessage = context.getMessage();
    channnel.ack(orginalMessage);
  }
}
