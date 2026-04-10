# Project Context: Ferly API

## 🏛️ Architecture Overview

Ferly API is an ESM-first NestJS application designed for efficient web scraping and data aggregation.

### Key Components

1.  **ScraperManager (`src/scrapers/scraper.manager.ts`)**:
    - Central registry for all scrapers.
    - Handles concurrent scraping tasks using `Promise.allSettled`.
    - Implements caching to reduce redundant site requests.

2.  **VideosService (`src/videos/videos.service.ts`)**:
    - Orchestrates between real-time scraping and local database persistence.
    - Implements a "fire-and-forget" strategy for background indexing to ensure low latency for the end user.

3.  **ProxyModule (`src/proxy/proxy.module.ts`)**:
    - Essential for serving media content from external sites that enforce strict `Referer` checks.
    - Uses streaming to minimize memory footprint.

4.  **Database Layer (`src/database/schema.ts`)**:
    - Uses SQLite for zero-configuration local storage.
    - Schema is optimized for search and unique constraints on `site` + `slug`.

## 🛡️ Security & Quality Standards

### Identified Improvement Areas

- **Background Error Handling**: The `saveVideosBackground` method in `VideosService` should have explicit `.catch()` blocks to prevent unhandled promise rejections.
- **Input Validation**: Controllers use Zod for schema definitions and type safety. Internal validation is performed using Zod schemas.
- **Request Transformation**: `ValidationPipe` with `transform: true` is used globally for basic query parameter transformation (e.g., string to number).
- **Scraper Robustness**: Some scrapers (e.g., `HStreamScraper`) rely on complex token extraction from HTML. These should have more descriptive error messages and fallback mechanisms.
- **Proxy Configuration**: Move hardcoded referers in `ProxyService` to a centralized configuration file or environment variables.

### Performance Strategy

- **ESM-First**: The project uses modern ESM modules for better performance and future-proofing.
- **Fastify**: Chosen over Express for its significantly lower overhead.
- **In-Memory Caching**: Responses are cached at the `ScraperManager` level to avoid repeated scraping for identical queries within a short window.

## 🤝 Development Workflow

- Follow NestJS modular conventions.
- Always use Drizzle for database operations to maintain type safety.
- When adding a new scraper, extend `BaseScraper` and register it in `ScrapersModule`.
- Prioritize `got` for scraping; only fallback to `playwright` (if integrated) for sites with heavy JS/protection.
