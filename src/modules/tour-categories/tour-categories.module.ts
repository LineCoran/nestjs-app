import { Module } from '@nestjs/common';
import { TourCategoriesService } from './tour-categories.service';
import {
  TourCategoriesAdminController,
  TourCategoriesPublicController,
} from './tour-categories.controller';

@Module({
  controllers: [TourCategoriesPublicController, TourCategoriesAdminController],
  providers: [TourCategoriesService],
})
export class TourCategoriesModule {}
