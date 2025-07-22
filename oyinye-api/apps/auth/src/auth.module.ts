import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtStrategy } from "./strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LocalStrategy } from "./strategy/local.strategy";
import joi from "joi";
import { UserModule } from "apps/auth/src/user/user.module";
import { DatabaseModule, LoggingInterceptor, RMQModule } from "@app/common";
import { EMAIL_SERVICE } from "apps/admin/src/constants/service";
import { ADMIN_SERVICE, WEB_SERVICE } from "./constants/service";
import { User } from "./entities/user.entity";
import { Session } from "./entities/session.entity";
import { RefreshToken } from "./entities/refresh-token.entity";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";

@Module({
  imports: [
    DatabaseModule,
    RMQModule.register(EMAIL_SERVICE),
    RMQModule.register(ADMIN_SERVICE),
    RMQModule.register(WEB_SERVICE),
    PrometheusModule.register(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000,
          limit: 5,
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        DB_PASS: joi.string().required(),
        DB_PORT: joi.number().required(),
        DB_NAME: joi.string().required(),
        DB_USER: joi.string().required(),
        DB_HOST: joi.string().required(),
        PORT: joi.string().required(),
        NODE_ENV: joi.string().required(),
        JWT_SECRET: joi.string().required(),
        JWT_EXPIRES_IN: joi.string().required(),
        DEV_RABBITMQ_URL: joi.string().required(),
        PROD_RABBITMQ_URL: joi.string().required(),
        RABBITMQ_ADMIN_QUEUE: joi.string().required(),
        RABBITMQ_EMAIL_QUEUE: joi.string().required(),
        RABBITMQ_AUTH_QUEUE: joi.string().required(),
        RABBITMQ_WEB_QUEUE: joi.string().required(),
        SERVICE_NAME: joi.string().required(),
        APP_NAME: joi.string().required(),
      }),
      envFilePath: ".env.auth",
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.getOrThrow("JWT_EXPIRES_IN"),
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    TypeOrmModule.forFeature([User, Session, RefreshToken]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AuthModule {}
