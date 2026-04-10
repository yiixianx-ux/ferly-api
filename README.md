# Ferly API (NestJS)

Unified Web Scraping & Video Access Layer built with NestJS and Fastify.

## 🚀 Features

- **Unified Search**: Search across multiple video sites (`hstream`, `oppai`, `haho`) with a single request.
- **Background Persistence**: Automatically indexes results into a local SQLite database for faster retrieval and random access.
- **Referer-Safe Proxy**: Built-in proxy for images and streams that require specific referer headers.
- **Fastify Power**: Leveraging Fastify for high-performance HTTP handling.
- **Swagger Documentation**: Interactive API documentation available at `/docs`.
- **Type-Safe ORM**: Uses Drizzle ORM for robust database interactions.

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) v11
- **Platform**: [Fastify](https://www.fastify.io/)
- **Scraping**: `got` & `cheerio`
- **Database**: `better-sqlite3` with [Drizzle ORM](https://orm.drizzle.team/)
- **Logging**: `nestjs-pino`
- **Validation**: `class-validator` & `class-transformer` (planned for full migration)

## 📦 Installation

```bash
npm install
```

## 🏃 Running the App

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 📖 API Documentation

Once the app is running, visit:
`http://localhost:8000/docs`

## 🏗️ Project Structure

- `src/scrapers/`: Individual scraper implementations and manager logic.
- `src/videos/`: Core service for orchestrating scraping and database persistence.
- `src/proxy/`: Media proxy to bypass referer restrictions.
- `src/database/`: Drizzle schema and database provider.

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```
