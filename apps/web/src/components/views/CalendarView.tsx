'use client';

import React from 'react';
import { BoardDto, TaskDto } from '@ai-kanban/shared-types';
import { Calendar as CalendarIcon, Clock, CheckCircle, Star } from 'lucide-react';

export function CalendarView({
  board,
  onTaskClick,
}: {
  board: BoardDto;
  onTaskClick: (task: TaskDto) => void;
}) {
  const allTasks = board.columns?.flatMap((c) => c.tasks) || [];

  // Group tasks by dueDate or 'No Date'
  const tasksWithDate = allTasks.filter((t) => t.dueDate);
  const tasksWithoutDate = allTasks.filter((t) => !t.dueDate);

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Calendar View
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Theo dõi deadline và tiến độ công việc theo thời gian</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasksWithDate.map((task) => (
          <div
            key={task.id}
            onClick={() => onTaskClick(task)}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 cursor-pointer space-y-2 transition shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : ''}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                {task.spentMins || 0}m / {task.estimatedMins || 0}m
              </span>
            </div>
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              {task.isMandatory && <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />}
              <span>{task.title}</span>
            </h4>
            {task.description && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{task.description}</p>
            )}
          </div>
        ))}
      </div>

      {tasksWithoutDate.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Chưa có hạn chót ({tasksWithoutDate.length} tasks)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tasksWithoutDate.map((task) => (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer text-xs shadow-sm"
              >
                <p className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  {task.isMandatory && <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />}
                  <span>{task.title}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
