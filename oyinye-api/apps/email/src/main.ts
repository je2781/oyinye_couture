import { NestFactory } from '@nestjs/core';
import { RMQService } from '@app/common/rmq/rmq.service';
import { EmailModule } from './email.module';

async function bootstrap() {
  const app = await NestFactory.create(EmailModule);
  const rmqService = app.get<RMQService>(RMQService);
  app.connectMicroservice(rmqService.getOptions('EMAIL'));
  await app.startAllMicroservices();
}
bootstrap();
