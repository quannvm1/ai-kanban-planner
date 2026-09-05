import { AIProviderType, Priority } from '@ai-kanban/shared-types';

export interface SuggestedTaskEntity {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  estimatedMins: number;
  suggestedColumn: string;
  isApplied: boolean;
  createdTaskId: string | null;
}

export class DailyPlanEntity {
  constructor(
    public readonly id: string,
    public readonly dailyJournalId: string,
    public readonly providerUsed: AIProviderType,
    public summaryInsights: string,
    public suggestedTasks: SuggestedTaskEntity[] = [],
    public rawResponse: Record<string, any> = {},
    public readonly createdAt: Date = new Date(),
  ) {}

  static create(data: {
    id?: string;
    dailyJournalId: string;
    providerUsed: AIProviderType;
    summaryInsights: string;
    suggestedTasks?: SuggestedTaskEntity[];
    rawResponse?: Record<string, any>;
  }): DailyPlanEntity {
    return new DailyPlanEntity(
      data.id || crypto.randomUUID(),
      data.dailyJournalId,
      data.providerUsed,
      data.summaryInsights,
      data.suggestedTasks || [],
      data.rawResponse || {},
      new Date(),
    );
  }
}
