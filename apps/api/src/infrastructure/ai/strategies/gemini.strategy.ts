import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAILLMStrategy } from '../../../domain/services/ai-llm-strategy.interface';
import { AIProviderType, DailyPlanProposal, DailySummaryContext, Priority } from '@ai-kanban/shared-types';

@Injectable()
export class GeminiStrategy implements IAILLMStrategy {
  private readonly logger = new Logger(GeminiStrategy.name);

  getProviderType(): AIProviderType {
    return AIProviderType.GEMINI;
  }

  async testConnection(apiKey: string): Promise<boolean> {
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.7-flash', 'gemini-3.5-flash'];
    const genAI = new GoogleGenerativeAI(apiKey);
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('ping');
        if (result.response.text()) return true;
      } catch (error) {
        this.logger.warn(`Gemini test connection failed for ${modelName}`, error);
      }
    }
    return false;
  }

  async generateDailyPlan(context: DailySummaryContext, apiKey: string): Promise<DailyPlanProposal> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = [
      'gemini-3.7-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash',
    ];

    const systemPrompt = `You are an elite agile productivity coach. Analyze the user's daily performance, focus time, completed tasks, in-progress tasks, and their daily journal notes.
Output a JSON response with:
1. "summaryInsights": A motivational and concise (2-4 sentences) assessment of their productivity, acknowledging accomplishments, spotting bottlenecks, and giving key advice for tomorrow.
2. "suggestedTasks": An array of realistic, actionable tasks for tomorrow.
Each task in "suggestedTasks" MUST have:
- "title": string
- "description": string (optional details or sub-steps)
- "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT"
- "estimatedMins": integer (typically 15 to 120 mins, total recommended tasks should sum to roughly 240-420 mins / 4-7 hours)
- "suggestedColumn": "To Do"
- "isMandatory": boolean (true for essential daily routines/habits, false for regular tasks)
- "subtasks": array of short string checklist items (optional)`;

    const userPrompt = `DAILY ACTIVITY CONTEXT:
Date: ${context.date}
Total Pomodoro Focus Time: ${context.totalFocusMins} minutes
Tasks Completed Today (${context.completedTasksCount}):
${context.completedTasks.map((t) => `- ${t.title} (${t.spentMins}m spent, tags: ${t.tags.join(', ') || 'none'}, mandatory: ${t.isMandatory ? 'YES' : 'NO'})`).join('\n') || 'None'}

Tasks Currently In-Progress:
${context.inProgressTasks.map((t) => `- ${t.title} (est: ${t.estimatedMins}m, spent: ${t.spentMins}m, mandatory: ${t.isMandatory ? 'YES' : 'NO'})`).join('\n') || 'None'}

User's Daily Journal / Reflection:
"${context.todayJournal || 'No reflection entered today.'}"

Please generate the structured JSON plan now.`;

    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        this.logger.log(`Attempting Gemini plan generation with model: ${modelName}`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

        const result = await model.generateContent([
          { text: systemPrompt },
          { text: userPrompt },
        ]);

        let rawText = result.response.text();
        if (rawText.startsWith('```json')) {
          rawText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
        } else if (rawText.startsWith('```')) {
          rawText = rawText.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
        }

        const parsed = JSON.parse(rawText.trim());

        return {
          providerUsed: AIProviderType.GEMINI,
          summaryInsights: parsed.summaryInsights || 'Kế hoạch đã được tạo thành công.',
          suggestedTasks: (parsed.suggestedTasks || []).map((t: any) => ({
            title: t.title || 'Task mới',
            description: t.description || null,
            priority: (t.priority?.toUpperCase() as Priority) || Priority.MEDIUM,
            estimatedMins: Number(t.estimatedMins) || 45,
            suggestedColumn: t.suggestedColumn || 'To Do',
            subtasks: t.subtasks || [],
            isMandatory: Boolean(t.isMandatory),
            isApplied: false,
          })),
        };
      } catch (error: any) {
        this.logger.warn(`Model ${modelName} failed (${error.message}). Trying fallback if available...`);
        lastError = error;
      }
    }

    this.logger.error('All Gemini candidate models failed', lastError);
    throw new Error(`Failed to generate daily plan with Gemini: ${lastError?.message || 'Service Unavailable'}`);
  }
}
