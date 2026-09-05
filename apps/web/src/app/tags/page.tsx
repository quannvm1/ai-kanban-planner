'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TagsRoutePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/?view=tags');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090D16]">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
    </div>
  );
}
