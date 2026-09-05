'use client';

import React, { useState, useEffect } from 'react';
import { TaskDto } from '@ai-kanban/shared-types';
import { Play, Pause, RotateCcw, CheckCircle, X, Timer } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface PomodoroWidgetProps {
  task: TaskDto | null;
  onClose: () => void;
  onFinished: () => void;
}

export function PomodoroWidget({ task, onClose, onFinished }: PomodoroWidgetProps) {
  if (!task) return null;

  const DEFAULT_SECONDS = 25 * 60;
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SECONDS);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleComplete = async () => {
    setIsRunning(false);
    try {
      await apiClient.post(`/tasks/${task.id}/pomodoro`, { durationMins: 25 });
      onFinished();
    } catch (e) {
      console.error(e);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-indigo-400/60 dark:border-indigo-500/50 p-4 shadow-2xl backdrop-blur-xl w-80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1">
              <Timer className="w-3.5 h-3.5" /> Pomodoro Focus
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{task.title}</p>

        {/* Timer Display */}
        <div className="text-center py-2">
          <span className="text-4xl font-extrabold tracking-tight font-mono bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition active:scale-95"
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Tạm dừng' : 'Tiếp tục'}</span>
          </button>
          <button
            onClick={() => setTimeLeft(DEFAULT_SECONDS)}
            title="Đặt lại"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleComplete}
            title="Đánh dấu hoàn thành sớm"
            className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 transition"
          >
            <CheckCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
