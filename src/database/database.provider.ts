import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js';
import { Provider } from '@nestjs/common';
import { join } from 'path';

export const DRIZZLE = 'DRIZZLE';

export const DatabaseProvider: Provider = {
  provide: DRIZZLE,
  useFactory: () => {
    const dbPath = join(process.cwd(), 'data', 'fuby.db');
    const sqlite = new Database(dbPath);

    // Create table if not exists (simple initialization logic)
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site TEXT NOT NULL,
        slug TEXT NOT NULL,
        title TEXT NOT NULL,
        thumbnail TEXT,
        url TEXT NOT NULL,
        description TEXT,
        genres TEXT DEFAULT '[]',
        last_updated TEXT DEFAULT (CURRENT_TIMESTAMP)
      );
      CREATE UNIQUE INDEX IF NOT EXISTS site_slug_idx ON videos (site, slug);
    `);

    return drizzle(sqlite, { schema });
  },
};
