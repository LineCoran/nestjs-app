import { Module } from '@nestjs/common';
import { GuidesService } from './guides.service';
import {
  GuidesAdminController,
  GuidesPublicController,
} from './guides.controller';

@Module({
  controllers: [GuidesPublicController, GuidesAdminController],
  providers: [GuidesService],
})
export class GuidesModule {}
