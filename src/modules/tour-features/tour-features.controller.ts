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
import { TourFeaturesService } from './tour-features.service';
import {
  CreateTourFeatureDto,
  UpdateTourFeatureDto,
} from './dto/tour-feature.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/tour-features')
export class TourFeaturesAdminController {
  constructor(private readonly service: TourFeaturesService) {}

  @Get()
  list() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateTourFeatureDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTourFeatureDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
