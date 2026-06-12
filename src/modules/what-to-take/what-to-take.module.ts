import { Module } from '@nestjs/common';
import { WhatToTakeService } from './what-to-take.service';
import { WhatToTakeAdminController } from './what-to-take.controller';

@Module({
  controllers: [WhatToTakeAdminController],
  providers: [WhatToTakeService],
})
export class WhatToTakeModule {}
