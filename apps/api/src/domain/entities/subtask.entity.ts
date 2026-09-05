export class SubtaskEntity {
  constructor(
    public readonly id: string,
    public readonly taskId: string,
    public title: string,
    public isDone: boolean = false,
    public orderIndex: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  static create(data: {
    id?: string;
    taskId: string;
    title: string;
    isDone?: boolean;
    orderIndex?: number;
  }): SubtaskEntity {
    return new SubtaskEntity(
      data.id || crypto.randomUUID(),
      data.taskId,
      data.title,
      data.isDone ?? false,
      data.orderIndex ?? 0,
      new Date(),
      new Date(),
    );
  }
}
