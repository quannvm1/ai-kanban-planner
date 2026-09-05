import { DailyJournalEntity } from '../entities/daily-journal.entity';
import { DailyPlanEntity } from '../entities/daily-plan.entity';

export interface IDailyPlanRepository {
  findJournalByDate(userId: string, date: Date): Promise<DailyJournalEntity | null>;
  saveJournal(journal: DailyJournalEntity): Promise<DailyJournalEntity>;
  findPlanByDate(userId: string, date: Date): Promise<DailyPlanEntity | null>;
  savePlan(plan: DailyPlanEntity): Promise<DailyPlanEntity>;
  markSuggestedTaskApplied(suggestedTaskId: string, createdTaskId: string): Promise<void>;
}

export const DAILY_PLAN_REPOSITORY = 'DAILY_PLAN_REPOSITORY';
