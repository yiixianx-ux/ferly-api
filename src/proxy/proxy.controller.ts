import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { ProxyService } from './proxy.service.js';
import type { FastifyReply } from 'fastify';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Proxy')
@Controller('api/proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('image')
  @ApiOperation({ summary: 'Proxy an image to bypass hotlinking' })
  @ApiQuery({
    name: 'url',
    required: true,
    type: String,
    description: 'Direct image URL',
  })
  @ApiQuery({
    name: 'referer',
    required: false,
    type: String,
    description: 'Optional custom referer header',
  })
  @ApiResponse({ status: 200, description: 'The proxied image stream' })
  async proxyImage(
    @Query('url') url: string,
    @Res() res: FastifyReply,
    @Query('referer') referer?: string,
  ) {
    if (!url) throw new BadRequestException('URL is required');
    return this.proxyService.proxyImage(url, res, referer);
  }

  @Get('stream')
  @ApiOperation({ summary: 'Proxy a video stream (Relay)' })
  @ApiQuery({
    name: 'url',
    required: true,
    type: String,
    description: 'Direct video/m3u8 URL',
  })
  @ApiQuery({
    name: 'referer',
    required: false,
    type: String,
    description: 'Optional custom referer header',
  })
  @ApiResponse({ status: 200, description: 'The proxied video stream' })
  async proxyStream(
    @Query('url') url: string,
    @Res() res: FastifyReply,
    @Query('referer') referer?: string,
  ) {
    if (!url) throw new BadRequestException('URL is required');
    return this.proxyService.proxyStream(url, res, referer);
  }
}
