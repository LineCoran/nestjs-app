import { Module } from '@nestjs/common';
import { ToursService } from './tours.service';
import { ToursPublicController } from './tours.public.controller';
import { ToursAdminController } from './tours.admin.controller';

@Module({
  controllers: [ToursPublicController, ToursAdminController],
  providers: [ToursService],
})
export class ToursModule {}
