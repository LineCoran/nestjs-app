import { Module } from '@nestjs/common';
import { CompanyInfoService } from './company-info.service';
import {
  CompanyInfoAdminController,
  CompanyInfoPublicController,
} from './company-info.controller';

@Module({
  controllers: [CompanyInfoPublicController, CompanyInfoAdminController],
  providers: [CompanyInfoService],
})
export class CompanyInfoModule {}
