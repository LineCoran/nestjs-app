import { Controller, Get, Param, Query } from '@nestjs/common';
import { ToursService } from './tours.service';
import { QueryToursDto } from './dto/query-tours.dto';
import { SearchToursDto } from './dto/search-tours.dto';

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

  /** Умный поиск по турам для шапки сайта. Тоже должен быть объявлен до `:slug`. */
  @Get('search')
  search(@Query() query: SearchToursDto) {
    return this.toursService.searchPublished(query);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.toursService.findBySlug(slug);
  }
}
