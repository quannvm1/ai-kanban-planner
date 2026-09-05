import { Inject, Injectable } from '@nestjs/common';
import { ITaskRepository, TASK_REPOSITORY } from '../../../domain/repositories/task.repository.interface';
import { IActivityLogRepository, ACTIVITY_LOG_REPOSITORY } from '../../../domain/repositories/activity-log.repository.interface';
import { TaskEntity } from '../../../domain/entities/task.entity';
import { SubtaskEntity } from '../../../domain/entities/subtask.entity';
import { ActivityLogEntity } from '../../../domain/entities/activity-log.entity';
import { Priority } from '@ai-kanban/shared-types';

export interface CreateTaskInput {
  userId: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: Priority;
  orderIndex?: number;
  dueDate?: string;
  estimatedMins?: number;
  tags?: string[];
  subtasks?: Array<{ title: string; orderIndex?: number }>;
}

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY) private taskRepo: ITaskRepository,
    @Inject(ACTIVITY_LOG_REPOSITORY) private activityRepo: IActivityLogRepository,
  ) {}

  async execute(input: CreateTaskInput) {
    const subtaskEntities = (input.subtasks || []).map((s, idx) =>
      SubtaskEntity.create({
        taskId: '',
        title: s.title,
        orderIndex: s.orderIndex ?? idx,
      }),
    );

    const task = TaskEntity.create({
      boardId: input.boardId,
      columnId: input.columnId,
      title: input.title,
      description: input.description,
      priority: input.priority || Priority.MEDIUM,
      orderIndex: input.orderIndex ?? 0,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      estimatedMins: input.estimatedMins || 0,
      tags: input.tags || [],
      subtasks: subtaskEntities,
    });

    const saved = await this.taskRepo.create(task);

    // Auto-record activity log
    await this.activityRepo.create(
      ActivityLogEntity.create({
        userId: input.userId,
        taskId: saved.id,
        action: 'TASK_CREATED',
        details: { title: saved.title, columnId: saved.columnId, priority: saved.priority },
      }),
    );

    return saved;
  }
}
