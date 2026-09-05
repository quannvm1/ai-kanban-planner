'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import { useThemeStore } from '@/lib/theme-store';
import { AIProviderType, UserApiKeyMasked } from '@ai-kanban/shared-types';
import { apiClient } from '@/lib/api-client';
import {
  Key,
  Shield,
  Check,
  Trash2,
  ArrowLeft,
  Bot,
  Sparkles,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';
import Link from 'next/link';

const SETTINGS_PROVIDER_OPTIONS: SelectOption[] = [
  {
    value: AIProviderType.GEMINI,
    label: 'Google Gemini (Gemini 2.0 / 1.5 Flash)',
    color: '#3b82f6',
    description: 'Tối ưu tốc độ, ngữ cảnh rộng',
  },
  {
    value: AIProviderType.OPENAI,
    label: 'OpenAI (GPT-4o, GPT-4o Mini)',
    color: '#10b981',
    description: 'Khả năng suy luận chi tiết',
  },
  {
    value: AIProviderType.CLAUDE,
    label: 'Anthropic Claude (Claude 3.5 Sonnet / Haiku)',
    color: '#d97706',
    description: 'Văn phong tự nhiên',
  },
  {
    value: AIProviderType.DEEPSEEK,
    label: 'DeepSeek (DeepSeek V3 / R1)',
    color: '#8b5cf6',
    description: 'Chi phí tối ưu, mã nguồn mạnh mẽ',
  },
];

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();
  const [apiKeys, setApiKeys] = useState<UserApiKeyMasked[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>(AIProviderType.GEMINI);
  const [keyInput, setKeyInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const data: any = await apiClient.get('/users/api-keys');
      setApiKeys(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;

    setIsSaving(true);
    try {
      await apiClient.post('/users/api-keys', {
        provider: selectedProvider,
        apiKey: keyInput.trim(),
      });
      setKeyInput('');
      loadKeys();
      alert('Đã lưu và mã hóa an toàn API Key thành công!');
    } catch (e: any) {
      alert(e.message || 'Lỗi khi lưu key');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteKey = async (provider: AIProviderType) => {
    if (!confirm(`Bạn có chắc muốn xóa API key của ${provider}?`)) return;
    try {
      await apiClient.delete(`/users/api-keys/${provider}`);
      loadKeys();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Cài Đặt Hệ Thống & Giao Diện
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tùy chỉnh chế độ hiển thị sáng/tối và cấu hình các nhà cung cấp AI LLM
              </p>
            </div>
          </div>
        </div>

        {/* Theme Settings Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Chế Độ Giao Diện (Theme Mode)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Lựa chọn chế độ hiển thị sáng hoặc tối tùy theo sở thích và điều kiện ánh sáng
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light Mode Option */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Giao Diện Sáng (Light Mode)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Sáng sủa, tương phản cao, tối ưu ban ngày</p>
                </div>
              </div>
              {theme === 'light' && (
                <span className="p-1 rounded-full bg-indigo-600 text-white">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
            </button>

            {/* Dark Mode Option */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/30 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Giao Diện Tối (Dark Mode)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Dịu mắt, tiết kiệm pin, thiết kế cyberpunk</p>
                </div>
              </div>
              {theme === 'dark' && (
                <span className="p-1 rounded-full bg-indigo-500 text-white">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 text-xs flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">Bảo mật chuẩn AES-256-GCM</p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Tất cả API Key của bạn đều được mã hóa đối xứng trước khi ghi vào Database. Hệ thống chỉ giải mã trong RAM khi gọi yêu cầu tóm tắt và lập kế hoạch hàng ngày.
            </p>
          </div>
        </div>

        {/* Add/Update Key Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Thêm / Cập Nhật API Key Mới
          </h3>

          <form onSubmit={handleSaveKey} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Chọn Nhà Cung Cấp AI</label>
                <CustomSelect
                  value={selectedProvider}
                  onChange={(val) => setSelectedProvider(val as AIProviderType)}
                  options={SETTINGS_PROVIDER_OPTIONS}
                  triggerClassName="bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 py-2.5"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">API Key</label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Dán chuỗi API Key của bạn vào đây..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 font-mono transition"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving || !keyInput.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 active:scale-95"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Đang mã hóa & lưu...' : 'Lưu API Key'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Existing Active Keys */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Danh Sách API Keys Đã Cấu Hình ({apiKeys.length})
          </h3>

          <div className="space-y-2 text-xs">
            {apiKeys.map((k) => (
              <div
                key={k.provider}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{k.provider}</span>
                    <p className="font-mono text-slate-500 text-[11px]">{k.maskedKey}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 font-semibold">
                    <Check className="w-3 h-3" /> Đã Kích Hoạt
                  </span>
                  <button
                    onClick={() => handleDeleteKey(k.provider)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-900 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {apiKeys.length === 0 && (
              <p className="text-center py-4 text-slate-500 text-xs">
                Chưa có API key cá nhân nào được lưu. Hệ thống hiện đang dùng System Fallback Key.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
