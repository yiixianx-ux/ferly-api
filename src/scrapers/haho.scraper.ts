import { Injectable, Logger } from '@nestjs/common';
import { BaseScraper } from './base-scraper.js';
import {
  VideoBaseDto,
  VideoDetailDto,
  StreamInfoDto,
  StreamSourceDto,
} from '../videos/dto/video.dto.js';
import got, { Got } from 'got';
import * as cheerio from 'cheerio';
import { CONFIG } from '../config.js';

@Injectable()
export class HahoScraper extends BaseScraper {
  private readonly logger = new Logger(HahoScraper.name);
  readonly siteId = 'haho';
  readonly baseUrl = CONFIG.scrapers.haho.baseUrl;
  private readonly client: Got;

  constructor() {
    super();
    this.client = got.extend({
      prefixUrl: this.baseUrl,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: this.baseUrl,
      },
      timeout: { request: 30000 },
      followRedirect: true,
    });
  }

  async search(query: string): Promise<VideoBaseDto[]> {
    const html = await this.client
      .get('anime', { searchParams: { q: query } })
      .text();
    const $ = cheerio.load(html);
    const results: VideoBaseDto[] = [];

    $('ul.anime-loop li').each((_, el) => {
      const a = $(el).find('a').first();
      if (!a.length) return;

      const href = a.attr('href') || '';
      const slug = href.split('/').pop() || '';
      const title = a.attr('title') || a.find('.text-primary').text().trim();
      const description = a.attr('data-content') || '';

      // Thumbnail usually not in search list, we'll try to find any img if exists
      const img = $(el).find('img').attr('src');

      results.push({
        title,
        slug,
        site: this.siteId,
        url: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
        thumbnail: img || '',
        description,
        genres: [],
      });
    });

    // Filtering to ensure relevance
    return results.filter((v) =>
      v.title.toLowerCase().includes(query.toLowerCase()),
    );
  }

  async getLatest(): Promise<VideoBaseDto[]> {
    const html = await this.client.get('').text();
    const $ = cheerio.load(html);
    const results: VideoBaseDto[] = [];

    $('ul.video-loop li').each((_, el) => {
      const a = $(el).find('a').first();
      if (!a.length) return;

      const href = a.attr('href') || '';
      const urlObj = new URL(href, this.baseUrl);
      // For video items, slug should be the path after /anime/
      const slug = urlObj.pathname.startsWith('/anime/')
        ? urlObj.pathname.substring(7) + urlObj.search
        : urlObj.pathname.substring(1) + urlObj.search;

      const title = $(el).find('.anime-title').text().trim();
      const epTitle = $(el).find('.episode-title').text().trim();
      const img = $(el).find('img').attr('src');

      results.push({
        title: `${title} ${epTitle}`.trim(),
        slug,
        site: this.siteId,
        url: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
        thumbnail: img || '',
        genres: [],
      });
    });

    return results;
  }

  async getDetails(slug: string): Promise<VideoDetailDto> {
    const html = await this.client.get(`anime/${slug}`).text();
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();
    const thumb = $('meta[property="og:image"]').attr('content') || '';
    const desc = $('meta[property="og:description"]').attr('content') || '';

    const genres: string[] = [];
    $('a[href*="genre%3A"]').each((_, el) => {
      genres.push($(el).text().trim());
    });

    return {
      title,
      slug,
      site: this.siteId,
      url: `${this.baseUrl}/anime/${slug}`,
      thumbnail: thumb,
      description: desc,
      genres,
      metadata: {},
    };
  }

  async getStreamLink(slug: string): Promise<StreamInfoDto> {
    try {
      // 1. Get detail page or episode page
      const html = await this.client.get(`anime/${slug}`).text();
      const $ = cheerio.load(html);

      let embedUrl = $('iframe[src*="/embed?v="]').attr('src');

      if (!embedUrl) {
        // Try to find first episode link (using .episode-loop for newer site structure)
        let firstEp = $('.episode-loop li a').first().attr('href');

        if (!firstEp) {
          // Fallback to older selector
          firstEp = $('.playlist-episodes li a').first().attr('href');
        }

        if (firstEp) {
          const epHtml = await this.client
            .get(firstEp.replace(this.baseUrl + '/', ''))
            .text();
          const $ep = cheerio.load(epHtml);
          embedUrl = $ep('iframe[src*="/embed?v="]').attr('src');
        }
      }

      if (!embedUrl) throw new Error('Embed URL not found');

      // 2. Get stream from embed
      const embedHtml = await this.client
        .get(embedUrl.replace(this.baseUrl + '/', ''))
        .text();
      const $embed = cheerio.load(embedHtml);
      const sources: StreamSourceDto[] = [];

      $embed('video source').each((_, el) => {
        sources.push({
          file: $embed(el).attr('src') || '',
          label: $embed(el).attr('title') || 'SD',
          type: $embed(el).attr('type') || 'video/mp4',
        });
      });

      return {
        sources,
        m3u8: sources.find((s) => s.file.includes('.m3u8'))?.file,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get stream for ${slug}: ${msg}`);
      return {};
    }
  }
}
