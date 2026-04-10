import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const videos = sqliteTable(
  'videos',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    site: text('site').notNull(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    thumbnail: text('thumbnail'),
    url: text('url').notNull(),
    description: text('description'),
    // Mode JSON otomatis melakukan parse/stringify di Drizzle
    genres: text('genres', { mode: 'json' })
      .$type<string[]>()
      .default(sql`'[]'`),
    lastUpdated: text('last_updated').default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({
    siteSlugIdx: uniqueIndex('site_slug_idx').on(table.site, table.slug),
  }),
);

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
