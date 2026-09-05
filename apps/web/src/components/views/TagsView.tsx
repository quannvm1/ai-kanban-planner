'use client';

import React, { useState } from 'react';
import { BoardDto, TaskDto, Priority } from '@ai-kanban/shared-types';
import {
  Tag,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Layers,
  Clock,
  Star,
  CheckCircle2,
  FolderOpen,
  Filter,
  Sparkles,
  BookOpen,
  Code2,
  CheckSquare,
} from 'lucide-react';

interface TagsViewProps {
  board: BoardDto;
  onTaskClick: (task: TaskDto) => void;
  onUpdateTask: (taskId: string, updates: Partial<TaskDto>) => Promise<void>;
}

// Curated colors for tags based on hash
const TAG_COLORS = [
  { bg: 'bg-indigo-500/15', text: 'text-indigo-600 dark:text-indigo-300', border: 'border-indigo-500/30', hex: '#6366f1' },
  { bg: 'bg-cyan-500/15', text: 'text-cyan-600 dark:text-cyan-300', border: 'border-cyan-500/30', hex: '#06b6d4' },
  { bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-300', border: 'border-emerald-500/30', hex: '#10b981' },
  { bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-300', border: 'border-amber-500/30', hex: '#f59e0b' },
  { bg: 'bg-purple-500/15', text: 'text-purple-600 dark:text-purple-300', border: 'border-purple-500/30', hex: '#a855f7' },
  { bg: 'bg-rose-500/15', text: 'text-rose-600 dark:text-rose-300', border: 'border-rose-500/30', hex: '#f43f5e' },
  { bg: 'bg-blue-500/15', text: 'text-blue-600 dark:text-blue-300', border: 'border-blue-500/30', hex: '#3b82f6' },
];

export const PRESET_TAG_SUGGESTIONS = [
  { name: 'Study', category: 'Học tập', icon: '📖' },
  { name: 'English', category: 'Học tập', icon: '🗣️' },
  { name: 'AI', category: 'Công nghệ', icon: '🤖' },
  { name: 'Frontend', category: 'Kỹ thuật', icon: '⚡' },
  { name: 'Backend', category: 'Kỹ thuật', icon: '🛡️' },
  { name: 'DevOps', category: 'Kỹ thuật', icon: '⚙️' },
  { name: 'Docker', category: 'Kỹ thuật', icon: '🐳' },
  { name: 'BugFix', category: 'Kỹ thuật', icon: '🐛' },
  { name: 'Feature', category: 'Dự án', icon: '🚀' },
  { name: 'Design', category: 'Dự án', icon: '🎨' },
  { name: 'Docs', category: 'Dự án', icon: '📝' },
  { name: 'Meeting', category: 'Công việc', icon: '📅' },
  { name: 'Urgent', category: 'Ưu tiên', icon: '🔥' },
  { name: 'Daily', category: 'Thói quen', icon: '⭐' },
];

function getTagColor(tagName: string) {
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
}

export function TagsView({ board, onTaskClick, onUpdateTask }: TagsViewProps) {
  const allTasks = board.columns?.flatMap((c) => c.tasks) || [];

  // Extract all unique tags and compute count
  const tagMap = new Map<string, TaskDto[]>();
  allTasks.forEach((task) => {
    (task.tags || []).forEach((t) => {
      const cleanTag = t.trim();
      if (!cleanTag) return;
      if (!tagMap.has(cleanTag)) {
        tagMap.set(cleanTag, []);
      }
      tagMap.get(cleanTag)!.push(task);
    });
  });

  const allTagEntries = Array.from(tagMap.entries()).sort(
    (a, b) => b[1].length - a[1].length,
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Create Tag Modal / Form State
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const [createTagName, setCreateTagName] = useState('');
  const [selectedTaskIdsForNewTag, setSelectedTaskIdsForNewTag] = useState<string[]>([]);

  // Filtered tags based on search
  const filteredTagEntries = allTagEntries.filter(([tag]) =>
    tag.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Selected tasks to display
  const tasksToDisplay = selectedTag
    ? tagMap.get(selectedTag) || []
    : allTasks.filter((t) => (t.tags || []).length > 0);

  // Handle Rename Tag across all tasks
  const handleStartRename = (tag: string) => {
    setEditingTag(tag);
    setNewTagName(tag);
  };

  const handleSaveRename = async (oldTag: string) => {
    const cleanNewTag = newTagName.trim().replace(/^#/, '');
    if (!cleanNewTag || cleanNewTag === oldTag) {
      setEditingTag(null);
      return;
    }

    setIsProcessing(true);
    try {
      const tasksWithOldTag = tagMap.get(oldTag) || [];
      for (const task of tasksWithOldTag) {
        const updatedTags = (task.tags || []).map((t) =>
          t.toLowerCase() === oldTag.toLowerCase() ? cleanNewTag : t,
        );
        // Deduplicate tags
        const uniqueTags = Array.from(new Set(updatedTags));
        await onUpdateTask(task.id, { tags: uniqueTags });
      }
      if (selectedTag === oldTag) {
        setSelectedTag(cleanNewTag);
      }
      setEditingTag(null);
    } catch (e) {
      console.error('Failed to rename tag', e);
      alert('Không thể đổi tên tag. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Delete Tag from all tasks
  const handleDeleteTag = async (tagToDelete: string) => {
    if (
      !confirm(
        `Bạn có chắc muốn xóa nhãn #${tagToDelete} khỏi toàn bộ ${
          tagMap.get(tagToDelete)?.length || 0
        } công việc?`,
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      const tasksWithTag = tagMap.get(tagToDelete) || [];
      for (const task of tasksWithTag) {
        const updatedTags = (task.tags || []).filter(
          (t) => t.toLowerCase() !== tagToDelete.toLowerCase(),
        );
        await onUpdateTask(task.id, { tags: updatedTags });
      }
      if (selectedTag === tagToDelete) {
        setSelectedTag(null);
      }
    } catch (e) {
      console.error('Failed to delete tag', e);
      alert('Không thể xóa tag. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Create Tag and attach to selected tasks
  const handleCreateTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = createTagName.trim().replace(/^#/, '');
    if (!cleanTag) return;

    setIsProcessing(true);
    try {
      if (selectedTaskIdsForNewTag.length > 0) {
        for (const taskId of selectedTaskIdsForNewTag) {
          const task = allTasks.find((t) => t.id === taskId);
          if (task) {
            const currentTags = task.tags || [];
            if (!currentTags.includes(cleanTag)) {
              await onUpdateTask(taskId, { tags: [...currentTags, cleanTag] });
            }
          }
        }
      }
      setSelectedTag(cleanTag);
      setCreateTagName('');
      setSelectedTaskIdsForNewTag([]);
      setIsCreateTagOpen(false);
    } catch (e) {
      console.error('Failed to create tag', e);
      alert('Có lỗi xảy ra khi tạo tag.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick Add Preset Tag
  const handleQuickAddPreset = (presetName: string) => {
    setCreateTagName(presetName);
    setIsCreateTagOpen(true);
  };

  const totalDistinctTags = allTagEntries.length;
  const totalTaggedTasks = allTasks.filter((t) => (t.tags || []).length > 0).length;
  const mostPopularTag = allTagEntries[0]?.[0] || '—';

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Quản Lý & Phân Loại Nhãn (Tag Management)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Xem toàn bộ nhãn, tạo nhãn mới, lọc theo tag, đổi tên hoặc xóa nhãn hàng loạt
          </p>
        </div>

        {/* Actions & Search */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nhãn..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 transition shadow-sm"
            />
          </div>

          <button
            onClick={() => {
              setCreateTagName('');
              setIsCreateTagOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Nhãn Mới</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tổng số nhãn đang dùng</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalDistinctTags}</p>
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Đang phân loại trong bảng</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Thẻ có gắn nhãn</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalTaggedTasks}/{allTasks.length}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {allTasks.length > 0 ? Math.round((totalTaggedTasks / allTasks.length) * 100) : 0}% công việc được phân loại
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Nhãn phổ biến nhất</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 truncate">
            {mostPopularTag !== '—' ? `#${mostPopularTag}` : '—'}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {allTagEntries[0]?.[1]?.length || 0} công việc liên kết
          </p>
        </div>
      </div>

      {/* Preset Suggestions Library Card */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Gợi Ý Nhãn Mẫu Phổ Biến (Click để tạo & gắn nhanh):</span>
          </span>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
            {PRESET_TAG_SUGGESTIONS.length} nhãn mẫu
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_TAG_SUGGESTIONS.map((preset) => {
            const isAlreadyUsed = tagMap.has(preset.name);
            const color = getTagColor(preset.name);

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  if (isAlreadyUsed) {
                    setSelectedTag(selectedTag === preset.name ? null : preset.name);
                  } else {
                    handleQuickAddPreset(preset.name);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                  isAlreadyUsed
                    ? selectedTag === preset.name
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : `${color.bg} ${color.text} ${color.border} hover:scale-105`
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 hover:scale-105'
                }`}
                title={
                  isAlreadyUsed
                    ? `Đang có ${tagMap.get(preset.name)?.length || 0} task. Nhấn để lọc!`
                    : `Nhấn để tạo nhãn #${preset.name}`
                }
              >
                <span>{preset.icon}</span>
                <span>#{preset.name}</span>
                {isAlreadyUsed ? (
                  <span className="text-[10px] opacity-80 px-1 rounded-full bg-black/10 dark:bg-white/10">
                    {tagMap.get(preset.name)?.length}
                  </span>
                ) : (
                  <Plus className="w-3 h-3 text-slate-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tag Pills List & Management Grid */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Danh sách Tags trong Bảng ({filteredTagEntries.length})</span>
          </h3>

          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              <X className="w-3.5 h-3.5" /> Xem tất cả tasks
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredTagEntries.map(([tagName, tasks]) => {
            const isSelected = selectedTag === tagName;
            const isEditing = editingTag === tagName;
            const color = getTagColor(tagName);

            return (
              <div
                key={tagName}
                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Tag Header with Name & Actions */}
                <div className="flex items-center justify-between gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-indigo-500 text-slate-800 dark:text-slate-100 outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(tagName);
                          if (e.key === 'Escape') setEditingTag(null);
                        }}
                      />
                      <button
                        onClick={() => handleSaveRename(tagName)}
                        disabled={isProcessing}
                        className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-500"
                        title="Lưu"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setEditingTag(null)}
                        className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="Hủy"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setSelectedTag(isSelected ? null : tagName)}
                      className="flex items-center gap-2 cursor-pointer truncate flex-1"
                    >
                      <span
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold border truncate ${color.bg} ${color.text} ${color.border}`}
                      >
                        #{tagName}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {tasks.length}
                      </span>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartRename(tagName)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
                        title="Đổi tên nhãn"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tagName)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
                        title="Xóa nhãn khỏi tất cả task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Tag Quick Filter Button */}
                <button
                  type="button"
                  onClick={() => setSelectedTag(isSelected ? null : tagName)}
                  className={`w-full py-1 text-[11px] rounded-xl font-medium transition text-center ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {isSelected ? 'Đang lọc tag này ✓' : `Xem ${tasks.length} thẻ`}
                </button>
              </div>
            );
          })}

          {filteredTagEntries.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              Chưa có nhãn nào trong bảng hoặc không khớp với tìm kiếm "{searchQuery}".
              <div className="mt-2">
                <button
                  onClick={() => {
                    setCreateTagName(searchQuery.replace(/^#/, ''));
                    setIsCreateTagOpen(true);
                  }}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-xl font-semibold"
                >
                  + Tạo nhãn "#{searchQuery || 'Mới'}"
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task List Table for Selected Tag(s) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>
              {selectedTag
                ? `Danh sách công việc có nhãn #${selectedTag} (${tasksToDisplay.length})`
                : `Tất cả công việc có gắn nhãn (${tasksToDisplay.length})`}
            </span>
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 overflow-hidden text-xs shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="p-3.5">Tiêu đề</th>
                <th className="p-3.5">Tags</th>
                <th className="p-3.5">Độ ưu tiên</th>
                <th className="p-3.5">Cột / Trạng thái</th>
                <th className="p-3.5">Thời gian</th>
                <th className="p-3.5">Hạn chót</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {tasksToDisplay.map((t) => {
                const column = board.columns?.find((c) => c.id === t.columnId);
                return (
                  <tr
                    key={t.id}
                    onClick={() => onTaskClick(t)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition"
                  >
                    <td className="p-3.5 font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      {t.isMandatory && (
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                      )}
                      <span className="truncate max-w-xs">{t.title}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {t.tags?.map((tagItem, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                              tagItem === selectedTag
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            #{tagItem}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: column?.colorHex || '#6366f1' }}
                        />
                        {column?.title || 'Unknown'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">
                      {t.spentMins || 0}m / {t.estimatedMins || 0}m
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString('vi-VN') : '—'}
                    </td>
                  </tr>
                );
              })}

              {tasksToDisplay.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    Không có công việc nào trong danh mục này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tạo Nhãn Mới (Create Tag Modal) */}
      {isCreateTagOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Tạo Nhãn Mới & Gán Vào Công Việc</span>
              </h3>
              <button
                onClick={() => setIsCreateTagOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTagSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tên nhãn (Tag name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createTagName}
                  onChange={(e) => setCreateTagName(e.target.value)}
                  placeholder="VD: Backend, Feature, Meeting..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 transition font-semibold"
                  autoFocus
                />
              </div>

              {/* Select tasks to attach tag */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Chọn công việc để gán nhãn này ngay ({selectedTaskIdsForNewTag.length} đã chọn):
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar p-2 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {allTasks.map((t) => {
                    const isChecked = selectedTaskIdsForNewTag.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition text-xs ${
                          isChecked
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate flex-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTaskIdsForNewTag([...selectedTaskIdsForNewTag, t.id]);
                              } else {
                                setSelectedTaskIdsForNewTag(
                                  selectedTaskIdsForNewTag.filter((id) => id !== t.id),
                                );
                              }
                            }}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                          />
                          <span className="truncate">{t.title}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTagOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !createTagName.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50 shadow-lg shadow-indigo-600/30 transition active:scale-95"
                >
                  {isProcessing ? 'Đang tạo...' : 'Tạo & Lưu Nhãn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
