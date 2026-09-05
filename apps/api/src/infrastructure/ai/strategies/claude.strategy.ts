import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { IAILLMStrategy } from '../../../domain/services/ai-llm-strategy.interface';
import { AIProviderType, DailyPlanProposal, DailySummaryContext, Priority } from '@ai-kanban/shared-types';

@Injectable()
export class ClaudeStrategy implements IAILLMStrategy {
  private readonly logger = new Logger(ClaudeStrategy.name);

  getProviderType(): AIProviderType {
    return AIProviderType.CLAUDE;
  }

  async testConnection(apiKey: string): Promise<boolean> {
    try {
      const anthropic = new Anthropic({ apiKey });
      const msg = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'hi' }],
      });
      return !!msg.content.length;
    } catch (error) {
      this.logger.error('Claude test connection failed', error);
      return false;
    }
  }

  async generateDailyPlan(context: DailySummaryContext, apiKey: string): Promise<DailyPlanProposal> {
    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = `You are an agile productivity coach. Return ONLY a valid JSON object (without markdown blocks) adhering to this schema:
{
  "summaryInsights": "string",
  "suggestedTasks": [
    {
      "title": "string",
      "description": "string",
      "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      "estimatedMins": 45,
      "suggestedColumn": "To Do",
      "subtasks": ["string"]
    }
  ]
}`;

    const userPrompt = `DAILY ACTIVITY CONTEXT:
Date: ${context.date}
Focus: ${context.totalFocusMins}m
Completed: ${JSON.stringify(context.completedTasks)}
In-Progress: ${JSON.stringify(context.inProgressTasks)}
Journal: "${context.todayJournal || ''}"`;

    try {
      const msg = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const block = msg.content[0];
      const rawText = block.type === 'text' ? block.text : '';
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        providerUsed: AIProviderType.CLAUDE,
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
      this.logger.error('Error in ClaudeStrategy generateDailyPlan', error);
      throw new Error(`Failed to generate daily plan with Claude: ${error.message}`);
    }
  }
}
