import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service.js';
import { ProxyController } from './proxy.controller.js';

@Module({
  providers: [ProxyService],
  controllers: [ProxyController],
})
export class ProxyModule {}
