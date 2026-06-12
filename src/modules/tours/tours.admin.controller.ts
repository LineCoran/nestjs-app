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
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { QueryToursDto } from './dto/query-tours.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/tours')
export class ToursAdminController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  list(@Query() query: QueryToursDto) {
    return this.toursService.findAllForAdmin(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.toursService.findOneForAdmin(id);
  }

  @Post()
  create(@Body() dto: CreateTourDto) {
    return this.toursService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTourDto) {
    return this.toursService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.toursService.remove(id);
  }
}
