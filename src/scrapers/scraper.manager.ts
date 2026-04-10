import { Injectable, Logger, Inject } from '@nestjs/common';
import { BaseScraper } from './base-scraper.js';
import {
  MultiSiteSearchResponseDto,
  VideoBaseDto,
} from '../videos/dto/video.dto.js';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class ScraperManager {
  private readonly logger = new Logger(ScraperManager.name);
  private readonly scrapers: Map<string, BaseScraper> = new Map();

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  registerScraper(scraper: BaseScraper) {
    this.scrapers.set(scraper.siteId, scraper);
  }

  getScraper(siteId: string): BaseScraper | undefined {
    return this.scrapers.get(siteId);
  }

  async searchAll(
    query: string,
    page = 1,
  ): Promise<MultiSiteSearchResponseDto> {
    const cacheKey = `search:${query}:${page}`;
    const cached =
      await this.cacheManager.get<MultiSiteSearchResponseDto>(cacheKey);
    
    if (cached) {
      this.logger.log(`[Cache] Returning cached results for: ${query}`);
      return cached;
    }

    this.logger.log(`[Scraper] Searching for "${query}" on all sites...`);
    const results: Record<string, VideoBaseDto[]> = {};
    const combined: VideoBaseDto[] = [];

    const tasks = Array.from(this.scrapers.entries()).map(
      async ([id, scraper]) => {
        try {
          const siteResults = await scraper.search(query, page);
          results[id] = siteResults;
          combined.push(...siteResults);
        } catch (error) {
          this.logger.error(`Search failed for site: ${id}`, error);
          results[id] = [];
        }
      },
    );

    await Promise.allSettled(tasks);

    const response = { combined, bySite: results };
    await this.cacheManager.set(cacheKey, response, 3600 * 1000); // TTL 1 jam
    return response;
  }

  async getLatestAll(page = 1): Promise<Record<string, VideoBaseDto[]>> {
    const cacheKey = `latest:${page}`;
    const cached =
      await this.cacheManager.get<Record<string, VideoBaseDto[]>>(cacheKey);
    if (cached) return cached;

    const results: Record<string, VideoBaseDto[]> = {};

    const tasks = Array.from(this.scrapers.entries()).map(
      async ([id, scraper]) => {
        try {
          results[id] = await scraper.getLatest(page);
        } catch (error) {
          this.logger.error(`Latest failed for site: ${id}`, error);
          results[id] = [];
        }
      },
    );

    await Promise.allSettled(tasks);
    await this.cacheManager.set(cacheKey, results, 1800 * 1000); // TTL 30 menit
    return results;
  }
}
