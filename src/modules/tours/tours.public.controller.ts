import { Controller, Get, Param, Query } from '@nestjs/common';
import { ToursService } from './tours.service';
import { QueryToursDto } from './dto/query-tours.dto';

@Controller('tours')
export class ToursPublicController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  list(@Query() query: QueryToursDto) {
    return this.toursService.findPublished(query);
  }

  /** Доступные значения фильтров каталога. Объявлен до `:slug`, иначе перехватится им. */
  @Get('filters')
  filters() {
    return this.toursService.getFilterFacets();
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.toursService.findBySlug(slug);
  }
}
