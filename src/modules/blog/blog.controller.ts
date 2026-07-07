import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BlogService } from './blog.service';
import {
  BlogListQueryDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
} from './dto/blog.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('blog')
export class BlogPublicController {
  constructor(private readonly service: BlogService) {}

  @Get()
  list(@Query() query: BlogListQueryDto) {
    return this.service.findPublished(query);
  }

  @Get('categories')
  categories() {
    return this.service.findCategories();
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/blog')
export class BlogAdminController {
  constructor(private readonly service: BlogService) {}

  @Get()
  list(@Query() query: PaginationDto) {
    return this.service.findAllForAdmin(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.findOneForAdmin(id);
  }

  @Post()
  create(@Body() dto: CreateBlogPostDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
