import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITaskRepository, TASK_REPOSITORY } from '../../../domain/repositories/task.repository.interface';
import { IBoardRepository, BOARD_REPOSITORY } from '../../../domain/repositories/board.repository.interface';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY) private taskRepo: ITaskRepository,
    @Inject(BOARD_REPOSITORY) private boardRepo: IBoardRepository,
  ) {}

  async execute(userId: string, taskId: string): Promise<void> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }

    const board = await this.boardRepo.findById(task.boardId);
    if (!board || board.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa task này.');
    }

    await this.taskRepo.delete(taskId);
  }
}

@Injectable()
export class LogPomodoroUseCase {
  constructor(
    @Inject(TASK_REPOSITORY) private taskRepo: ITaskRepository,
    @Inject(BOARD_REPOSITORY) private boardRepo: IBoardRepository,
    private prisma: PrismaService,
  ) {}

  async execute(userId: string, taskId: string, durationMins: number = 25) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }

    const board = await this.boardRepo.findById(task.boardId);
    if (!board || board.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền ghi nhận thời gian cho task này.');
    }

    task.addSpentTime(durationMins);
    await this.taskRepo.update(task);

    // Save pomodoro record
    await this.prisma.pomodoroSession.create({
      data: {
        userId,
        taskId,
        durationMins,
      },
    });

    return task;
  }
}
