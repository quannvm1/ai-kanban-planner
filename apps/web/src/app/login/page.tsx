'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { getApiBaseUrl } from '@/lib/api-client';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Sparkles, Shield, AlertCircle, ArrowRight, Zap, Code2, CheckCircle2 } from 'lucide-react';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { devLogin } = useAuthStore();
  const [devEmail, setDevEmail] = useState('nguyen.dev@example.com');
  const [devName, setDevName] = useState('Nguyen Van Dev');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'google_auth_failed') {
      setErrorMessage(
        'Google OAuth chưa được cấu hình Client Secret hợp lệ trong file .env. Bạn có thể sử dụng tính năng "Đăng nhập nhanh 1-Click" bên dưới để trải nghiệm ngay!',
      );
    }
  }, [searchParams]);

  const handleGoogleLogin = () => {
    const apiUrl = getApiBaseUrl();
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleOneClickLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await devLogin('developer@kanban.ai', 'Senior Engineer');
      router.push('/');
    } catch (e: any) {
      setErrorMessage(e.message || 'Lỗi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await devLogin(devEmail, devName);
      router.push('/');
    } catch (e: any) {
      setErrorMessage(e.message || 'Lỗi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Theme Toggle in top-right */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-8 shadow-2xl backdrop-blur-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-xl shadow-indigo-600/25 mb-1">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            AI Kanban Planner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quản lý công việc cá nhân chi tiết & Trợ lý AI lập kế hoạch thông minh
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 text-xs text-amber-800 dark:text-amber-300 space-y-1 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Thông báo OAuth:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300/90">{errorMessage}</p>
          </div>
        )}

        {/* Primary 1-Click Fast Login */}
        <div className="space-y-3">
          <button
            onClick={handleOneClickLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>{isLoading ? 'Đang đăng nhập...' : '⚡ Đăng Nhập Nhanh 1-Click (Khuyên Dùng)'}</span>
          </button>

          {/* Google OAuth Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Đăng nhập với Google OAuth</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-600 text-xs">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          <span>hoặc tùy chỉnh thông tin tài khoản</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Custom Info Form */}
        <form onSubmit={handleCustomDevLogin} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Họ & Tên</label>
            <input
              type="text"
              value={devName}
              onChange={(e) => setDevName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Email</label>
            <input
              type="email"
              value={devEmail}
              onChange={(e) => setDevEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition disabled:opacity-50"
          >
            <Code2 className="w-4 h-4" />
            <span>Vào bằng email tùy chỉnh</span>
          </button>
        </form>

        <div className="pt-1 text-center text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Mã hóa bảo mật API Key chuẩn AES-256-GCM</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#070B14]" />}>
      <LoginPageContent />
    </React.Suspense>
  );
}
