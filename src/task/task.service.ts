import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from '../generated/prisma/client';

@Injectable()
export class TaskService {
  constructor(private readonly service: PrismaService) {}

  getOne(id: string) {
    return this.service.task.findUnique({
      where: { id },
    });
  }

  getAll(): Promise<Task[]> {
    return this.service.task.findMany();
  }

  create(dto: CreateTaskDto): Promise<Task> {
    return this.service.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        rating: dto.rating,
      },
    });
  }
}
