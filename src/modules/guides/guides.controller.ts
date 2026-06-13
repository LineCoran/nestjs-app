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
import { GuidesService } from './guides.service';
import { CreateGuideDto, UpdateGuideDto } from './dto/guide.dto';

@Controller('guides')
export class GuidesPublicController {
  constructor(private readonly service: GuidesService) {}

  @Get()
  list() {
    return this.service.findAll();
  }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/guides')
export class GuidesAdminController {
  constructor(private readonly service: GuidesService) {}

  @Get()
  list() {
    return this.service.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateGuideDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGuideDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
