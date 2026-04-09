import { z } from 'zod';

export const VideoBaseSchema = z.object({
  title: z.string(),
  slug: z.string(),
  thumbnail: z.string().optional(),
  url: z.string().url(),
  site: z.string(),
  description: z.string().optional(),
  genres: z.array(z.string()).default([]),
});

export const VideoDetailSchema = VideoBaseSchema.extend({
  embedUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.any()).default({}),
});

export const StreamSourceSchema = z.object({
  file: z.string().url(),
  label: z.string(),
  type: z.string(),
});

export const StreamInfoSchema = z.object({
  sources: z.array(StreamSourceSchema).optional(),
  m3u8: z.string().url().optional(),
  mpd: z.string().url().optional(),
  headers: z.record(z.string(), z.string()).optional(),
});

export const SearchResponseSchema = z.object({
  results: z.array(VideoBaseSchema),
  total: z.number(),
  page: z.number(),
});

export const MultiSiteSearchResponseSchema = z.object({
  combined: z.array(VideoBaseSchema),
  bySite: z.record(z.string(), z.array(VideoBaseSchema)),
});

// Infer types from schemas
export type VideoBaseDto = z.infer<typeof VideoBaseSchema>;
export type VideoDetailDto = z.infer<typeof VideoDetailSchema>;
export type StreamSourceDto = z.infer<typeof StreamSourceSchema>;
export type StreamInfoDto = z.infer<typeof StreamInfoSchema>;
export type SearchResponseDto = z.infer<typeof SearchResponseSchema>;
export type MultiSiteSearchResponseDto = z.infer<typeof MultiSiteSearchResponseSchema>;
