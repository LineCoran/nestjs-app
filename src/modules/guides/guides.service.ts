import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { CreateGuideDto, UpdateGuideDto } from './dto/guide.dto';

@Injectable()
export class GuidesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.guide.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const guide = await this.prisma.guide.findUnique({ where: { id } });
    if (!guide) throw new NotFoundException(`Гид с ID ${id} не найден`);
    return guide;
  }

  create(dto: CreateGuideDto) {
    const { tags, ...rest } = dto;
    return this.prisma.guide.create({
      data: {
        ...rest,
        order: dto.order ?? 0,
        tags: (tags ?? []) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async update(id: string, dto: UpdateGuideDto) {
    await this.findOne(id);
    const { tags, ...rest } = dto;
    return this.prisma.guide.update({
      where: { id },
      data: {
        ...rest,
        // undefined — поле не трогаем, пустой массив — осознанно чистим теги
        tags:
          tags !== undefined
            ? (tags as unknown as Prisma.InputJsonValue)
            : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.guide.delete({ where: { id } });
    return { success: true };
  }
}
