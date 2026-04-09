import { Injectable, Logger } from '@nestjs/common';
import { BaseScraper } from './base-scraper';
import { VideoBaseDto, VideoDetailDto, StreamInfoDto } from '../videos/dto/video.dto';
import got, { Got } from 'got';
import * as cheerio from 'cheerio';

@Injectable()
export class HStreamScraper extends BaseScraper {
  private readonly logger = new Logger(HStreamScraper.name);
  readonly siteId = 'hstream';
  readonly baseUrl = 'https://hstream.moe';
  private readonly client: Got;

  constructor() {
    super();
    this.client = got.extend({
      prefixUrl: this.baseUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: { request: 30000 },
      retry: { limit: 2 },
      followRedirect: true,
    });
  }

  async search(query: string, page = 1): Promise<VideoBaseDto[]> {
    const url = `search?search=${encodeURIComponent(query)}&page=${page}`;
    const html = await this.client.get(url).text();
    return this.parseList(html);
  }

  async getLatest(page = 1): Promise<VideoBaseDto[]> {
    const url = `search?order=recently-uploaded&page=${page}`;
    const html = await this.client.get(url).text();
    return this.parseList(html);
  }

  async getDetails(slug: string): Promise<VideoDetailDto> {
    const html = await this.client.get(`hentai/${slug}`).text();
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim() || slug;
    const thumbnail = $('meta[property="og:image"]').attr('content') || '';
    const description = $('.description').text().trim() || '';
    
    const genres: string[] = [];
    $('a[href*="tags%5B"]').each((_, el) => {
      genres.push($(el).text().trim());
    });

    return {
      title,
      slug,
      site: this.siteId,
      url: `${this.baseUrl}/hentai/${slug}`,
      thumbnail: thumbnail.startsWith('http') ? thumbnail : `${this.baseUrl}${thumbnail}`,
      description,
      genres: [...new Set(genres)],
      metadata: {},
    };
  }

  async getStreamLink(slug: string): Promise<StreamInfoDto> {
    try {
      const response = await this.client.get(`hentai/${slug}`);
      const html = response.body;
      const $ = cheerio.load(html);

      // Extract episode ID from various possible locations
      let episodeId = $('#e_id').val()?.toString();
      if (!episodeId) {
          const match = html.match(/"class":"App\\\\Models\\\\Episode","key":(\d+)/);
          episodeId = match ? match[1] : undefined;
      }

      if (!episodeId) throw new Error('Episode ID not found');

      // Extract cookies manually from set-cookie headers
      const setCookies = response.headers['set-cookie'] || [];
      const xsrfTokenRaw = setCookies.find(c => c.includes('XSRF-TOKEN'))?.split(';')[0].split('=')[1];
      const xsrfToken = xsrfTokenRaw ? decodeURIComponent(xsrfTokenRaw) : '';
      
      const csrfToken = $('meta[name="csrf-token"]').attr('content') || '';

      const apiRes = await this.client.post('player/api', {
        json: { episode_id: episodeId },
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': xsrfToken,
            'X-CSRF-TOKEN': csrfToken,
            'Referer': `${this.baseUrl}/hentai/${slug}`,
            'Cookie': setCookies.map(c => c.split(';')[0]).join('; ')
        }
      }).json<any>();

      if (!apiRes.stream_url) throw new Error('No stream URL in API response');

      const domain = (apiRes.stream_domains || apiRes.asia_stream_domains || [])[0]?.replace(/\/$/, '');
      const path = apiRes.stream_url.replace(/^\//, '');

      return {
        m3u8: `${domain}/${path}/720/manifest.m3u8`,
        mpd: `${domain}/${path}/2160/manifest.mpd`,
        headers: {
          'Referer': `${this.baseUrl}/`,
          'User-Agent': 'Mozilla/5.0'
        }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get stream for ${slug}: ${message}`);
      return { headers: {} };
    }
  }

  private parseList(html: string): VideoBaseDto[] {
    const $ = cheerio.load(html);
    const results: VideoBaseDto[] = [];

    // Using cheerio selectors instead of Regex
    $('[wire\\:key^="episode-"]').each((_, el) => {
        const $el = $(el);
        const link = $el.find('a[href*="/hentai/"]').first();
        if (!link.length) return;

        const href = link.attr('href') || '';
        const slug = href.split('/').pop() || '';
        const title = $el.find('img').attr('alt')?.trim() || slug.replace(/-/g, ' ');
        const thumbnail = $el.find('img').attr('src') || '';

        results.push({
            title,
            slug,
            site: this.siteId,
            url: `${this.baseUrl}/hentai/${slug}`,
            thumbnail: thumbnail.startsWith('http') ? thumbnail : `${this.baseUrl}${thumbnail}`,
            genres: []
        });
    });

    return results;
  }
}
