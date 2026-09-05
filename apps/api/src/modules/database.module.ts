import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { PrismaUserRepository } from '../infrastructure/database/repositories/prisma-user.repository';
import { PrismaBoardRepository } from '../infrastructure/database/repositories/prisma-board.repository';
import { PrismaTaskRepository } from '../infrastructure/database/repositories/prisma-task.repository';
import { PrismaActivityLogRepository } from '../infrastructure/database/repositories/prisma-activity-log.repository';
import { PrismaDailyPlanRepository } from '../infrastructure/database/repositories/prisma-daily-plan.repository';
import { USER_REPOSITORY } from '../domain/repositories/user.repository.interface';
import { BOARD_REPOSITORY } from '../domain/repositories/board.repository.interface';
import { TASK_REPOSITORY } from '../domain/repositories/task.repository.interface';
import { ACTIVITY_LOG_REPOSITORY } from '../domain/repositories/activity-log.repository.interface';
import { DAILY_PLAN_REPOSITORY } from '../domain/repositories/daily-plan.repository.interface';
import { CryptoService } from '../infrastructure/security/crypto.service';

const providers = [
  PrismaService,
  CryptoService,
  { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  { provide: BOARD_REPOSITORY, useClass: PrismaBoardRepository },
  { provide: TASK_REPOSITORY, useClass: PrismaTaskRepository },
  { provide: ACTIVITY_LOG_REPOSITORY, useClass: PrismaActivityLogRepository },
  { provide: DAILY_PLAN_REPOSITORY, useClass: PrismaDailyPlanRepository },
];

@Global()
@Module({
  providers,
  exports: [
    PrismaService,
    CryptoService,
    USER_REPOSITORY,
    BOARD_REPOSITORY,
    TASK_REPOSITORY,
    ACTIVITY_LOG_REPOSITORY,
    DAILY_PLAN_REPOSITORY,
  ],
})
export class DatabaseModule {}
