import { NestFactory } from "@nestjs/core";
import { RMQService } from "@app/common/rmq/rmq.service";
import { ValidationPipe } from "@nestjs/common";
import { AdminModule } from "./admin.module";
import { ConfigService } from "@nestjs/config";
import { setupCsrfProtection } from "@app/common";

async function bootstrap() {
  const app = await NestFactory.create(AdminModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT") ?? 8080;

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true, // allows cookies/authorization headers
  });

  setupCsrfProtection(app);


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );

  const rmqService = app.get<RMQService>(RMQService);
  app.connectMicroservice(rmqService.getOptions("ADMIN"));

  await app.listen(port);
  console.log(`HTTP server listening on port ${port}`);
  await app.startAllMicroservices();
  console.log(`Microservices started`);
}
bootstrap();
