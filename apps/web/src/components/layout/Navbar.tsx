'use client';

import React from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Sparkles, Bell, User, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';

export function Navbar({ onOpenAIPlanner }: { onOpenAIPlanner?: () => void }) {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            AI Kanban Planner
          </h1>
          <p className="text-[11px] text-indigo-400 font-medium tracking-wide uppercase">
            Clean Architecture • Multi-LLM
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {onOpenAIPlanner && (
          <button
            id="open-ai-planner-btn"
            onClick={onOpenAIPlanner}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
            <span>AI Daily Standup</span>
          </button>
        )}

        {user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="flex items-center gap-2.5">
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                alt={user.name || 'User'}
                className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-200">{user.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Đăng xuất"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
}
