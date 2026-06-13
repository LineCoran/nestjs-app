import { Module } from '@nestjs/common';
import { TourFeaturesService } from './tour-features.service';
import { TourFeaturesAdminController } from './tour-features.controller';

@Module({
  controllers: [TourFeaturesAdminController],
  providers: [TourFeaturesService],
})
export class TourFeaturesModule {}
