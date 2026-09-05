'use client';

import React, { useState, useEffect } from 'react';
import { Priority, TaskDto } from '@ai-kanban/shared-types';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
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
  Plus,
  Star,
  Sparkles,
} from 'lucide-react';

interface TaskDetailModalProps {
  task: TaskDto | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<TaskDto>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onStartPomodoro?: (task: TaskDto) => void;
}

const PRIORITY_SELECT_OPTIONS: SelectOption[] = [
  { value: Priority.URGENT, label: 'Khẩn cấp', color: '#f43f5e', description: 'Cần giải quyết ngay' },
  { value: Priority.HIGH, label: 'Ưu tiên Cao', color: '#f59e0b', description: 'Quan trọng trong ngày' },
  { value: Priority.MEDIUM, label: 'Trung bình', color: '#3b82f6', description: 'Tiến độ bình thường' },
  { value: Priority.LOW, label: 'Thấp', color: '#64748b', description: 'Làm khi rảnh' },
];

const PRESET_TAG_LIST = [
  'Study',
  'English',
  'AI',
  'Frontend',
  'Backend',
  'DevOps',
  'Docker',
  'BugFix',
  'Feature',
  'Design',
  'Docs',
  'Daily',
];

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
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
  const [tags, setTags] = useState<string[]>(task.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isMandatory, setIsMandatory] = useState<boolean>(task.isMandatory || false);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when task prop changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setEstimatedMins(task.estimatedMins || 0);
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setTags(task.tags || []);
      setIsMandatory(task.isMandatory || false);
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

  const handleAddTag = () => {
    const cleanTag = tagInput.trim().replace(/^#/, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const togglePresetTag = (preset: string) => {
    if (tags.includes(preset)) {
      setTags(tags.filter((t) => t !== preset));
    } else {
      setTags([...tags, preset]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([
        ...subtasks,
        { id: crypto.randomUUID(), title: subtaskInput.trim(), isDone: false },
      ]);
      setSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== subtaskId));
  };

  const toggleSubtask = async (subtaskId: string, isDone: boolean) => {
    const updatedSubtasks = subtasks.map((s) =>
      s.id === subtaskId ? { ...s, isDone } : s,
    );
    setSubtasks(updatedSubtasks);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        estimatedMins,
        dueDate: dueDate || null,
        tags,
        isMandatory,
        subtasks: subtasks as any,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
              Chi tiết công việc
            </span>
            {isMandatory && (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                Daily Bắt Buộc
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(task.id)}
              title="Xóa Task"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Tiêu đề</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Priority & Estimates & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-400 mb-1">Độ ưu tiên</label>
            <CustomSelect
              value={priority}
              onChange={(val) => setPriority(val as Priority)}
              options={PRIORITY_SELECT_OPTIONS}
              triggerClassName="bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 py-2"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-400 mb-1">Dự tính (phút)</label>
            <input
              type="number"
              min="0"
              step="5"
              value={estimatedMins}
              onChange={(e) => setEstimatedMins(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-400 mb-1">Đã dùng (phút)</label>
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-indigo-600 dark:text-indigo-300 font-semibold flex items-center justify-between">
              <span>{task.spentMins || 0}m</span>
              {onStartPomodoro && (
                <button
                  onClick={() => onStartPomodoro(task)}
                  className="px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold transition"
                >
                  Focus
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Due Date & Daily Mandatory Flag Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-400 mb-1">Hạn chót</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Daily Mandatory Toggle Switch */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-400 mb-1">Loại nhiệm vụ</label>
            <button
              type="button"
              onClick={() => setIsMandatory(!isMandatory)}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl border transition-all ${
                isMandatory
                  ? 'bg-amber-100 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Star
                  className={`w-4 h-4 ${
                    isMandatory ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span>Daily Bắt Buộc</span>
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isMandatory
                    ? 'bg-amber-200 dark:bg-amber-500/30 text-amber-900 dark:text-amber-200'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isMandatory ? 'BẬT' : 'TẮT'}
              </span>
            </button>
          </div>
        </div>

        {/* Tags Management Section */}
        <div className="space-y-2 text-xs">
          <label className="font-medium text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Quản lý Nhãn / Tags</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Nhập tag mới rồi ấn Enter..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition"
            >
              Thêm Tag
            </button>
          </div>

          {/* Current Selected Tags */}
          <div className="flex flex-wrap gap-1.5 min-h-[28px] p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80">
            {tags.map((t, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold flex items-center gap-1.5"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-rose-500 dark:hover:text-rose-400 ml-0.5 text-slate-400"
                  title="Xóa tag"
                >
                  ×
                </button>
              </span>
            ))}
            {tags.length === 0 && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">Chưa có nhãn nào</span>
            )}
          </div>

          {/* Preset Suggestions */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" /> Gợi ý nhãn nhanh:
            </span>
            <div className="flex flex-wrap gap-1">
              {PRESET_TAG_LIST.map((preset) => {
                const isChecked = tags.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => togglePresetTag(preset)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all ${
                      isChecked
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                  >
                    {isChecked ? `✓ #${preset}` : `+#${preset}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Description Markdown */}
        <div className="text-xs">
          <label className="block font-medium text-slate-700 dark:text-slate-400 mb-1">Mô tả chi tiết</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 font-mono transition"
          />
        </div>

        {/* Subtasks Checklist */}
        <div className="text-xs space-y-2">
          <label className="block font-medium text-slate-700 dark:text-slate-400">Danh sách công việc con</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
              placeholder="Thêm bước con mới..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
            >
              Thêm
            </button>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
            {subtasks.map((s) => (
              <div
                key={s.id || s.title}
                className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 transition"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={s.isDone}
                    onChange={(e) => s.id && toggleSubtask(s.id, e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  />
                  <span className={`text-xs truncate ${s.isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                    {s.title}
                  </span>
                </div>
                {s.id && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(s.id!)}
                    className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 transition"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
