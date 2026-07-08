import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import { BookingsGateway } from './bookings.gateway';
import {
  CreateBookingDto,
  QueryBookingsDto,
  UpdateBookingStatusDto,
} from './dto/booking.dto';

/** Связи заявки, нужные для таблицы и realtime-уведомления. */
const BOOKING_INCLUDE = {
  tour: { select: { id: true, title: true, slug: true } },
  priceOption: { select: { id: true, formatName: true } },
  session: { select: { id: true, dateFrom: true, dateTo: true } },
} satisfies Prisma.BookingInclude;

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: BookingsGateway,
  ) {}

  async create(dto: CreateBookingDto) {
    const totalPrice = await this.calculateTotalPrice(
      dto.priceOptionId,
      dto.peopleCount,
    );

    const booking = await this.prisma.booking.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        contactMethod: dto.contactMethod,
        source: dto.source,
        type: dto.type,
        tourId: dto.tourId,
        priceOptionId: dto.priceOptionId,
        sessionId: dto.sessionId,
        desiredDates: dto.desiredDates,
        peopleCount: dto.peopleCount,
        tourFormat: dto.tourFormat,
        comment: dto.comment,
        preferences: dto.preferences ?? [],
        isCustomRequest: dto.isCustomRequest ?? false,
        totalPrice,
      },
      include: BOOKING_INCLUDE,
    });

    // Realtime-уведомление админки
    this.gateway.emitNewBooking(booking);

    return booking;
  }

  async findAll(query: QueryBookingsDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.BookingWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.source ? { source: query.source } : {}),
      ...(query.type ? { type: query.type } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        include: BOOKING_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return buildPaginatedResult(items, total, query.page, query.limit);
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto) {
    await this.getOrThrow(id);
    return this.prisma.booking.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  private async getOrThrow(id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException(`Заявка с ID ${id} не найдена`);
    return booking;
  }

  /** Итоговая стоимость = priceFrom выбранного формата × количество человек. */
  private async calculateTotalPrice(
    priceOptionId?: string,
    peopleCount?: number,
  ): Promise<number | undefined> {
    if (!priceOptionId || !peopleCount) return undefined;

    const option = await this.prisma.tourPriceOption.findUnique({
      where: { id: priceOptionId },
      select: { priceFrom: true },
    });

    return option ? option.priceFrom * peopleCount : undefined;
  }
}
