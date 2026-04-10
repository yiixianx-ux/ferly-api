import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      name: 'Ferly API',
      version: '1.1.0',
      description: 'Unified Web Scraping & Video Access Layer',
      status: 'Feeling cute and online!',
      author: 'yiixian',
      environment: process.env.NODE_ENV || 'development',
      features: [
        'Multi-site Scraping (HStream, Oppai)',
        'Smart Caching',
        'Local Database Persistence',
        'Image Proxy',
      ],
      endpoints: {
        docs: '/docs',
        search: '/api/search?q={query}',
        latest: '/api/latest',
        random: '/api/random',
        watch: '/api/site/{siteId}/watch/{slug}',
      },
      stats: {
        scrapers: ['hstream', 'oppai'],
        engine: 'NestJS',
      },
    };
  }
}
