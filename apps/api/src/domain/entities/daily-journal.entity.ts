export class DailyJournalEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly date: Date,
    public notes: string | null = null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  static create(data: {
    id?: string;
    userId: string;
    date: Date;
    notes?: string | null;
  }): DailyJournalEntity {
    return new DailyJournalEntity(
      data.id || crypto.randomUUID(),
      data.userId,
      data.date,
      data.notes || null,
      new Date(),
      new Date(),
    );
  }
}
