'use client';

import React, { useState, useEffect } from 'react';
import {
  AIProviderType,
  DailyPlanProposal,
  DailySummaryContext,
  SuggestedTaskProposal,
} from '@ai-kanban/shared-types';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import {
  Sparkles,
  X,
  CheckCircle2,
  Clock,
  Bot,
  BrainCircuit,
  Zap,
  Check,
  Edit2,
  Trash2,
  Star,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface DailyPlannerModalProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
  onApplied: () => void;
}

const AI_PROVIDER_OPTIONS: SelectOption[] = [
  {
    value: AIProviderType.GEMINI,
    label: 'Google Gemini 1.5 / 2.0 Flash',
    color: '#3b82f6',
    description: 'Nhanh, thông minh, tối ưu lập kế hoạch',
  },
  {
    value: AIProviderType.OPENAI,
    label: 'OpenAI GPT-4o Mini',
    color: '#10b981',
    description: 'Phân tích sâu sắc, gợi ý chi tiết',
  },
  {
    value: AIProviderType.CLAUDE,
    label: 'Anthropic Claude 3.5 Haiku',
    color: '#d97706',
    description: 'Văn phong súc tích, mạch lạc',
  },
];

export function DailyPlannerModal({
  boardId,
  isOpen,
  onClose,
  onApplied,
}: DailyPlannerModalProps) {
  const [summary, setSummary] = useState<DailySummaryContext | null>(null);
  const [journal, setJournal] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>(AIProviderType.GEMINI);
  const [isLoading, setIsLoading] = useState(false);
  const [planResult, setPlanResult] = useState<DailyPlanProposal | null>(null);
  const [tasksToApply, setTasksToApply] = useState<SuggestedTaskProposal[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTodaySummary();
    }
  }, [isOpen]);

  const loadTodaySummary = async () => {
    try {
      const data: any = await apiClient.get('/daily/today-summary');
      setSummary(data);
      if (data.todayJournal) {
        setJournal(data.todayJournal);
      }
    } catch (e) {
      console.error('Failed to load today summary', e);
    }
  };

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.post('/daily/generate-plan', {
        date: new Date().toISOString().split('T')[0],
        notes: journal,
        preferredProvider: selectedProvider,
      });
      setPlanResult(res);
      setTasksToApply(res.suggestedTasks || []);
    } catch (e: any) {
      alert(e.message || 'Lỗi khi gọi AI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPlan = async () => {
    if (!tasksToApply.length) return;
    setIsApplying(true);
    try {
      await apiClient.post('/daily/apply-plan', {
        boardId,
        approvedTasks: tasksToApply.map((t) => ({
          suggestedTaskId: t.id,
          title: t.title,
          description: t.description,
          priority: t.priority,
          estimatedMins: t.estimatedMins,
          subtasks: t.subtasks,
          isMandatory: t.isMandatory || false,
        })),
      });
      onApplied();
      onClose();
    } catch (e: any) {
      alert(e.message || 'Lỗi khi áp dụng kế hoạch vào Board');
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Daily Standup & AI Planner
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tự động tổng hợp hoạt động hôm nay và tạo kế hoạch tối ưu cho ngày mai
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Today's Collected Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Đã xong hôm nay</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {summary?.completedTasksCount || 0} tasks
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Thời gian tập trung</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {summary?.totalSpentMins || 0} phút
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Đang dở dang</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {summary?.inProgressTasks?.length || 0} tasks
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-slate-950/80 border border-amber-300 dark:border-amber-500/30 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Star className="w-4 h-4 fill-amber-500 dark:fill-amber-400" />
            </div>
            <div>
              <p className="text-[10px] text-amber-800 dark:text-amber-300/80 font-medium">Daily Bắt Buộc</p>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                {summary?.completedMandatoryCount || 0}/{summary?.mandatoryTasksCount || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Daily Journal Reflection */}
        <div className="space-y-2 text-xs">
          <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Nhật ký / Ghi chú cảm nghĩ & vướng mắc hôm nay
          </label>
          <textarea
            rows={3}
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="Hôm nay bạn hoàn thành tốt điều gì? Có blocker nào không? Bạn muốn ưu tiên gì cho ngày mai?"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-purple-500 resize-none transition"
          />
        </div>

        {/* Section 3: AI Provider Choice & Trigger Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Model LLM:</span>
            <div className="flex-1">
              <CustomSelect
                value={selectedProvider}
                onChange={(val) => setSelectedProvider(val as AIProviderType)}
                options={AI_PROVIDER_OPTIONS}
                size="sm"
                triggerClassName="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 py-1.5"
              />
            </div>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold shadow-lg shadow-purple-600/30 disabled:opacity-50 transition active:scale-95"
          >
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>{isLoading ? 'AI Đang Phân Tích & Lập Kế Hoạch...' : 'Phân Tích & Lên Kế Hoạch Ngày Mai'}</span>
          </button>
        </div>

        {/* Section 4: AI Plan Result & Interactive Review */}
        {planResult && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* AI Insights */}
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Đánh Giá Năng Suất Từ AI
              </div>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                {planResult.summaryInsights}
              </p>
            </div>

            {/* Suggested Tasks Review */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Kế hoạch hành động đề xuất ({tasksToApply.length} thẻ)
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Tổng thời gian ước tính: {tasksToApply.reduce((a, t) => a + (t.estimatedMins || 0), 0)}m
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                {tasksToApply.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                          {t.priority}
                        </span>
                        {t.isMandatory && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-300 dark:border-amber-500/30">
                            <Star className="w-2.5 h-2.5 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" /> Daily Bắt Buộc
                          </span>
                        )}
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100">{t.title}</h4>
                        <span className="text-slate-500 text-[11px]">~{t.estimatedMins}m</span>
                      </div>
                      {t.description && <p className="text-slate-600 dark:text-slate-400 text-[11px]">{t.description}</p>}
                    </div>
                    <button
                      onClick={() => setTasksToApply(tasksToApply.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1 transition"
                      title="Bỏ qua task này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleApplyPlan}
                disabled={isApplying || tasksToApply.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 disabled:opacity-50 transition active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>{isApplying ? 'Đang áp dụng...' : '1-Click Áp Dụng Vào Kanban Board'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
