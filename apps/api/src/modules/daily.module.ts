import { Module } from '@nestjs/common';
import { DailyController } from '../presentation/controllers/daily.controller';
import { GetTodaySummaryUseCase } from '../application/use-cases/daily/get-today-summary.use-case';
import { SaveDailyJournalUseCase } from '../application/use-cases/daily/save-daily-journal.use-case';
import { GenerateDailyPlanUseCase } from '../application/use-cases/daily/generate-daily-plan.use-case';
import { ApplyDailyPlanUseCase } from '../application/use-cases/daily/apply-daily-plan.use-case';
import { AIServiceFactory } from '../infrastructure/ai/ai-service.factory';
import { GeminiStrategy } from '../infrastructure/ai/strategies/gemini.strategy';
import { OpenAIStrategy } from '../infrastructure/ai/strategies/openai.strategy';
import { ClaudeStrategy } from '../infrastructure/ai/strategies/claude.strategy';

@Module({
  controllers: [DailyController],
  providers: [
    GetTodaySummaryUseCase,
    SaveDailyJournalUseCase,
    GenerateDailyPlanUseCase,
    ApplyDailyPlanUseCase,
    AIServiceFactory,
    GeminiStrategy,
    OpenAIStrategy,
    ClaudeStrategy,
  ],
  exports: [
    GetTodaySummaryUseCase,
    SaveDailyJournalUseCase,
    GenerateDailyPlanUseCase,
    ApplyDailyPlanUseCase,
  ],
})
export class DailyModule {}
