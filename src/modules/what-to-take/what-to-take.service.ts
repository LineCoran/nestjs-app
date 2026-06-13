import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateWhatToTakeCategoryDto,
  CreateWhatToTakeItemDto,
  UpdateWhatToTakeCategoryDto,
  UpdateWhatToTakeItemDto,
} from './dto/what-to-take.dto';

@Injectable()
export class WhatToTakeService {
  constructor(private readonly prisma: PrismaService) {}

  /** Категории с вложенными пунктами — для пикера в админке. */
  listCategories() {
    return this.prisma.whatToTakeCategory.findMany({
      orderBy: { name: 'asc' },
      include: { items: { orderBy: { name: 'asc' } } },
    });
  }

  // ── Категории ──

  createCategory(dto: CreateWhatToTakeCategoryDto) {
    return this.prisma.whatToTakeCategory.create({ data: dto });
  }

  async updateCategory(id: string, dto: UpdateWhatToTakeCategoryDto) {
    await this.getCategoryOrThrow(id);
    return this.prisma.whatToTakeCategory.update({ where: { id }, data: dto });
  }

  async removeCategory(id: string) {
    await this.getCategoryOrThrow(id);
    await this.prisma.whatToTakeCategory.delete({ where: { id } });
    return { success: true };
  }

  // ── Пункты ──

  async createItem(dto: CreateWhatToTakeItemDto) {
    await this.getCategoryOrThrow(dto.categoryId);
    return this.prisma.whatToTakeItem.create({ data: dto });
  }

  async updateItem(id: string, dto: UpdateWhatToTakeItemDto) {
    await this.getItemOrThrow(id);
    return this.prisma.whatToTakeItem.update({ where: { id }, data: dto });
  }

  async removeItem(id: string) {
    await this.getItemOrThrow(id);
    await this.prisma.whatToTakeItem.delete({ where: { id } });
    return { success: true };
  }

  private async getCategoryOrThrow(id: string) {
    const found = await this.prisma.whatToTakeCategory.findUnique({
      where: { id },
    });
    if (!found) throw new NotFoundException(`Категория с ID ${id} не найдена`);
    return found;
  }

  private async getItemOrThrow(id: string) {
    const found = await this.prisma.whatToTakeItem.findUnique({
      where: { id },
    });
    if (!found) throw new NotFoundException(`Пункт с ID ${id} не найден`);
    return found;
  }
}
