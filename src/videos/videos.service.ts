import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE } from '../database/database.provider.js';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../database/schema.js';
import { ScraperManager } from '../scrapers/scraper.manager.js';
import { VideoBaseDto, MultiSiteSearchResponseDto } from './dto/video.dto.js';
import { sql } from 'drizzle-orm';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: BetterSQLite3Database<typeof schema>,
    private readonly scraperManager: ScraperManager,
  ) {}

  async getLatest(page = 1) {
    const results = await this.scraperManager.getLatestAll(page);

    // Background save to DB
    const allItems = Object.values(results).flat();
    void this.saveVideosBackground(allItems);

    return results;
  }

  async search(query: string, page = 1): Promise<MultiSiteSearchResponseDto> {
    const results = await this.scraperManager.searchAll(query, page);

    // Background save to DB
    void this.saveVideosBackground(results.combined);

    return results;
  }

  async getRandom(limit = 10) {
    return this.db.query.videos.findMany({
      limit: limit,
      orderBy: (videos, { sql }) => [sql`RANDOM()`],
    });
  }

  async getDetails(siteId: string, slug: string) {
    const scraper = this.scraperManager.getScraper(siteId);
    if (!scraper) throw new Error(`Site ${siteId} not found`);

    const details = await scraper.getDetails(slug);

    // Background save
    void this.saveVideosBackground([details]);

    return details;
  }

  async getWatch(siteId: string, slug: string) {
    const scraper = this.scraperManager.getScraper(siteId);
    if (!scraper) throw new Error(`Site ${siteId} not found`);

    return scraper.getStreamLink(slug);
  }

  private saveVideosBackground(videos: VideoBaseDto[]) {
    if (videos.length === 0) return;

    // Fire and forget, but catch errors to prevent unhandled rejection
    void this.db
      .insert(schema.videos)
      .values(
        videos.map((v) => ({
          site: v.site,
          slug: v.slug,
          title: v.title,
          thumbnail: v.thumbnail,
          url: v.url,
          description: v.description,
          genres: v.genres,
        })),
      )
      .onConflictDoUpdate({
        target: [schema.videos.site, schema.videos.slug],
        set: {
          title: sql`excluded.title`,
          thumbnail: sql`excluded.thumbnail`,
          description: sql`excluded.description`,
          genres: sql`excluded.genres`,
          lastUpdated: sql`CURRENT_TIMESTAMP`,
        },
      })
      .execute()
      .catch((err) => {
        this.logger.error(
          `Failed to save videos to background database: ${err instanceof Error ? err.message : String(err)}`,
        );
      });
  }
}
