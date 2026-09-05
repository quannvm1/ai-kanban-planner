'use client';

import React from 'react';
import { BoardDto, TaskDto, Priority } from '@ai-kanban/shared-types';
import { ListTodo, CheckSquare, Clock, Calendar } from 'lucide-react';

export function ListView({
  board,
  onTaskClick,
}: {
  board: BoardDto;
  onTaskClick: (task: TaskDto) => void;
}) {
  const allTasks = board.columns?.flatMap((c) => c.tasks) || [];

  return (
    <div className="p-6 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-indigo-400" />
          List / Table View
        </h2>
        <p className="text-xs text-slate-400">Xem toàn bộ công việc theo dạng bảng danh sách tổng quan</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="p-3.5">Tiêu đề</th>
              <th className="p-3.5">Độ ưu tiên</th>
              <th className="p-3.5">Trạng thái</th>
              <th className="p-3.5">Thời gian</th>
              <th className="p-3.5">Hạn chót</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {allTasks.map((t) => {
              const column = board.columns?.find((c) => c.id === t.columnId);
              return (
                <tr
                  key={t.id}
                  onClick={() => onTaskClick(t)}
                  className="hover:bg-slate-900/50 cursor-pointer transition"
                >
                  <td className="p-3.5 font-medium text-slate-100">{t.title}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: column?.colorHex || '#6366f1' }}
                      />
                      {column?.title || 'Unknown'}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {t.spentMins || 0}m / {t.estimatedMins || 0}m
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString('vi-VN') : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
