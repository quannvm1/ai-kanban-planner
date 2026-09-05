'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ColumnDto, TaskDto } from '@ai-kanban/shared-types';
import { TaskCard } from './TaskCard';
import { Plus, MoreHorizontal, AlertTriangle } from 'lucide-react';

interface KanbanColumnProps {
  column: ColumnDto;
  tasks: TaskDto[];
  onAddTask: (columnId: string) => void;
  onTaskClick: (task: TaskDto) => void;
  onStartPomodoro?: (task: TaskDto) => void;
}

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onTaskClick,
  onStartPomodoro,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { column },
  });

  const isWipExceeded = column.wipLimit && tasks.length > column.wipLimit;

  return (
    <div
      ref={setNodeRef}
      className={`w-80 shrink-0 flex flex-col rounded-2xl bg-slate-950/50 border transition-all duration-200 max-h-[calc(100vh-140px)] ${
        isOver
          ? 'border-indigo-500/80 bg-indigo-950/20 ring-1 ring-indigo-500/30'
          : isWipExceeded
          ? 'border-rose-500/40'
          : 'border-slate-800/80'
      }`}
    >
      {/* Column Header */}
      <div className="p-3.5 pb-2 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full ring-2 ring-slate-900"
            style={{ backgroundColor: column.colorHex || '#6366f1' }}
          />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            {column.title}
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800/80 text-slate-400 border border-slate-700/50">
            {tasks.length}
            {column.wipLimit && ` / ${column.wipLimit}`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isWipExceeded && (
            <span title="Vượt quá giới hạn WIP!" className="text-rose-400">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </span>
          )}
          <button
            onClick={() => onAddTask(column.id)}
            title="Thêm Task"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task List Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[160px]">
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
          <div className="h-24 border border-dashed border-slate-800/80 rounded-xl flex flex-col items-center justify-center text-center p-3 text-slate-500 text-xs">
            <span>Kéo task vào đây</span>
          </div>
        )}
      </div>

      {/* Quick Add Button Footer */}
      <div className="p-2 border-t border-slate-800/40">
        <button
          onClick={() => onAddTask(column.id)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm thẻ</span>
        </button>
      </div>
    </div>
  );
}
