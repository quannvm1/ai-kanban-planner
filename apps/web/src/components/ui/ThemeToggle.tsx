'use client';

import React, { useEffect, useState } from 'react';
import { useThemeStore } from '@/lib/theme-store';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, initTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initTheme();
    setMounted(true);
  }, [initTheme]);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-xl bg-slate-800/40 animate-pulse" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex items-center justify-center p-2 rounded-xl border transition-all duration-200 outline-none ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-amber-300 hover:bg-slate-800 hover:text-amber-200 hover:border-slate-700 shadow-sm'
          : 'bg-slate-100 border-slate-300 text-indigo-600 hover:bg-slate-200 hover:text-indigo-700 hover:border-slate-400 shadow-sm'
      } ${className}`}
      title={isDark ? 'Chuyển sang giao diện Sáng (Light Mode)' : 'Chuyển sang giao diện Tối (Dark Mode)'}
    >
      <div className="relative w-4 h-4">
        <Sun
          className={`w-4 h-4 absolute inset-0 transition-all duration-300 ${
            isDark ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100 text-amber-500'
          }`}
        />
        <Moon
          className={`w-4 h-4 absolute inset-0 transition-all duration-300 ${
            isDark ? 'scale-100 rotate-0 opacity-100 text-indigo-300' : 'scale-0 -rotate-90 opacity-0'
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-medium ml-2 text-slate-700 dark:text-slate-300">
          {isDark ? 'Giao diện Tối' : 'Giao diện Sáng'}
        </span>
      )}
    </button>
  );
}
