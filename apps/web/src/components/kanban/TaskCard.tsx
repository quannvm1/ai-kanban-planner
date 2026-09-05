'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Priority, TaskDto } from '@ai-kanban/shared-types';
import {
  Clock,
  CheckSquare,
  AlertCircle,
  Tag,
  Play,
  Flame,
  Calendar,
  MoreVertical,
} from 'lucide-react';

interface TaskCardProps {
  task: TaskDto;
  onClick: (task: TaskDto) => void;
  onStartPomodoro?: (task: TaskDto) => void;
}

export function TaskCard({ task, onClick, onStartPomodoro }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case Priority.URGENT:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Flame className="w-3 h-3 text-rose-400" /> Khẩn cấp
          </span>
        );
      case Priority.HIGH:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Cao
          </span>
        );
      case Priority.MEDIUM:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Trung bình
          </span>
        );
      case Priority.LOW:
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-500/20 text-slate-400 border border-slate-500/30">
            Thấp
          </span>
        );
    }
  };

  const completedSubtasks = task.subtasks?.filter((s) => s.isDone).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className="group relative rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/50 p-3.5 space-y-3 shadow-md hover:shadow-indigo-500/10 cursor-grab active:cursor-grabbing transition-all select-none"
    >
      {/* Header: Priority & Tags */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {getPriorityBadge(task.priority)}
          {task.tags?.map((t, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1"
            >
              <Tag className="w-2.5 h-2.5 text-slate-400" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-xs font-semibold text-slate-100 leading-snug line-clamp-2">
        {task.title}
      </h4>

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-emerald-400" />
              Tiến độ
            </span>
            <span>
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{
                width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Footer Meta: Time, Pomodoro Button, Due Date */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          {task.estimatedMins ? (
            <span className="flex items-center gap-1 text-slate-400" title="Ước tính vs Thực tế">
              <Clock className="w-3 h-3 text-indigo-400" />
              {task.spentMins || 0}/{task.estimatedMins}m
            </span>
          ) : null}

          {task.dueDate && (
            <span className="flex items-center gap-1 text-amber-400/90 text-[10px]">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' })}
            </span>
          )}
        </div>

        {onStartPomodoro && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartPomodoro(task);
            }}
            title="Bắt đầu Pomodoro Timer"
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition text-[10px] font-medium"
          >
            <Play className="w-2.5 h-2.5 fill-indigo-400" />
            <span>Focus</span>
          </button>
        )}
      </div>
    </div>
  );
}
