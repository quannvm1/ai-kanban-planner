'use client';

import React from 'react';
import { BoardDto, Priority } from '@ai-kanban/shared-types';
import { BarChart3, CheckCircle2, Clock, Flame, TrendingUp, Star } from 'lucide-react';

export function AnalyticsView({ board }: { board: BoardDto }) {
  const allTasks = board.columns?.flatMap((c) => c.tasks) || [];
  const completedTasks = allTasks.filter((t) => t.isCompleted);
  const mandatoryTasks = allTasks.filter((t) => t.isMandatory);
  const completedMandatory = mandatoryTasks.filter((t) => t.isCompleted);

  const totalSpentMinutes = allTasks.reduce((acc, t) => acc + (t.spentMins || 0), 0);
  const totalEstimatedMinutes = allTasks.reduce((acc, t) => acc + (t.estimatedMins || 0), 0);

  const completionRate =
    allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Báo Cáo Năng Suất & Hiệu Suất Cá Nhân
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Thống kê tổng quan về khối lượng công việc, tỷ lệ hoàn thành và thời gian tập trung
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tổng số thẻ</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{allTasks.length}</p>
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{completedTasks.length} đã hoàn thành</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tỷ lệ hoàn thành</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completionRate}%</p>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Daily Bắt Buộc</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            {completedMandatory.length}/{mandatoryTasks.length}
          </p>
          <p className="text-[10px] text-amber-700 dark:text-amber-300/80 font-medium">Nhiệm vụ trọng tâm</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Thời gian tập trung</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {(totalSpentMinutes / 60).toFixed(1)} <span className="text-xs font-normal">giờ</span>
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">{totalSpentMinutes}m ghi nhận / {totalEstimatedMinutes}m dự tính</p>
        </div>
      </div>

      {/* Task Distribution by Columns */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          Phân bổ công việc theo cột Kanban
        </h3>
        <div className="space-y-3 text-xs">
          {board.columns?.map((col) => {
            const count = col.tasks?.length || 0;
            const pct = allTasks.length > 0 ? Math.round((count / allTasks.length) * 100) : 0;
            return (
              <div key={col.id} className="space-y-1">
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: col.colorHex || '#6366f1' }}
                    />
                    {col.title}
                  </span>
                  <span>
                    {count} tasks ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: col.colorHex || '#6366f1',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
