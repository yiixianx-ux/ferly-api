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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const sqlite = new (Database as any)(dbPath);

    // Create table if not exists (simple initialization logic)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return drizzle(sqlite, { schema });
  },
};
