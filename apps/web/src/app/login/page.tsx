'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Sparkles, Shield, Lock, ArrowRight, Code2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { devLogin } = useAuthStore();
  const [devEmail, setDevEmail] = useState('nguyen.dev@example.com');
  const [devName, setDevName] = useState('Nguyen Van Dev');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await devLogin(devEmail, devName);
      router.push('/');
    } catch (e: any) {
      alert(e.message || 'Lỗi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl backdrop-blur-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-xl shadow-indigo-600/25 mb-1">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
            AI Kanban Planner
          </h1>
          <p className="text-xs text-slate-400">
            Quản lý công việc cá nhân chi tiết & Trợ lý AI lập kế hoạch thông minh
          </p>
        </div>

        {/* Google OAuth Login */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
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
            <span>Đăng nhập nhanh với Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 text-slate-600 text-xs">
          <div className="flex-1 h-px bg-slate-800" />
          <span>hoặc chế độ Dev Test</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Quick Dev Login */}
        <form onSubmit={handleDevLogin} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Họ & Tên</label>
            <input
              type="text"
              value={devName}
              onChange={(e) => setDevName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Email</label>
            <input
              type="email"
              value={devEmail}
              onChange={(e) => setDevEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            <Code2 className="w-4 h-4" />
            <span>{isLoading ? 'Đang vào...' : 'Vào bằng tài khoản Dev'}</span>
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Mã hóa bảo mật API Key chuẩn AES-256-GCM</span>
        </div>
      </div>
    </div>
  );
}
