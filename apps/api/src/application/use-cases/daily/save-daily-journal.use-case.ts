import { Inject, Injectable } from '@nestjs/common';
import { IDailyPlanRepository, DAILY_PLAN_REPOSITORY } from '../../../domain/repositories/daily-plan.repository.interface';
import { DailyJournalEntity } from '../../../domain/entities/daily-journal.entity';

@Injectable()
export class SaveDailyJournalUseCase {
  constructor(@Inject(DAILY_PLAN_REPOSITORY) private dailyRepo: IDailyPlanRepository) {}

  async execute(userId: string, dateStr: string, notes: string) {
    const date = new Date(dateStr);
    const journal = DailyJournalEntity.create({
      userId,
      date,
      notes,
    });
    return this.dailyRepo.saveJournal(journal);
  }
}
