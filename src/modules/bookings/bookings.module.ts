import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BookingsService } from './bookings.service';
import { BookingsGateway } from './bookings.gateway';
import {
  BookingsAdminController,
  BookingsPublicController,
} from './bookings.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev-secret'),
      }),
    }),
  ],
  controllers: [BookingsPublicController, BookingsAdminController],
  providers: [BookingsService, BookingsGateway],
})
export class BookingsModule {}
