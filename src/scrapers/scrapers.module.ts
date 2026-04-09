import { Module, OnModuleInit } from '@nestjs/common';
import { ScraperManager } from './scraper.manager.js';
import { HStreamScraper } from './hstream.scraper.js';
import { OppaiStreamScraper } from './oppai-stream.scraper.js';

@Module({
  providers: [
    ScraperManager,
    HStreamScraper,
    OppaiStreamScraper,
  ],
  exports: [ScraperManager],
})
export class ScrapersModule implements OnModuleInit {
  constructor(
    private readonly manager: ScraperManager,
    private readonly hstream: HStreamScraper,
    private readonly oppai: OppaiStreamScraper,
  ) {}

  onModuleInit() {
    this.manager.registerScraper(this.hstream);
    this.manager.registerScraper(this.oppai);
  }
}
