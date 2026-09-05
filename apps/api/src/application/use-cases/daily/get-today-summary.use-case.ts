import { Inject, Injectable } from '@nestjs/common';
import { ITaskRepository, TASK_REPOSITORY } from '../../../domain/repositories/task.repository.interface';
import { IActivityLogRepository, ACTIVITY_LOG_REPOSITORY } from '../../../domain/repositories/activity-log.repository.interface';
import { IDailyPlanRepository, DAILY_PLAN_REPOSITORY } from '../../../domain/repositories/daily-plan.repository.interface';
import { DailySummaryContext } from '@ai-kanban/shared-types';

@Injectable()
export class GetTodaySummaryUseCase {
  constructor(
    @Inject(TASK_REPOSITORY) private taskRepo: ITaskRepository,
    @Inject(ACTIVITY_LOG_REPOSITORY) private activityRepo: IActivityLogRepository,
    @Inject(DAILY_PLAN_REPOSITORY) private dailyRepo: IDailyPlanRepository,
  ) {}

  async execute(userId: string, targetDate: Date = new Date()): Promise<DailySummaryContext> {
    const dateStr = targetDate.toISOString().split('T')[0];

    // 1. Get tasks completed today
    const completedTasks = await this.taskRepo.findCompletedToday(userId, targetDate);

    // 2. Get active in-progress tasks
    const inProgressTasks = await this.taskRepo.findInProgress(userId);

    // 3. Get total pomodoro focus time
    const totalFocusMins = await this.activityRepo.countFocusMinutesToday(userId, targetDate);

    // 4. Get saved journal reflection if exists
    const journal = await this.dailyRepo.findJournalByDate(userId, targetDate);

    const totalSpentMins = completedTasks.reduce((acc, t) => acc + (t.spentMins || 0), 0) + totalFocusMins;

    return {
      date: dateStr,
      completedTasksCount: completedTasks.length,
      totalSpentMins,
      completedTasks: completedTasks.map((t) => ({
        id: t.id,
        title: t.title,
        spentMins: t.spentMins || 0,
        tags: t.tags || [],
      })),
      inProgressTasks: inProgressTasks.map((t) => ({
        id: t.id,
        title: t.title,
        estimatedMins: t.estimatedMins || 0,
        spentMins: t.spentMins || 0,
      })),
      todayJournal: journal?.notes || null,
    };
  }
}
