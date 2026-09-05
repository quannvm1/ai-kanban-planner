import { Priority } from '@ai-kanban/shared-types';
import { SubtaskEntity } from './subtask.entity';

export class TaskEntity {
  constructor(
    public readonly id: string,
    public readonly boardId: string,
    public columnId: string,
    public title: string,
    public description: string | null = null,
    public priority: Priority = Priority.MEDIUM,
    public orderIndex: number = 0,
    public dueDate: Date | null = null,
    public estimatedMins: number = 0,
    public spentMins: number = 0,
    public isCompleted: boolean = false,
    public completedAt: Date | null = null,
    public tags: string[] = [],
    public subtasks: SubtaskEntity[] = [],
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  static create(data: {
    id?: string;
    boardId: string;
    columnId: string;
    title: string;
    description?: string | null;
    priority?: Priority;
    orderIndex?: number;
    dueDate?: Date | null;
    estimatedMins?: number;
    tags?: string[];
    subtasks?: SubtaskEntity[];
  }): TaskEntity {
    return new TaskEntity(
      data.id || crypto.randomUUID(),
      data.boardId,
      data.columnId,
      data.title,
      data.description || null,
      data.priority || Priority.MEDIUM,
      data.orderIndex ?? 0,
      data.dueDate || null,
      data.estimatedMins ?? 0,
      0,
      false,
      null,
      data.tags || [],
      data.subtasks || [],
      new Date(),
      new Date(),
    );
  }

  moveTo(targetColumnId: string, newOrderIndex: number, isDoneColumn: boolean = false) {
    this.columnId = targetColumnId;
    this.orderIndex = newOrderIndex;
    if (isDoneColumn) {
      this.isCompleted = true;
      this.completedAt = new Date();
    } else if (this.isCompleted) {
      this.isCompleted = false;
      this.completedAt = null;
    }
    this.updatedAt = new Date();
  }

  addSpentTime(minutes: number) {
    this.spentMins = (this.spentMins || 0) + minutes;
    this.updatedAt = new Date();
  }
}
