import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  QueryBookingsDto,
  UpdateBookingStatusDto,
} from './dto/booking.dto';

@Controller('bookings')
export class BookingsPublicController {
  constructor(private readonly service: BookingsService) {}

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.service.create(dto);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/bookings')
export class BookingsAdminController {
  constructor(private readonly service: BookingsService) {}

  @Get()
  list(@Query() query: QueryBookingsDto) {
    return this.service.findAll(query);
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBookingStatusDto) {
    return this.service.updateStatus(id, dto);
  }
}
