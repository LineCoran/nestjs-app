import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.getOne(id);
  }
  @Get()
  getAll() {
    return this.taskService.getAll();
  }
  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.taskService.create(dto);
  }
}
