import { TaskEntity } from '../entities/task.entity';
import { SubtaskEntity } from '../entities/subtask.entity';

export interface ITaskRepository {
  findById(id: string): Promise<TaskEntity | null>;
  findByBoardId(boardId: string): Promise<TaskEntity[]>;
  findByColumnId(columnId: string): Promise<TaskEntity[]>;
  findCompletedToday(userId: string, date: Date): Promise<TaskEntity[]>;
  findInProgress(userId: string): Promise<TaskEntity[]>;
  create(task: TaskEntity): Promise<TaskEntity>;
  update(task: TaskEntity): Promise<TaskEntity>;
  delete(id: string): Promise<void>;
  
  // Subtasks
  createSubtask(subtask: SubtaskEntity): Promise<SubtaskEntity>;
  updateSubtask(subtask: SubtaskEntity): Promise<SubtaskEntity>;
  deleteSubtask(id: string): Promise<void>;
}

export const TASK_REPOSITORY = 'TASK_REPOSITORY';
