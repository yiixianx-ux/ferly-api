# Project Overview

`ferly-api` is a server-side application built with the [NestJS](https://nestjs.com/) framework. Based on its dependencies, the project is designed for **web scraping, data extraction, and processing**.

## Key Technologies
- **Framework:** [NestJS](https://nestjs.com/) (v11)
- **Language:** TypeScript (configured for ESM via `nodenext`)
- **Database & ORM:** [Drizzle ORM](https://orm.drizzle.team/) with [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)
- **Web Scraping/Interaction:** [Playwright](https://playwright.dev/), [Cheerio](https://cheerio.js.org/), and [Got](https://github.com/sindresorhus/got)
- **Validation:** [Zod](https://zod.dev/)
- **Logging:** [Pino](https://getpino.io/) via `nestjs-pino`
- **Caching:** `cache-manager` with NestJS integration

## Building and Running

The project uses standard `npm` scripts for lifecycle management:

```bash
# Install dependencies
npm install

# Development (watch mode)
npm run start:dev

# Production build
npm run build

# Run production build
npm run start:prod

# Linting and Formatting
npm run lint
npm run format
```

## Testing

Testing is handled via [Jest](https://jestjs.io/):

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Development Conventions

- **Architecture:** Follows standard NestJS modular architecture (Controllers, Services, Modules).
- **Module System:** The project is configured as an **ESM-first** codebase (`"module": "nodenext"`).
- **Code Style:** Enforced via ESLint and Prettier.
- **Validation:** Use Zod for schema validation and type safety.
- **Logging:** Use the `Pino` logger for high-performance structured logging.
- **Database:** Drizzle ORM is used for type-safe database interactions with SQLite.

### Web Scraping Strategy
- The primary scraping engine is `got`.
- For sites protected by Cloudflare, the scraper intelligently falls back to `playwright`.
