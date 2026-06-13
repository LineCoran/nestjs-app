import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTourFeatureDto,
  UpdateTourFeatureDto,
} from './dto/tour-feature.dto';

@Injectable()
export class TourFeaturesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.tourFeature.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async create(dto: CreateTourFeatureDto) {
    await this.assertNameFree(dto.name);
    return this.prisma.tourFeature.create({ data: dto });
  }

  async update(id: string, dto: UpdateTourFeatureDto) {
    await this.getOrThrow(id);
    if (dto.name) await this.assertNameFree(dto.name, id);
    return this.prisma.tourFeature.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.getOrThrow(id);
    await this.prisma.tourFeature.delete({ where: { id } });
    return { success: true };
  }

  private async getOrThrow(id: string) {
    const found = await this.prisma.tourFeature.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Фича с ID ${id} не найдена`);
    return found;
  }

  private async assertNameFree(name: string, exceptId?: string) {
    const found = await this.prisma.tourFeature.findUnique({ where: { name } });
    if (found && found.id !== exceptId) {
      throw new ConflictException(`Фича «${name}» уже существует`);
    }
  }
}
