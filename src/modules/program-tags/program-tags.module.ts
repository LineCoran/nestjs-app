import { Module } from '@nestjs/common';
import { ProgramTagsService } from './program-tags.service';
import { ProgramTagsAdminController } from './program-tags.controller';

@Module({
  controllers: [ProgramTagsAdminController],
  providers: [ProgramTagsService],
})
export class ProgramTagsModule {}
