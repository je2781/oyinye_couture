import { NestFactory } from '@nestjs/core';
import { RMQService } from '@app/common/rmq/rmq.service';
import { ValidationPipe } from '@nestjs/common';
import { AdminModule } from './admin.module';
import cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AdminModule);
  const rmqService = app.get<RMQService>(RMQService);
  app.connectMicroservice(rmqService.getOptions('ADMIN'));

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.use(cookieParser());
  await app.listen(3000);
  await app.startAllMicroservices();
}
bootstrap();
