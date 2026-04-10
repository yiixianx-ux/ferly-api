import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { VideosService } from './videos.service.js';
import { ScraperManager } from '../scrapers/scraper.manager.js';
import { DRIZZLE } from '../database/database.provider.js';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('VideosService', () => {
  let service: VideosService;
  let scraperManager: ScraperManager;

  const mockDb = {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    onConflictDoUpdate: jest.fn().mockReturnThis(),
    run: jest.fn(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  };

  const mockScraperManager = {
    getLatestAll: jest.fn().mockResolvedValue({ hstream: [], oppai: [] }),
    searchAll: jest.fn().mockResolvedValue({ combined: [], bySite: {} }),
    getScraper: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideosService,
        { provide: ScraperManager, useValue: mockScraperManager },
        { provide: DRIZZLE, useValue: mockDb },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<VideosService>(VideosService);
    scraperManager = module.get<ScraperManager>(ScraperManager);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call scraperManager.getLatestAll on getLatest', async function (this: void) {
    const result = await service.getLatest(1);
    expect(scraperManager.getLatestAll).toHaveBeenCalledWith(1);
    expect(result).toEqual({ hstream: [], oppai: [] });
  });

  it('should call scraperManager.searchAll on search', async function (this: void) {
    const query = 'test';
    const result = await service.search(query, 1);
    expect(scraperManager.searchAll).toHaveBeenCalledWith(query, 1);
    expect(result).toEqual({ combined: [], bySite: {} });
  });
});
