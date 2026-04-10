import { Injectable, Logger } from '@nestjs/common';
import got, { Response } from 'got';
import { FastifyReply } from 'fastify';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  async proxyImage(url: string, res: FastifyReply, customReferer?: string) {
    let referer = customReferer || 'https://hstream.moe/';

    // Fallback logic jika tidak ada custom referer
    if (!customReferer) {
      if (url.includes('muchohentai.com')) referer = 'https://muchohentai.com/';
      if (url.includes('oppai.stream')) referer = 'https://oppai.stream/';
    }

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
    const referer = customReferer || 'https://oppai.stream/';

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
