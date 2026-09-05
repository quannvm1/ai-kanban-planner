'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { AIProviderType, UserApiKeyMasked } from '@ai-kanban/shared-types';
import { apiClient } from '@/lib/api-client';
import { Key, Shield, Check, Trash2, ArrowLeft, Bot, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
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
    <div className="min-h-screen bg-[#090D16] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-400" />
                Cài Đặt Dịch Vụ AI & API Keys
              </h2>
              <p className="text-xs text-slate-400">
                Tự cấu hình API Key cá nhân để sử dụng các mô hình LLM cao cấp nhất
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-emerald-300">Bảo mật chuẩn AES-256-GCM</p>
            <p className="text-slate-300 leading-relaxed">
              Tất cả API Key của bạn đều được mã hóa đối xứng trước khi ghi vào Database. Hệ thống chỉ giải mã trong RAM khi gọi yêu cầu tóm tắt và lập kế hoạch hàng ngày.
            </p>
          </div>
        </div>

        {/* Add/Update Key Form */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Thêm / Cập Nhật API Key Mới
          </h3>

          <form onSubmit={handleSaveKey} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-400 mb-1">Chọn Nhà Cung Cấp AI</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value as AIProviderType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-indigo-500"
                >
                  <option value={AIProviderType.GEMINI}>Google Gemini (Gemini 2.0 / 1.5 Flash)</option>
                  <option value={AIProviderType.OPENAI}>OpenAI (GPT-4o, GPT-4o Mini)</option>
                  <option value={AIProviderType.CLAUDE}>Anthropic Claude (Claude 3.5 Sonnet / Haiku)</option>
                  <option value={AIProviderType.DEEPSEEK}>DeepSeek (DeepSeek V3 / R1)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">API Key</label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Dán chuỗi API Key của bạn vào đây..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving || !keyInput.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Đang mã hóa & lưu...' : 'Lưu API Key'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Existing Active Keys */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Danh Sách API Keys Đã Cấu Hình ({apiKeys.length})
          </h3>

          <div className="space-y-2 text-xs">
            {apiKeys.map((k) => (
              <div
                key={k.provider}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200">{k.provider}</span>
                    <p className="font-mono text-slate-500 text-[11px]">{k.maskedKey}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Check className="w-3 h-3" /> Đã Kích Hoạt
                  </span>
                  <button
                    onClick={() => handleDeleteKey(k.provider)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition"
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
