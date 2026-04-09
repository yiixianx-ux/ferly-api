import { Controller, Get, Query, Param } from '@nestjs/common';
import { VideosService } from './videos.service.js';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Videos')
@Controller('api')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get('latest')
  @ApiOperation({ summary: 'Get latest videos from all sites' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  async getLatest(@Query('page') page = 1) {
    return this.videosService.getLatest(Number(page));
  }

  @Get('search')
  @ApiOperation({ summary: 'Unified search across all sites' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  async search(@Query('q') query: string, @Query('page') page = 1) {
    return this.videosService.search(query, Number(page));
  }

  @Get('random')
  @ApiOperation({ summary: 'Get random videos from local database' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRandom(@Query('limit') limit = 10) {
    return this.videosService.getRandom(Number(limit));
  }

  @Get('site/:siteId/details/:slug')
  @ApiOperation({ summary: 'Get video details with DB persistence' })
  async getDetails(@Param('siteId') siteId: string, @Param('slug') slug: string) {
    return this.videosService.getDetails(siteId, slug);
  }

  @Get('site/:siteId/watch/:slug')
  @ApiOperation({ summary: 'Get stream links' })
  async getWatch(@Param('siteId') siteId: string, @Param('slug') slug: string) {
    return this.videosService.getWatch(siteId, slug);
  }
}
