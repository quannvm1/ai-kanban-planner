'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Sparkles } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken, checkAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setToken(token);
      checkAuth().then(() => {
        router.push('/');
      });
    } else {
      router.push('/login');
    }
  }, [searchParams, setToken, checkAuth, router]);

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center space-y-4 text-center">
      <div className="p-4 rounded-3xl bg-indigo-600/20 text-indigo-400 animate-bounce">
        <Sparkles className="w-8 h-8" />
      </div>
      <p className="text-sm font-semibold text-slate-200">Đang xác thực phiên đăng nhập Google...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070B14]" />}>
      <CallbackContent />
    </Suspense>
  );
}
