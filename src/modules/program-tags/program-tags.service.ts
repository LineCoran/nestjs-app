import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';

export class CreateProgramTagDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateProgramTagDto extends PartialType(CreateProgramTagDto) {}

@Injectable()
export class ProgramTagsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.programTag.findMany({ orderBy: { name: 'asc' } });
  }

  async create(dto: CreateProgramTagDto) {
    await this.assertNameFree(dto.name);
    return this.prisma.programTag.create({ data: dto });
  }

  async update(id: string, dto: UpdateProgramTagDto) {
    await this.getOrThrow(id);
    if (dto.name) await this.assertNameFree(dto.name, id);
    return this.prisma.programTag.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.getOrThrow(id);
    await this.prisma.programTag.delete({ where: { id } });
    return { success: true };
  }

  private async getOrThrow(id: string) {
    const found = await this.prisma.programTag.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Тег с ID ${id} не найден`);
    return found;
  }

  private async assertNameFree(name: string, exceptId?: string) {
    const found = await this.prisma.programTag.findUnique({ where: { name } });
    if (found && found.id !== exceptId) {
      throw new ConflictException(`Тег «${name}» уже существует`);
    }
  }
}
