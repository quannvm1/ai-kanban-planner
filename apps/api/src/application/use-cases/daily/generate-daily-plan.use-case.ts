import { Inject, Injectable } from '@nestjs/common';
import { AIServiceFactory } from '../../../infrastructure/ai/ai-service.factory';
import { GetTodaySummaryUseCase } from './get-today-summary.use-case';
import { SaveDailyJournalUseCase } from './save-daily-journal.use-case';
import { IDailyPlanRepository, DAILY_PLAN_REPOSITORY } from '../../../domain/repositories/daily-plan.repository.interface';
import { DailyPlanEntity } from '../../../domain/entities/daily-plan.entity';
import { AIProviderType, DailyPlanProposal } from '@ai-kanban/shared-types';

export interface GenerateDailyPlanInput {
  userId: string;
  date: string;
  notes?: string;
  preferredProvider?: AIProviderType;
}

@Injectable()
export class GenerateDailyPlanUseCase {
  constructor(
    private aiFactory: AIServiceFactory,
    private summaryUseCase: GetTodaySummaryUseCase,
    private saveJournalUseCase: SaveDailyJournalUseCase,
    @Inject(DAILY_PLAN_REPOSITORY) private dailyRepo: IDailyPlanRepository,
  ) {}

  async execute(input: GenerateDailyPlanInput): Promise<DailyPlanProposal> {
    const targetDate = new Date(input.date);

    // 1. Save journal reflection if provided
    if (input.notes) {
      await this.saveJournalUseCase.execute(input.userId, input.date, input.notes);
    }

    // 2. Aggregate today's context
    const summaryContext = await this.summaryUseCase.execute(input.userId, targetDate);
    if (input.notes) {
      summaryContext.todayJournal = input.notes;
    }

    // 3. Resolve AI Provider and API key (Strategy + Factory)
    const { strategy, apiKey, provider } = await this.aiFactory.resolveProviderForUser(
      input.userId,
      input.preferredProvider,
    );

    // 4. Generate plan via chosen LLM Strategy
    const aiProposal = await strategy.generateDailyPlan(summaryContext, apiKey);

    // 5. Persist the generated plan in DB
    const journal = await this.dailyRepo.findJournalByDate(input.userId, targetDate);
    if (journal) {
      const planEntity = DailyPlanEntity.create({
        dailyJournalId: journal.id,
        providerUsed: provider,
        summaryInsights: aiProposal.summaryInsights,
        suggestedTasks: aiProposal.suggestedTasks.map((t) => ({
          id: crypto.randomUUID(),
          title: t.title,
          description: t.description || null,
          priority: t.priority,
          estimatedMins: t.estimatedMins,
          suggestedColumn: t.suggestedColumn,
          isApplied: false,
          createdTaskId: null,
        })),
      });

      const savedPlan = await this.dailyRepo.savePlan(planEntity);
      return {
        dailyPlanId: savedPlan.id,
        providerUsed: provider,
        summaryInsights: savedPlan.summaryInsights,
        suggestedTasks: savedPlan.suggestedTasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description || undefined,
          priority: t.priority,
          estimatedMins: t.estimatedMins,
          suggestedColumn: t.suggestedColumn,
          isApplied: t.isApplied,
        })),
      };
    }

    return aiProposal;
  }
}
