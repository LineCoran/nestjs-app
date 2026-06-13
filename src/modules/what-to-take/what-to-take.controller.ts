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
import { WhatToTakeService } from './what-to-take.service';
import {
  CreateWhatToTakeCategoryDto,
  CreateWhatToTakeItemDto,
  UpdateWhatToTakeCategoryDto,
  UpdateWhatToTakeItemDto,
} from './dto/what-to-take.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/what-to-take')
export class WhatToTakeAdminController {
  constructor(private readonly service: WhatToTakeService) {}

  @Get('categories')
  list() {
    return this.service.listCategories();
  }

  @Post('categories')
  createCategory(@Body() dto: CreateWhatToTakeCategoryDto) {
    return this.service.createCategory(dto);
  }

  @Patch('categories/:id')
  updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateWhatToTakeCategoryDto,
  ) {
    return this.service.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.service.removeCategory(id);
  }

  @Post('items')
  createItem(@Body() dto: CreateWhatToTakeItemDto) {
    return this.service.createItem(dto);
  }

  @Patch('items/:id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateWhatToTakeItemDto) {
    return this.service.updateItem(id, dto);
  }

  @Delete('items/:id')
  removeItem(@Param('id') id: string) {
    return this.service.removeItem(id);
  }
}
