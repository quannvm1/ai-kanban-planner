import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { UserEntity } from '../../domain/entities/user.entity';
import { CreateTaskUseCase } from '../../application/use-cases/tasks/create-task.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/tasks/update-task.use-case';
import { MoveTaskUseCase } from '../../application/use-cases/tasks/move-task.use-case';
import { DeleteTaskUseCase, LogPomodoroUseCase } from '../../application/use-cases/tasks/log-pomodoro.use-case';
import { Priority } from '@ai-kanban/shared-types';

@Controller('api/v1/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private createTaskUseCase: CreateTaskUseCase,
    private updateTaskUseCase: UpdateTaskUseCase,
    private moveTaskUseCase: MoveTaskUseCase,
    private deleteTaskUseCase: DeleteTaskUseCase,
    private logPomodoroUseCase: LogPomodoroUseCase,
  ) {}

  @Post()
  async createTask(
    @CurrentUser() user: UserEntity,
    @Body()
    body: {
      boardId: string;
      columnId: string;
      title: string;
      description?: string;
      priority?: Priority;
      orderIndex?: number;
      dueDate?: string;
      estimatedMins?: number;
      tags?: string[];
      isMandatory?: boolean;
      subtasks?: Array<{ title: string; orderIndex?: number }>;
    },
  ) {
    return this.createTaskUseCase.execute({
      userId: user.id,
      ...body,
    });
  }

  @Patch(':id')
  async updateTask(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      priority?: Priority;
      dueDate?: string | null;
      estimatedMins?: number;
      tags?: string[];
      isMandatory?: boolean;
      subtasks?: Array<{ id?: string; title: string; isDone: boolean; orderIndex?: number }>;
    },
  ) {
    return this.updateTaskUseCase.execute({
      userId: user.id,
      taskId: id,
      ...body,
    });
  }

  @Patch(':id/move')
  async moveTask(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Body() body: { targetColumnId: string; newOrderIndex: number },
  ) {
    return this.moveTaskUseCase.execute({
      userId: user.id,
      taskId: id,
      targetColumnId: body.targetColumnId,
      newOrderIndex: body.newOrderIndex,
    });
  }

  @Delete(':id')
  async deleteTask(@CurrentUser() user: UserEntity, @Param('id') id: string) {
    await this.deleteTaskUseCase.execute(user.id, id);
    return { deleted: true };
  }

  @Post(':id/pomodoro')
  async logPomodoro(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Body() body: { durationMins?: number },
  ) {
    return this.logPomodoroUseCase.execute(user.id, id, body.durationMins || 25);
  }
}
