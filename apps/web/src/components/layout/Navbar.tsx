'use client';

import React from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Sparkles, LogOut, Layers } from 'lucide-react';
import Link from 'next/link';

export function Navbar({ onOpenAIPlanner }: { onOpenAIPlanner?: () => void }) {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/60 backdrop-blur-xl sticky top-0 z-40 px-5 sm:px-6 flex items-center justify-between transition-colors">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-slate-800 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:via-slate-200 dark:to-slate-400 dark:bg-clip-text">
            AI Kanban Planner
          </h1>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium tracking-wide uppercase">
            Clean Architecture • Multi-LLM
          </p>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {onOpenAIPlanner && (
          <button
            id="open-ai-planner-btn"
            onClick={onOpenAIPlanner}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
            <span className="hidden xs:inline">AI Daily Standup</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {user ? (
          <div className="flex items-center gap-3 pl-2.5 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                alt={user.name || 'User'}
                className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user.name || 'User'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Đăng xuất"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
}
