import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';
import { ScrapersModule } from './scrapers/scrapers.module';
import { VideosModule } from './videos/videos.module';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty', // optional (biar readable)
        },
      },
    }),

    CacheModule.register({
      isGlobal: true,
      ttl: 3600,
      max: 100,
    }),

    DatabaseModule,
    ScrapersModule,
    VideosModule,
    ProxyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
