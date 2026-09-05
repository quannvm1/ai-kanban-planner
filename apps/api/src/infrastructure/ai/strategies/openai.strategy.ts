import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { IAILLMStrategy } from '../../../domain/services/ai-llm-strategy.interface';
import { AIProviderType, DailyPlanProposal, DailySummaryContext, Priority } from '@ai-kanban/shared-types';

@Injectable()
export class OpenAIStrategy implements IAILLMStrategy {
  private readonly logger = new Logger(OpenAIStrategy.name);

  getProviderType(): AIProviderType {
    return AIProviderType.OPENAI;
  }

  async testConnection(apiKey: string): Promise<boolean> {
    try {
      const openai = new OpenAI({ apiKey });
      const models = await openai.models.list();
      return !!models.data.length;
    } catch (error) {
      this.logger.error('OpenAI test connection failed', error);
      return false;
    }
  }

  async generateDailyPlan(context: DailySummaryContext, apiKey: string): Promise<DailyPlanProposal> {
    const openai = new OpenAI({ apiKey });

    const systemPrompt = `You are an elite agile productivity coach. Output a valid JSON response with "summaryInsights" and "suggestedTasks" (array of tasks with title, description, priority: LOW|MEDIUM|HIGH|URGENT, estimatedMins, suggestedColumn: "To Do", subtasks: string[]).`;

    const userPrompt = `DAILY ACTIVITY CONTEXT:
Date: ${context.date}
Total Focus Time: ${context.totalFocusMins}m
Completed Tasks: ${JSON.stringify(context.completedTasks)}
In-Progress Tasks: ${JSON.stringify(context.inProgressTasks)}
User Notes: "${context.todayJournal || ''}"`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const content = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);

      return {
        providerUsed: AIProviderType.OPENAI,
        summaryInsights: parsed.summaryInsights || 'Kế hoạch đã được tạo thành công.',
        suggestedTasks: (parsed.suggestedTasks || []).map((t: any) => ({
          title: t.title || 'Task mới',
          description: t.description || null,
          priority: (t.priority?.toUpperCase() as Priority) || Priority.MEDIUM,
          estimatedMins: Number(t.estimatedMins) || 45,
          suggestedColumn: t.suggestedColumn || 'To Do',
          subtasks: t.subtasks || [],
          isApplied: false,
        })),
      };
    } catch (error) {
      this.logger.error('Error in OpenAIStrategy generateDailyPlan', error);
      throw new Error(`Failed to generate daily plan with OpenAI: ${error.message}`);
    }
  }
}
