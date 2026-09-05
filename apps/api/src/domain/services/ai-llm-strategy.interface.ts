import { AIProviderType, DailyPlanProposal, DailySummaryContext } from '@ai-kanban/shared-types';

export interface IAILLMStrategy {
  getProviderType(): AIProviderType;
  generateDailyPlan(context: DailySummaryContext, apiKey: string): Promise<DailyPlanProposal>;
  testConnection(apiKey: string): Promise<boolean>;
}
