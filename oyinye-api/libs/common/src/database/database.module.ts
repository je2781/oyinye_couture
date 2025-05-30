import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        database: configService.get('DB_NAME'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        autoLoadEntities: configService.get('NODE_ENV') === 'development' ? true : false,
        synchronize:  configService.get('NODE_ENV') === 'development' || configService.get('NODE_ENV') === 'test'
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
