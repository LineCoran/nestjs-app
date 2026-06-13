import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogAdminController, BlogPublicController } from './blog.controller';

@Module({
  controllers: [BlogPublicController, BlogAdminController],
  providers: [BlogService],
})
export class BlogModule {}
