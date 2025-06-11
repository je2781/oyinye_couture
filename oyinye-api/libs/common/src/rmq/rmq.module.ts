import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RMQService } from './rmq.service';

@Module({
  exports: [RMQService],
  providers: [RMQService]
    
})
export class RMQModule {
    static register(name: string):DynamicModule {
        return{
            module: RMQModule,
            imports: [
                ClientsModule.registerAsync([
                    {
                      name,
                      imports: [ConfigModule], // Required for ConfigService
                      useFactory: async (configService: ConfigService) => ({
                        transport: Transport.RMQ,
                        options: {
                          urls: [
                            configService.get<string>("NODE_ENV")! === 'development' ? configService.get<string>("DEV_RABBITMQ_URL")! : configService.get<string>("PROD_RABBITMQ_URL")!  
                          ],
                          queue: configService.get<string>(`RABBITMQ_${name}_QUEUE`),
                        },
                      }),
                      inject: [ConfigService],
                    },
                  ]),
            ],
            exports: [ClientsModule]
        };
    }
}
