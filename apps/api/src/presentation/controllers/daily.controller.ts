import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { UserEntity } from '../../domain/entities/user.entity';
import { GetTodaySummaryUseCase } from '../../application/use-cases/daily/get-today-summary.use-case';
import { SaveDailyJournalUseCase } from '../../application/use-cases/daily/save-daily-journal.use-case';
import { GenerateDailyPlanUseCase } from '../../application/use-cases/daily/generate-daily-plan.use-case';
import { ApplyDailyPlanUseCase, ApprovedTaskItem } from '../../application/use-cases/daily/apply-daily-plan.use-case';
import { AIProviderType } from '@ai-kanban/shared-types';

@Controller('api/v1/daily')
@UseGuards(JwtAuthGuard)
export class DailyController {
  constructor(
    private getTodaySummaryUseCase: GetTodaySummaryUseCase,
    private saveDailyJournalUseCase: SaveDailyJournalUseCase,
    private generateDailyPlanUseCase: GenerateDailyPlanUseCase,
    private applyDailyPlanUseCase: ApplyDailyPlanUseCase,
  ) {}

  @Get('today-summary')
  async getTodaySummary(@CurrentUser() user: UserEntity, @Query('date') dateStr?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    return this.getTodaySummaryUseCase.execute(user.id, targetDate);
  }

  @Post('journal')
  async saveJournal(
    @CurrentUser() user: UserEntity,
    @Body() body: { date: string; notes: string },
  ) {
    return this.saveDailyJournalUseCase.execute(user.id, body.date, body.notes);
  }

  @Post('generate-plan')
  async generateDailyPlan(
    @CurrentUser() user: UserEntity,
    @Body() body: { date: string; notes?: string; preferredProvider?: AIProviderType },
  ) {
    return this.generateDailyPlanUseCase.execute({
      userId: user.id,
      date: body.date,
      notes: body.notes,
      preferredProvider: body.preferredProvider,
    });
  }

  @Post('apply-plan')
  async applyDailyPlan(
    @CurrentUser() user: UserEntity,
    @Body() body: { boardId: string; targetColumnId?: string; approvedTasks: ApprovedTaskItem[] },
  ) {
    return this.applyDailyPlanUseCase.execute({
      userId: user.id,
      boardId: body.boardId,
      targetColumnId: body.targetColumnId,
      approvedTasks: body.approvedTasks,
    });
  }
}
