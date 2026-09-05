import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITaskRepository, TASK_REPOSITORY } from '../../../domain/repositories/task.repository.interface';
import { IBoardRepository, BOARD_REPOSITORY } from '../../../domain/repositories/board.repository.interface';
import { IActivityLogRepository, ACTIVITY_LOG_REPOSITORY } from '../../../domain/repositories/activity-log.repository.interface';
import { ActivityLogEntity } from '../../../domain/entities/activity-log.entity';

export interface MoveTaskInput {
  userId: string;
  taskId: string;
  targetColumnId: string;
  newOrderIndex: number;
}

@Injectable()
export class MoveTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY) private taskRepo: ITaskRepository,
    @Inject(BOARD_REPOSITORY) private boardRepo: IBoardRepository,
    @Inject(ACTIVITY_LOG_REPOSITORY) private activityRepo: IActivityLogRepository,
  ) {}

  async execute(input: MoveTaskInput) {
    const task = await this.taskRepo.findById(input.taskId);
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }

    const board = await this.boardRepo.findById(task.boardId);
    if (!board || board.userId !== input.userId) {
      throw new ForbiddenException('Bạn không có quyền di chuyển task này.');
    }

    const targetCol = await this.boardRepo.findColumnById(input.targetColumnId);
    if (!targetCol || targetCol.boardId !== board.id) {
      throw new BadRequestException('Cột đích không tồn tại hoặc không thuộc bảng công việc này.');
    }

    const oldColId = task.columnId;
    const isDoneColumn =
      targetCol.title.toLowerCase().includes('done') ||
      targetCol.title.toLowerCase().includes('hoàn thành');

    task.moveTo(input.targetColumnId, input.newOrderIndex, isDoneColumn);
    const updated = await this.taskRepo.update(task);

    // Record Activity Logs
    if (oldColId !== input.targetColumnId) {
      await this.activityRepo.create(
        ActivityLogEntity.create({
          userId: input.userId,
          taskId: task.id,
          action: isDoneColumn ? 'TASK_COMPLETED' : 'TASK_MOVED',
          details: {
            taskTitle: task.title,
            fromColumnId: oldColId,
            toColumnId: input.targetColumnId,
            toColumnTitle: targetCol.title,
          },
        }),
      );
    }

    return updated;
  }
}
