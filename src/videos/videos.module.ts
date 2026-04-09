import { Module } from '@nestjs/common';
import { VideosService } from './videos.service.js';
import { VideosController } from './videos.controller.js';
import { ScrapersModule } from '../scrapers/scrapers.module.js';

@Module({
  imports: [ScrapersModule],
  providers: [VideosService],
  controllers: [VideosController],
})
export class VideosModule {}
