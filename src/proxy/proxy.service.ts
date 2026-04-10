import { Injectable, Logger } from '@nestjs/common';
import got, { Response } from 'got';
import { FastifyReply } from 'fastify';
import { CONFIG } from '../config.js';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  private getRefererFromUrl(url: string): string {
    const refererMatch = CONFIG.proxy.referers.find((r) => url.includes(r.host));
    return refererMatch ? refererMatch.referer : CONFIG.proxy.defaultReferer;
  }

  async proxyImage(url: string, res: FastifyReply, customReferer?: string) {
    const referer = customReferer || this.getRefererFromUrl(url);

    try {
      const stream = got.stream(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Referer: referer,
        },
        retry: { limit: 2 },
      });

      stream.on('response', (response: Response) => {
        const contentType =
          (response.headers['content-type'] as string) || 'image/jpeg';
        void res.header('Content-Type', contentType);
        void res.header('Cache-Control', 'public, max-age=86400'); // Cache 24 jam
      });

      return res.send(stream);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Image proxy error: ${message}`);
      return res.status(500).send({ error: 'Failed to proxy image' });
    }
  }

  async proxyStream(url: string, res: FastifyReply, customReferer?: string) {
    const referer = customReferer || this.getRefererFromUrl(url);

    try {
      const stream = got.stream(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Referer: referer,
        },
      });

      stream.on('response', (response: Response) => {
        const contentType =
          (response.headers['content-type'] as string) || 'video/mp4';
        void res.header('Content-Type', contentType);
      });

      return res.send(stream);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Stream proxy error: ${message}`);
      return res.status(500).send({ error: 'Failed to proxy stream' });
    }
  }
}
