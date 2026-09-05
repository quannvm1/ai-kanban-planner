'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ColumnDto, TaskDto } from '@ai-kanban/shared-types';
import { TaskCard } from './TaskCard';
import { Plus, AlertTriangle } from 'lucide-react';

interface KanbanColumnProps {
  column: ColumnDto;
  tasks: TaskDto[];
  onAddTask: (columnId: string) => void;
  onTaskClick: (task: TaskDto) => void;
  onStartPomodoro?: (task: TaskDto) => void;
  layoutMode?: 'fit' | 'scroll';
}

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onTaskClick,
  onStartPomodoro,
  layoutMode = 'fit',
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { column },
  });

  const isWipExceeded = !!(column.wipLimit && tasks.length > column.wipLimit);

  const columnWidthClass =
    layoutMode === 'fit' ? 'w-full min-w-0 flex-1' : 'w-72 md:w-80 shrink-0';

  return (
    <div
      ref={setNodeRef}
      className={`${columnWidthClass} flex flex-col rounded-2xl bg-slate-100/80 dark:bg-slate-950/40 border backdrop-blur-sm transition-all duration-200 h-full max-h-[calc(100vh-140px)] ${
        isOver
          ? 'border-indigo-500/80 bg-indigo-50/70 dark:bg-indigo-950/25 ring-2 ring-indigo-500/30'
          : isWipExceeded
          ? 'border-rose-300 dark:border-rose-500/50 bg-rose-50/50 dark:bg-rose-950/10'
          : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80'
      }`}
    >
      {/* Column Header */}
      <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/30 rounded-t-2xl">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm shrink-0"
            style={{
              backgroundColor: column.colorHex || '#6366f1',
              boxShadow: `0 0 8px ${column.colorHex || '#6366f1'}40`,
            }}
          />
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider truncate">
            {column.title}
          </h3>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 border ${
              isWipExceeded
                ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
                : 'bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-slate-700/50'
            }`}
          >
            {tasks.length}
            {column.wipLimit ? ` / ${column.wipLimit}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isWipExceeded && (
            <span
              title={`Vượt giới hạn WIP (${column.wipLimit})! Hãy hoàn thành bớt thẻ trước khi nhận thêm.`}
              className="text-rose-500 dark:text-rose-400 p-1"
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
            </span>
          )}
          <button
            onClick={() => onAddTask(column.id)}
            title="Thêm thẻ mới vào cột này"
            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task List Scroll Container */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[140px] custom-scrollbar">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
              onStartPomodoro={onStartPomodoro}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-28 border border-dashed border-slate-300 dark:border-slate-800/80 rounded-xl flex flex-col items-center justify-center text-center p-3 text-slate-400 dark:text-slate-500 text-xs gap-1.5 hover:border-slate-400 dark:hover:border-slate-700/80 transition group/empty">
            <span className="text-[11px] text-slate-500 dark:text-slate-500 group-hover/empty:text-slate-700 dark:group-hover/empty:text-slate-400">
              Kéo thả thẻ vào đây
            </span>
            <button
              onClick={() => onAddTask(column.id)}
              className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Tạo thẻ mới
            </button>
          </div>
        )}
      </div>

      {/* Quick Add Button Footer */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800/40 bg-white/50 dark:bg-slate-900/20 rounded-b-2xl">
        <button
          onClick={() => onAddTask(column.id)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-900/80 border border-transparent hover:border-slate-300 dark:hover:border-slate-800 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm thẻ</span>
        </button>
      </div>
    </div>
  );
}
