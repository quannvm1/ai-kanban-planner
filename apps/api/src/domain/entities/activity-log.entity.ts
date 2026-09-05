import { ActivityAction } from '@ai-kanban/shared-types';

export class ActivityLogEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly taskId: string | null,
    public readonly action: ActivityAction,
    public readonly details: Record<string, any> | null = null,
    public readonly recordedAt: Date = new Date(),
  ) {}

  static create(data: {
    id?: string;
    userId: string;
    taskId?: string | null;
    action: ActivityAction;
    details?: Record<string, any> | null;
  }): ActivityLogEntity {
    return new ActivityLogEntity(
      data.id || crypto.randomUUID(),
      data.userId,
      data.taskId || null,
      data.action,
      data.details || null,
      new Date(),
    );
  }
}
