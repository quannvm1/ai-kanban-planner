import { ColumnEntity } from './column.entity';
import { TaskEntity } from './task.entity';

export class BoardEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public title: string,
    public description: string | null = null,
    public columns: ColumnEntity[] = [],
    public tasks: TaskEntity[] = [],
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  static create(data: {
    id?: string;
    userId: string;
    title: string;
    description?: string | null;
  }): BoardEntity {
    return new BoardEntity(
      data.id || crypto.randomUUID(),
      data.userId,
      data.title,
      data.description || null,
      [],
      [],
      new Date(),
      new Date(),
    );
  }
}
