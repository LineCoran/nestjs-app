import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { ToursModule } from '../tours/tours.module';
import { BlogAdminController, BlogPublicController } from './blog.controller';

@Module({
  imports: [ToursModule],
  controllers: [BlogPublicController, BlogAdminController],
  providers: [BlogService],
})
export class BlogModule {}
