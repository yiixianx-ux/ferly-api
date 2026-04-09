import { Controller, Get, Query, Res, BadRequestException } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Proxy')
@Controller('api/proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('image')
  @ApiOperation({ summary: 'Proxy an image to bypass hotlinking' })
  @ApiQuery({ name: 'url', required: true, type: String })
  async proxyImage(@Query('url') url: string, @Res() res: Response) {
    if (!url) throw new BadRequestException('URL is required');
    return this.proxyService.proxyImage(url, res);
  }

  @Get('stream')
  @ApiOperation({ summary: 'Proxy a video stream (Relay)' })
  @ApiQuery({ name: 'url', required: true, type: String })
  async proxyStream(@Query('url') url: string, @Res() res: Response) {
    if (!url) throw new BadRequestException('URL is required');
    return this.proxyService.proxyStream(url, res);
  }
}
