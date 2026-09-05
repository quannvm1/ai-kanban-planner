import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IDailyPlanRepository } from '../../../domain/repositories/daily-plan.repository.interface';
import { DailyJournalEntity } from '../../../domain/entities/daily-journal.entity';
import { DailyPlanEntity, SuggestedTaskEntity } from '../../../domain/entities/daily-plan.entity';
import { AIProviderType, Priority } from '@ai-kanban/shared-types';

@Injectable()
export class PrismaDailyPlanRepository implements IDailyPlanRepository {
  constructor(private prisma: PrismaService) {}

  async findJournalByDate(userId: string, date: Date): Promise<DailyJournalEntity | null> {
    const journal = await this.prisma.dailyJournal.findFirst({
      where: {
        userId,
        date: {
          equals: new Date(date.toISOString().split('T')[0]),
        },
      },
    });
    if (!journal) return null;
    return new DailyJournalEntity(journal.id, journal.userId, journal.date, journal.notes, journal.createdAt, journal.updatedAt);
  }

  async saveJournal(entity: DailyJournalEntity): Promise<DailyJournalEntity> {
    const dateOnly = new Date(entity.date.toISOString().split('T')[0]);
    const journal = await this.prisma.dailyJournal.upsert({
      where: {
        userId_date: {
          userId: entity.userId,
          date: dateOnly,
        },
      },
      update: { notes: entity.notes },
      create: {
        id: entity.id,
        userId: entity.userId,
        date: dateOnly,
        notes: entity.notes,
      },
    });
    return new DailyJournalEntity(journal.id, journal.userId, journal.date, journal.notes, journal.createdAt, journal.updatedAt);
  }

  async findPlanByDate(userId: string, date: Date): Promise<DailyPlanEntity | null> {
    const dateOnly = new Date(date.toISOString().split('T')[0]);
    const journal = await this.prisma.dailyJournal.findFirst({
      where: { userId, date: dateOnly },
      include: {
        dailyAIPlan: {
          include: { suggestedTasks: true },
        },
      },
    });

    if (!journal || !journal.dailyAIPlan) return null;

    const plan = journal.dailyAIPlan;
    return new DailyPlanEntity(
      plan.id,
      plan.dailyJournalId,
      plan.providerUsed as AIProviderType,
      plan.summaryInsights,
      plan.suggestedTasks.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        priority: s.priority as Priority,
        estimatedMins: s.estimatedMins || 0,
        suggestedColumn: s.suggestedColumn,
        isApplied: s.isApplied,
        createdTaskId: s.createdTaskId,
      })),
      plan.rawResponse as Record<string, any>,
      plan.createdAt,
    );
  }

  async savePlan(plan: DailyPlanEntity): Promise<DailyPlanEntity> {
    // Delete existing plan if any
    await this.prisma.dailyAIPlan.deleteMany({
      where: { dailyJournalId: plan.dailyJournalId },
    });

    const created = await this.prisma.dailyAIPlan.create({
      data: {
        id: plan.id,
        dailyJournalId: plan.dailyJournalId,
        providerUsed: plan.providerUsed,
        summaryInsights: plan.summaryInsights,
        rawResponse: plan.rawResponse as any,
        suggestedTasks: {
          create: plan.suggestedTasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            priority: t.priority,
            estimatedMins: t.estimatedMins,
            suggestedColumn: t.suggestedColumn,
            isApplied: t.isApplied,
          })),
        },
      },
      include: { suggestedTasks: true },
    });

    return new DailyPlanEntity(
      created.id,
      created.dailyJournalId,
      created.providerUsed as AIProviderType,
      created.summaryInsights,
      created.suggestedTasks.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        priority: s.priority as Priority,
        estimatedMins: s.estimatedMins || 0,
        suggestedColumn: s.suggestedColumn,
        isApplied: s.isApplied,
        createdTaskId: s.createdTaskId,
      })),
      created.rawResponse as any,
      created.createdAt,
    );
  }

  async markSuggestedTaskApplied(suggestedTaskId: string, createdTaskId: string): Promise<void> {
    await this.prisma.suggestedTask.update({
      where: { id: suggestedTaskId },
      data: {
        isApplied: true,
        createdTaskId,
      },
    });
  }
}
