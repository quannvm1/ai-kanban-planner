'use client';

import React, { useState } from 'react';
import { Priority } from '@ai-kanban/shared-types';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import { X, Plus, Trash2, Calendar, Clock, Tag, Star, Sparkles } from 'lucide-react';

interface CreateTaskModalProps {
  boardId: string;
  columnId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => Promise<void>;
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

export function CreateTaskModal({
  boardId,
  columnId,
  isOpen,
  onClose,
  onSubmit,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [estimatedMins, setEstimatedMins] = useState(45);
  const [dueDate, setDueDate] = useState('');
  const [isMandatory, setIsMandatory] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([...subtasks, subtaskInput.trim()]);
      setSubtaskInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        boardId,
        columnId,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        estimatedMins: Number(estimatedMins) || 0,
        dueDate: dueDate || undefined,
        isMandatory,
        tags,
        subtasks: subtasks.map((s) => ({ title: s })),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Tạo Thẻ Công Việc Mới
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tiêu đề <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Luyện nói tiếng Anh với ChatGPT"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Mô tả chi tiết (Markdown)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú các yêu cầu, chủ đề, liên kết..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none resize-none transition"
            />
          </div>

          {/* Priority & Estimates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Độ ưu tiên</label>
              <CustomSelect
                value={priority}
                onChange={(val) => setPriority(val as Priority)}
                options={PRIORITY_SELECT_OPTIONS}
                triggerClassName="bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 py-2"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Dự tính (phút)</label>
              <input
                type="number"
                min="0"
                step="5"
                value={estimatedMins}
                onChange={(e) => setEstimatedMins(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 text-slate-800 dark:text-slate-100 outline-none transition"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Hạn chót</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 text-slate-800 dark:text-slate-100 outline-none transition"
              />
            </div>
          </div>

          {/* Daily Mandatory Task Toggle */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl transition-colors ${
                  isMandatory
                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 ring-1 ring-amber-400 dark:ring-amber-500/40'
                    : 'bg-slate-200 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Star className={`w-4 h-4 ${isMandatory ? 'fill-amber-500 dark:fill-amber-400' : ''}`} />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  Nhiệm vụ Daily Bắt Buộc
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Thẻ này sẽ được đánh dấu ưu tiên cao và AI sẽ theo dõi kiểm tra hoàn thành hàng ngày.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMandatory(!isMandatory)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                isMandatory
                  ? 'bg-amber-500 text-white dark:text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {isMandatory ? 'Đã bật' : 'Bật'}
            </button>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block font-medium text-slate-700 dark:text-slate-300">Nhãn / Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Nhập tag tự do rồi ấn Enter (VD: Study, English)..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-700 transition"
              >
                Thêm
              </button>
            </div>

            {/* Currently Selected Tags */}
            <div className="flex flex-wrap gap-1.5 min-h-[28px] p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80">
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[11px] flex items-center gap-1 font-semibold"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                    className="hover:text-rose-500 dark:hover:text-rose-400 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">Chưa chọn nhãn nào</span>
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

          {/* Subtasks */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Checklist công việc</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                placeholder="Thêm bước nhỏ..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-700 transition"
              >
                Thêm
              </button>
            </div>
            <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar">
              {subtasks.map((st, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px]"
                >
                  <span className="text-slate-800 dark:text-slate-200">{st}</span>
                  <button
                    type="button"
                    onClick={() => setSubtasks(subtasks.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-0.5 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50 shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo thẻ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
