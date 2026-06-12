import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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
    return this.prisma.guide.create({ data: { ...dto, order: dto.order ?? 0 } });
  }

  async update(id: string, dto: UpdateGuideDto) {
    await this.findOne(id);
    return this.prisma.guide.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.guide.delete({ where: { id } });
    return { success: true };
  }
}
