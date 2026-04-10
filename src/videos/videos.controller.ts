import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { VideosService } from './videos.service.js';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import {
  type VideoBaseDto,
  type VideoDetailDto,
  type StreamInfoDto,
  type MultiSiteSearchResponseDto,
} from './dto/video.dto.js';

@ApiTags('Videos')
@Controller('api')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get('latest')
  @ApiOperation({ summary: 'Get latest videos from all sites' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Latest videos grouped by site',
    type: Object,
  })
  async getLatest(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ): Promise<Record<string, VideoBaseDto[]>> {
    return this.videosService.getLatest(page);
  }

  @Get('search')
  @ApiOperation({ summary: 'Unified search across all sites' })
  @ApiQuery({ name: 'q', required: true, type: String, example: 'isekai' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Search results combined and by site',
    type: Object,
  })
  async search(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ): Promise<MultiSiteSearchResponseDto> {
    return this.videosService.search(query, page);
  }

  @Get('random')
  @ApiOperation({ summary: 'Get random videos from local database' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Randomly selected videos',
    type: [Object],
  })
  async getRandom(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<any[]> {
    return this.videosService.getRandom(limit);
  }

  @Get('site/:siteId/details/:slug')
  @ApiOperation({ summary: 'Get video details with DB persistence' })
  @ApiParam({ name: 'siteId', example: 'hstream' })
  @ApiParam({ name: 'slug', example: 'overflow-episode-1' })
  @ApiResponse({
    status: 200,
    description: 'Full video details',
    type: Object,
  })
  async getDetails(
    @Param('siteId') siteId: string,
    @Param('slug') slug: string,
  ): Promise<VideoDetailDto> {
    return this.videosService.getDetails(siteId, slug);
  }

  @Get('site/:siteId/watch/:slug')
  @ApiOperation({ summary: 'Get stream links' })
  @ApiParam({ name: 'siteId', example: 'hstream' })
  @ApiParam({ name: 'slug', example: 'overflow-episode-1' })
  @ApiResponse({
    status: 200,
    description: 'Stream URLs and headers',
    type: Object,
  })
  async getWatch(
    @Param('siteId') siteId: string,
    @Param('slug') slug: string,
  ): Promise<StreamInfoDto> {
    return this.videosService.getWatch(siteId, slug);
  }
}
