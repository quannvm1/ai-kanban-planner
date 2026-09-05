import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository.interface';
import { ActivityLogEntity } from '../../../domain/entities/activity-log.entity';
import { ActivityAction } from '@ai-kanban/shared-types';

@Injectable()
export class PrismaActivityLogRepository implements IActivityLogRepository {
  constructor(private prisma: PrismaService) {}

  async create(log: ActivityLogEntity): Promise<ActivityLogEntity> {
    const created = await this.prisma.activityLog.create({
      data: {
        id: log.id,
        userId: log.userId,
        taskId: log.taskId,
        action: log.action,
        details: log.details as any,
        recordedAt: log.recordedAt,
      },
    });
    return new ActivityLogEntity(
      created.id,
      created.userId,
      created.taskId,
      created.action as ActivityAction,
      created.details as any,
      created.recordedAt,
    );
  }

  async findByUserAndDate(userId: string, date: Date): Promise<ActivityLogEntity[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await this.prisma.activityLog.findMany({
      where: {
        userId,
        recordedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { recordedAt: 'desc' },
    });

    return logs.map(
      (l) =>
        new ActivityLogEntity(
          l.id,
          l.userId,
          l.taskId,
          l.action as ActivityAction,
          l.details as any,
          l.recordedAt,
        ),
    );
  }

  async countFocusMinutesToday(userId: string, date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const pomodoros = await this.prisma.pomodoroSession.findMany({
      where: {
        userId,
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return pomodoros.reduce((total, p) => total + p.durationMins, 0);
  }
}
