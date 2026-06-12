import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyInfoService } from './company-info.service';
import { UpdateCompanyInfoDto } from './dto/company-info.dto';

@Controller('company-info')
export class CompanyInfoPublicController {
  constructor(private readonly service: CompanyInfoService) {}

  @Get()
  get() {
    return this.service.get();
  }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/company-info')
export class CompanyInfoAdminController {
  constructor(private readonly service: CompanyInfoService) {}

  @Get()
  get() {
    return this.service.get();
  }

  @Patch()
  update(@Body() dto: UpdateCompanyInfoDto) {
    return this.service.update(dto);
  }
}
