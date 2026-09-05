import { ActivityLogEntity } from '../entities/activity-log.entity';

export interface IActivityLogRepository {
  create(log: ActivityLogEntity): Promise<ActivityLogEntity>;
  findByUserAndDate(userId: string, date: Date): Promise<ActivityLogEntity[]>;
  countFocusMinutesToday(userId: string, date: Date): Promise<number>;
}

export const ACTIVITY_LOG_REPOSITORY = 'ACTIVITY_LOG_REPOSITORY';
