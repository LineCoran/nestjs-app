import { Module } from '@nestjs/common';
import { SiteIconsService } from './site-icons.service';
import { SiteIconsAdminController } from './site-icons.controller';

@Module({
  controllers: [SiteIconsAdminController],
  providers: [SiteIconsService],
})
export class SiteIconsModule {}
