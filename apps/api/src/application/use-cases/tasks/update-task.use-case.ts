import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITaskRepository, TASK_REPOSITORY } from '../../../domain/repositories/task.repository.interface';
import { IBoardRepository, BOARD_REPOSITORY } from '../../../domain/repositories/board.repository.interface';
import { Priority } from '@ai-kanban/shared-types';
import { SubtaskEntity } from '../../../domain/entities/subtask.entity';

export interface UpdateTaskInput {
  userId: string;
  taskId: string;
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
  estimatedMins?: number;
  tags?: string[];
  isMandatory?: boolean;
  subtasks?: Array<{ id?: string; title: string; isDone: boolean; orderIndex?: number }>;
}

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY) private taskRepo: ITaskRepository,
    @Inject(BOARD_REPOSITORY) private boardRepo: IBoardRepository,
  ) {}

  async execute(input: UpdateTaskInput) {
    const task = await this.taskRepo.findById(input.taskId);
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }

    const board = await this.boardRepo.findById(task.boardId);
    if (!board || board.userId !== input.userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa task này.');
    }

    if (input.title !== undefined) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.priority !== undefined) task.priority = input.priority;
    if (input.dueDate !== undefined) task.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    if (input.estimatedMins !== undefined) task.estimatedMins = input.estimatedMins;
    if (input.tags !== undefined) task.tags = input.tags;
    if (input.isMandatory !== undefined) task.isMandatory = input.isMandatory;

    // Update subtasks if provided
    if (input.subtasks) {
      for (const s of input.subtasks) {
        if (s.id) {
          await this.taskRepo.updateSubtask(
            new SubtaskEntity(s.id, task.id, s.title, s.isDone, s.orderIndex ?? 0),
          );
        } else {
          await this.taskRepo.createSubtask(
            SubtaskEntity.create({
              taskId: task.id,
              title: s.title,
              isDone: s.isDone,
              orderIndex: s.orderIndex,
            }),
          );
        }
      }
    }

    return this.taskRepo.update(task);
  }
}
