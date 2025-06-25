import { NestFactory } from "@nestjs/core";
import { WebModule } from "./web.module";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { RMQService, setupCsrfProtection } from "@app/common";
import { join } from "path";
import { json } from "express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(WebModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number | string>("PORT") ?? 4000;

  app.use(json());

  // Serve static files from /public
  app.useStaticAssets(join(process.cwd(), 'public'));

  app.enableCors({
    origin: true,
    credentials: true, // allows cookies/authorization headers
  });

  setupCsrfProtection(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );

  const rmqService = app.get<RMQService>(RMQService);
  app.connectMicroservice(rmqService.getOptions("WEB"));

  await app.listen(port);
  console.log(`HTTP server listening on port ${port}`);
  await app.startAllMicroservices();
  console.log(`Microservices started`);
}
bootstrap();
