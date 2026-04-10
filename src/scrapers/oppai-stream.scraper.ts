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

@Injectable()
export class OppaiStreamScraper extends BaseScraper {
  private readonly logger = new Logger(OppaiStreamScraper.name);
  readonly siteId = 'oppai';
  readonly baseUrl = 'https://oppai.stream';
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
    // oppai.stream menggunakan parameter 'search' di root
    const html = await this.client
      .get('', {
        searchParams: { search: query },
        retry: { limit: 1 },
      })
      .text();

    const results = this.parseItems(html);

    // Validasi sederhana: Jika kita mencari sesuatu, pastikan judulnya mengandung kata kunci
    // karena oppai sering fallback ke "Latest" jika tidak ditemukan
    const filtered = results.filter(
      (v) =>
        v.title.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes(v.title.toLowerCase()),
    );

    this.logger.log(
      `Oppai found ${results.length} items, ${filtered.length} matched query "${query}"`,
    );
    return filtered;
  }

  async getLatest(): Promise<VideoBaseDto[]> {
    const html = await this.client.get('').text();
    return this.parseItems(html);
  }

  async getDetails(slug: string): Promise<VideoDetailDto> {
    const response = await this.client.get('watch', {
      searchParams: { e: slug },
    });
    const html = response.body;

    if (
      html.includes('Before you can watch this') ||
      html.includes('you must be logged in') ||
      response.url.includes('locked.php')
    ) {
      throw new Error('This video requires login to view (Login Wall)');
    }

    const $ = cheerio.load(html);
    const container = $('.episode-shown');

    if (!container.length) {
      throw new Error(`Details not found for slug: ${slug}`);
    }

    const title =
      `${container.attr('name') || ''} ${container.attr('ep') || ''}`.trim();
    const description = container.attr('desc') || '';
    const genres = (container.attr('tags') || '').split(',').filter(Boolean);
    const imgEl = container.find('img.cover-img-in');
    const thumbnail = imgEl.attr('original') || imgEl.attr('src') || '';

    return {
      title: title || slug.replace(/-/g, ' '),
      slug,
      site: this.siteId,
      url: `${this.baseUrl}/watch?e=${slug}`,
      thumbnail: thumbnail.startsWith('http')
        ? thumbnail
        : `${this.baseUrl}${thumbnail}`,
      description,
      genres,
      metadata: {},
    };
  }

  async getStreamLink(slug: string): Promise<StreamInfoDto> {
    try {
      const response = await this.client.get('watch', {
        searchParams: { e: slug },
      });
      const html = response.body;

      if (
        html.includes('Before you can watch this') ||
        html.includes('you must be logged in') ||
        response.url.includes('locked.php')
      ) {
        throw new Error('This video requires login to view (Login Wall)');
      }

      const $ = cheerio.load(html);
      const sources: StreamSourceDto[] = [];

      // 1. Extract from <source> tags
      $('video source').each((_, el) => {
        const src = $(el).attr('src');
        if (src) {
          sources.push({
            file: src,
            label: $(el).attr('type')?.split('/').pop() || 'mp4',
            type: $(el).attr('type') || 'video/mp4',
          });
        }
      });

      // 2. Extract from playerConfig JSON in script tags
      const scripts = $('script')
        .map((_, el) => $(el).html())
        .get();
      for (const script of scripts) {
        const match = script?.match(/playerConfig\s*=\s*({.*?});/s);
        if (match) {
          try {
            const config = JSON.parse(match[1]) as {
              sources?: Array<{ file?: string; label?: string; type?: string }>;
            };
            if (config.sources) {
              for (const s of config.sources) {
                if (s.file) {
                  sources.push({
                    file: s.file,
                    label: s.label || 'Source',
                    type: s.type || 'video/mp4',
                  });
                }
              }
            }
          } catch {
            this.logger.warn('Failed to parse playerConfig JSON');
          }
        }
      }

      // 3. Regex fallback for m3u8
      const m3u8Match = html.match(/["']?(https?:\/\/[^"']+\.m3u8[^"']*)["']?/);
      if (m3u8Match && !sources.some((s) => s.file === m3u8Match[1])) {
        sources.push({
          file: m3u8Match[1],
          label: 'HLS',
          type: 'application/x-mpegURL',
        });
      }

      return {
        sources,
        m3u8: sources.find((s) => s.file.includes('.m3u8'))?.file,
      };
    } catch (error) {
      this.logger.error(`Failed to get stream for ${slug}`, error);
      return {};
    }
  }

  private parseItems(html: string): VideoBaseDto[] {
    const $ = cheerio.load(html);
    const results: VideoBaseDto[] = [];

    $('.episode-shown').each((_, el) => {
      const $item = $(el);
      const linkEl = $item.find('a[href*="/watch?e="]');
      if (!linkEl.length) return;

      const href = linkEl.attr('href') || '';
      const urlObj = new URL(href, this.baseUrl);
      const slug = urlObj.searchParams.get('e');

      if (!slug) return;

      const title = $item.attr('name') || '';
      const ep = $item.attr('ep') || '';
      const fullTitle = `${title} ${ep}`.trim();

      const imgEl = $item.find('img.cover-img-in');
      const thumb = imgEl.attr('original') || imgEl.attr('src');

      results.push({
        title: fullTitle,
        slug,
        site: this.siteId,
        url: `${this.baseUrl}/watch?e=${slug}`,
        thumbnail:
          thumb && thumb.startsWith('/')
            ? `${this.baseUrl}${thumb}`
            : thumb || '',
        description: $item.attr('desc') || '',
        genres: ($item.attr('tags') || '').split(',').filter(Boolean),
      });
    });

    return results;
  }
}
