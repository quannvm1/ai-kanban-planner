import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITaskRepository, TASK_REPOSITORY } from '../../../domain/repositories/task.repository.interface';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class DeleteTaskUseCase {
  constructor(@Inject(TASK_REPOSITORY) private taskRepo: ITaskRepository) {}

  async execute(taskId: string): Promise<void> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }
    await this.taskRepo.delete(taskId);
  }
}

@Injectable()
export class LogPomodoroUseCase {
  constructor(
    @Inject(TASK_REPOSITORY) private taskRepo: ITaskRepository,
    private prisma: PrismaService,
  ) {}

  async execute(userId: string, taskId: string, durationMins: number = 25) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
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
