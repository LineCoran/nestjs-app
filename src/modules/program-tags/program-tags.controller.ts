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
import {
  CreateProgramTagDto,
  ProgramTagsService,
  UpdateProgramTagDto,
} from './program-tags.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/program-tags')
export class ProgramTagsAdminController {
  constructor(private readonly service: ProgramTagsService) {}

  @Get()
  list() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateProgramTagDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProgramTagDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
