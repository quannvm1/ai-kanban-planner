'use client';

import React from 'react';
import {
  Kanban,
  Calendar,
  ListTodo,
  BarChart3,
  Tag,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type ActiveView = 'kanban' | 'calendar' | 'list' | 'analytics' | 'tags';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenAIPlanner: () => void;
  onOpenSettings: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  activeView,
  setActiveView,
  onOpenAIPlanner,
  onOpenSettings,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const navItems: Array<{ id: ActiveView; label: string; icon: any }> = [
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'calendar', label: 'Calendar View', icon: Calendar },
    { id: 'list', label: 'List View', icon: ListTodo },
    { id: 'tags', label: 'Quản Lý Tags', icon: Tag },
    { id: 'analytics', label: 'Năng Suất', icon: BarChart3 },
  ];

  return (
    <aside
      className={`border-r border-slate-200 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-950/50 p-3 flex flex-col justify-between shrink-0 hidden md:flex transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Navigation Links */}
      <div className="space-y-5">
        <div className="flex items-center justify-between px-1">
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Góc Nhìn Công Việc
            </p>
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 transition ${
                isCollapsed ? 'mx-auto' : 'ml-auto'
              }`}
              title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900/60'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* AI & Assistants */}
        <div>
          {!isCollapsed && (
            <p className="px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Trợ Lý Thông Minh
            </p>
          )}
          <div className="space-y-1">
            <button
              onClick={onOpenAIPlanner}
              title={isCollapsed ? 'Daily AI Planner' : undefined}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50/60 dark:bg-purple-950/20 hover:bg-purple-100/80 dark:hover:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/30 transition group ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
                {!isCollapsed && <span className="truncate font-semibold">Daily AI Planner</span>}
              </div>
              {!isCollapsed && (
                <span className="px-1.5 py-0.5 text-[9px] bg-purple-200/70 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded font-bold">
                  AI
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Settings */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-1">
        <button
          onClick={onOpenSettings}
          title={isCollapsed ? 'Cài Đặt & API Keys' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900/60 transition ${
            isCollapsed ? 'justify-center px-2' : ''
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400 shrink-0" />
          {!isCollapsed && <span className="truncate">Cài Đặt & Giao Diện</span>}
        </button>
      </div>
    </aside>
  );
}
