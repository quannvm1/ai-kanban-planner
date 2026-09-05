export class ColumnEntity {
  constructor(
    public readonly id: string,
    public readonly boardId: string,
    public title: string,
    public orderIndex: number,
    public wipLimit: number | null = null,
    public colorHex: string | null = null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  static create(data: {
    id?: string;
    boardId: string;
    title: string;
    orderIndex: number;
    wipLimit?: number | null;
    colorHex?: string | null;
  }): ColumnEntity {
    return new ColumnEntity(
      data.id || crypto.randomUUID(),
      data.boardId,
      data.title,
      data.orderIndex,
      data.wipLimit || null,
      data.colorHex || null,
      new Date(),
      new Date(),
    );
  }
}
