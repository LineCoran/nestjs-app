import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TourCategoriesService } from './tour-categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Controller('tour-categories')
export class TourCategoriesPublicController {
  constructor(private readonly service: TourCategoriesService) {}

  @Get()
  list() {
    return this.service.findAll();
  }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/tour-categories')
export class TourCategoriesAdminController {
  constructor(private readonly service: TourCategoriesService) {}

  @Get()
  list() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
