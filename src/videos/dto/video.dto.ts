import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VideoBaseDto {
  @ApiProperty({ example: 'Hentai Series Title' })
  title!: string;

  @ApiProperty({ example: 'hentai-series-slug' })
  slug!: string;

  @ApiPropertyOptional({ example: 'https://example.com/thumb.jpg' })
  thumbnail?: string;

  @ApiProperty({ example: 'https://example.com/watch/slug' })
  url!: string;

  @ApiProperty({ example: 'hstream' })
  site!: string;

  @ApiPropertyOptional({ example: 'Description about the video' })
  description?: string;

  @ApiProperty({ type: [String], default: [] })
  genres: string[] = [];
}

export class VideoDetailDto extends VideoBaseDto {
  @ApiPropertyOptional({ example: 'https://example.com/embed/123' })
  embedUrl?: string;

  @ApiProperty({ type: 'object', additionalProperties: true, default: {} })
  metadata: Record<string, any> = {};
}

export class StreamSourceDto {
  @ApiProperty({ example: 'https://example.com/video.mp4' })
  file!: string;

  @ApiProperty({ example: '720p' })
  label!: string;

  @ApiProperty({ example: 'video/mp4' })
  type!: string;
}

export class StreamInfoDto {
  @ApiPropertyOptional({ type: [StreamSourceDto] })
  sources?: StreamSourceDto[];

  @ApiPropertyOptional({ example: 'https://example.com/playlist.m3u8' })
  m3u8?: string;

  @ApiPropertyOptional({ example: 'https://example.com/manifest.mpd' })
  mpd?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  headers?: Record<string, string>;
}

export class SearchResponseDto {
  @ApiProperty({ type: [VideoBaseDto] })
  results!: VideoBaseDto[];

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;
}

export class MultiSiteSearchResponseDto {
  @ApiProperty({ type: [VideoBaseDto] })
  combined!: VideoBaseDto[];

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: { $ref: '#/components/schemas/VideoBaseDto' },
    },
  })
  bySite!: Record<string, VideoBaseDto[]>;
}
