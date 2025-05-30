import { NestFactory } from '@nestjs/core';
import { WebModule } from './web.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(WebModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    app.use(cookieParser());
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
