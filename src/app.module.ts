import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { DatabaseModule } from './database/database.module.js';
import { ScrapersModule } from './scrapers/scrapers.module.js';
import { VideosModule } from './videos/videos.module.js';
import { ProxyModule } from './proxy/proxy.module.js';

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
