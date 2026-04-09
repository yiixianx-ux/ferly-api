import { Injectable, Logger } from '@nestjs/common';
import got from 'got';
import { FastifyReply } from 'fastify';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  async proxyImage(url: string, res: FastifyReply) {
    let referer = 'https://hstream.moe/';
    if (url.includes('muchohentai.com')) referer = 'https://muchohentai.com/';
    if (url.includes('oppai.stream')) referer = 'https://oppai.stream/';

    try {
      const stream = got.stream(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Referer: referer,
        },
        retry: { limit: 2 },
      });

      stream.on('response', (response) => {
        void res.header(
          'Content-Type',
          response.headers['content-type'] || 'image/jpeg',
        );
        void res.header('Cache-Control', 'public, max-age=86400'); // Cache 24 jam
      });

      return res.send(stream);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Image proxy error: ${message}`);
      return res.status(500).send({ error: 'Failed to proxy image' });
    }
  }

  async proxyStream(url: string, res: FastifyReply) {
    try {
      const stream = got.stream(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Referer: 'https://oppai.stream/',
        },
      });

      stream.on('response', (response) => {
        void res.header(
          'Content-Type',
          response.headers['content-type'] || 'video/mp4',
        );
      });

      return res.send(stream);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Stream proxy error: ${message}`);
      return res.status(500).send({ error: 'Failed to proxy stream' });
    }
  }
}
