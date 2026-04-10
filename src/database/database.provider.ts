/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  drizzle,
  type BetterSQLite3Database,
} from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js';
import { type Provider } from '@nestjs/common';
import { join } from 'path';

export const DRIZZLE = 'DRIZZLE';

export const DatabaseProvider: Provider = {
  provide: DRIZZLE,
  useFactory: (): BetterSQLite3Database<typeof schema> => {
    const dbPath = join(process.cwd(), 'data', 'fuby.db');
    // @ts-expect-error - better-sqlite3 types
    const sqlite = new Database(dbPath);

    // Create table if not exists (simple initialization logic)
    // @ts-expect-error - better-sqlite3 types
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

    // @ts-expect-error - drizzle init types
    return drizzle(sqlite, { schema });
  },
};
