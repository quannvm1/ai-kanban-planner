import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IBoardRepository, BOARD_REPOSITORY } from '../../../domain/repositories/board.repository.interface';
import { ITaskRepository, TASK_REPOSITORY } from '../../../domain/repositories/task.repository.interface';
import { IDailyPlanRepository, DAILY_PLAN_REPOSITORY } from '../../../domain/repositories/daily-plan.repository.interface';
import { TaskEntity } from '../../../domain/entities/task.entity';
import { SubtaskEntity } from '../../../domain/entities/subtask.entity';
import { Priority } from '@ai-kanban/shared-types';

export interface ApprovedTaskItem {
  suggestedTaskId?: string;
  title: string;
  description?: string;
  priority?: Priority;
  estimatedMins?: number;
  columnId?: string;
  subtasks?: string[];
  isMandatory?: boolean;
}

export interface ApplyDailyPlanInput {
  userId: string;
  boardId: string;
  targetColumnId?: string;
  approvedTasks: ApprovedTaskItem[];
}

@Injectable()
export class ApplyDailyPlanUseCase {
  constructor(
    @Inject(BOARD_REPOSITORY) private boardRepo: IBoardRepository,
    @Inject(TASK_REPOSITORY) private taskRepo: ITaskRepository,
    @Inject(DAILY_PLAN_REPOSITORY) private dailyRepo: IDailyPlanRepository,
  ) {}

  async execute(input: ApplyDailyPlanInput) {
    const board = await this.boardRepo.findById(input.boardId);
    if (!board || board.userId !== input.userId) {
      throw new NotFoundException('Board không tồn tại hoặc bạn không có quyền truy cập.');
    }

    // Default to first 'To Do' column if not provided
    const targetCol =
      input.targetColumnId ||
      board.columns.find((c) => c.title.toLowerCase().includes('to do') || c.title.toLowerCase().includes('cần làm'))
        ?.id ||
      board.columns[0]?.id;

    if (!targetCol) {
      throw new BadRequestException('Board không có cột nào để thêm task.');
    }

    const createdTasks: TaskEntity[] = [];

    for (let i = 0; i < input.approvedTasks.length; i++) {
      const item = input.approvedTasks[i];
      const subtaskEntities = (item.subtasks || []).map((subTitle, sIdx) =>
        SubtaskEntity.create({
          taskId: '',
          title: subTitle,
          orderIndex: sIdx,
        }),
      );

      const task = TaskEntity.create({
        boardId: input.boardId,
        columnId: item.columnId || targetCol,
        title: item.title,
        description: item.description,
        priority: item.priority || Priority.MEDIUM,
        orderIndex: i,
        estimatedMins: item.estimatedMins || 45,
        tags: item.isMandatory ? ['AI Plan', 'Daily Habit'] : ['AI Plan'],
        isMandatory: item.isMandatory || false,
        subtasks: subtaskEntities,
      });

      const savedTask = await this.taskRepo.create(task);
      createdTasks.push(savedTask);

      if (item.suggestedTaskId) {
        await this.dailyRepo.markSuggestedTaskApplied(item.suggestedTaskId, savedTask.id);
      }
    }

    return createdTasks;
  }
}
