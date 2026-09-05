'use client';

import React, { useState } from 'react';
import { Priority, TaskDto } from '@ai-kanban/shared-types';
import {
  X,
  Trash2,
  Calendar,
  Clock,
  CheckSquare,
  Play,
  Flame,
  Tag,
  Save,
} from 'lucide-react';

interface TaskDetailModalProps {
  task: TaskDto | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<TaskDto>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onStartPomodoro?: (task: TaskDto) => void;
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onStartPomodoro,
}: TaskDetailModalProps) {
  if (!isOpen || !task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [estimatedMins, setEstimatedMins] = useState(task.estimatedMins || 0);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [isSaving, setIsSaving] = useState(false);

  const toggleSubtask = async (subtaskId: string, isDone: boolean) => {
    const updatedSubtasks = subtasks.map((s) =>
      s.id === subtaskId ? { ...s, isDone } : s,
    );
    setSubtasks(updatedSubtasks);
    await onUpdate(task.id, { subtasks: updatedSubtasks as any });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(task.id, {
        title,
        description,
        priority,
        estimatedMins,
        subtasks: subtasks as any,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
              Chi tiết công việc
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(task.id)}
              title="Xóa Task"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Tiêu đề</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-semibold text-slate-100 outline-none focus:border-indigo-500"
          />
        </div>

        {/* Priority & Estimates */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-400 mb-1">Độ ưu tiên</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none"
            >
              <option value={Priority.LOW}>Thấp</option>
              <option value={Priority.MEDIUM}>Trung bình</option>
              <option value={Priority.HIGH}>Cao</option>
              <option value={Priority.URGENT}>Khẩn cấp</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-400 mb-1">Dự tính (phút)</label>
            <input
              type="number"
              value={estimatedMins}
              onChange={(e) => setEstimatedMins(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-400 mb-1">Đã dùng (phút)</label>
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 font-semibold flex items-center justify-between">
              <span>{task.spentMins || 0}m</span>
              {onStartPomodoro && (
                <button
                  onClick={() => onStartPomodoro(task)}
                  className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px]"
                >
                  Focus
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Description Markdown */}
        <div className="text-xs">
          <label className="block font-medium text-slate-400 mb-1">Mô tả chi tiết</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        {/* Subtasks Checklist */}
        <div className="text-xs space-y-2">
          <label className="block font-medium text-slate-400">Danh sách công việc con</label>
          <div className="space-y-1.5">
            {subtasks.map((s) => (
              <div
                key={s.id || s.title}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800"
              >
                <input
                  type="checkbox"
                  checked={s.isDone}
                  onChange={(e) => s.id && toggleSubtask(s.id, e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer bg-slate-900 border-slate-700"
                />
                <span className={`text-xs ${s.isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
