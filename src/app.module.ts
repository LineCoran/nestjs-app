import { join } from 'path';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { ToursModule } from './modules/tours/tours.module';
import { TourCategoriesModule } from './modules/tour-categories/tour-categories.module';
import { TourFeaturesModule } from './modules/tour-features/tour-features.module';
import { ProgramTagsModule } from './modules/program-tags/program-tags.module';
import { WhatToTakeModule } from './modules/what-to-take/what-to-take.module';
import { BlogModule } from './modules/blog/blog.module';
import { GuidesModule } from './modules/guides/guides.module';
import { CompanyInfoModule } from './modules/company-info/company-info.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { UploadModule } from './modules/upload/upload.module';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    // Раздача загруженных изображений по /uploads/<file>
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), UPLOAD_DIR),
      serveRoot: `/${UPLOAD_DIR}`,
    }),
    PrismaModule,
    AuthModule,
    ToursModule,
    TourCategoriesModule,
    TourFeaturesModule,
    ProgramTagsModule,
    WhatToTakeModule,
    BlogModule,
    GuidesModule,
    CompanyInfoModule,
    BookingsModule,
    UploadModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
