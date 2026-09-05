'use client';

import React from 'react';
import {
  Kanban,
  Calendar,
  ListTodo,
  BarChart3,
  Sparkles,
  Settings,
  Timer,
  Layers,
} from 'lucide-react';

export type ActiveView = 'kanban' | 'calendar' | 'list' | 'analytics';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenAIPlanner: () => void;
  onOpenSettings: () => void;
  pomodoroActive?: boolean;
}

export function Sidebar({
  activeView,
  setActiveView,
  onOpenAIPlanner,
  onOpenSettings,
}: SidebarProps) {
  const navItems: Array<{ id: ActiveView; label: string; icon: any }> = [
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'calendar', label: 'Calendar View', icon: Calendar },
    { id: 'list', label: 'List View', icon: ListTodo },
    { id: 'analytics', label: 'Năng Suất', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/40 p-4 flex flex-col justify-between shrink-0 hidden md:flex">
      {/* Navigation Links */}
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Góc Nhìn Công Việc
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* AI & Assistants */}
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Trợ Lý Thông Minh
          </p>
          <div className="space-y-1">
            <button
              onClick={onOpenAIPlanner}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-purple-300 hover:bg-purple-950/30 border border-purple-900/30 transition group"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span>Daily AI Planner</span>
              </div>
              <span className="px-1.5 py-0.5 text-[10px] bg-purple-500/20 text-purple-300 rounded font-semibold">
                AI
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Settings */}
      <div className="pt-4 border-t border-slate-800/80 space-y-1">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition"
        >
          <Settings className="w-4 h-4 text-slate-500" />
          <span>Cài Đặt & API Keys</span>
        </button>
      </div>
    </aside>
  );
}
