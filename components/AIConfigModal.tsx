'use client';

import { useState } from 'react';
import { X, Key, Eye, EyeOff, Sparkles } from 'lucide-react';
import { AIConfig, AIProvider } from '@/types/checkup';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AIConfig) => void;
  existingConfig?: AIConfig | null;
}

const PROVIDERS: { value: AIProvider; label: string; models: string[] }[] = [
  { 
    value: 'moonshot', 
    label: 'Moonshot (Kimi)', 
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'] 
  },
  { 
    value: 'zhipu', 
    label: '智谱 AI (GLM)', 
    models: ['glm-4-flash', 'glm-4', 'glm-4-plus'] 
  },
  { 
    value: 'openai', 
    label: 'OpenAI', 
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'] 
  },
  { 
    value: 'anthropic', 
    label: 'Anthropic (Claude)', 
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'] 
  },
  { 
    value: 'custom', 
    label: '自定义 API', 
    models: ['自定义模型'] 
  },
];

/**
 * AI 配置弹窗
 */
export function AIConfigModal({ isOpen, onClose, onSave, existingConfig }: AIConfigModalProps) {
  const [provider, setProvider] = useState<AIProvider>(existingConfig?.provider || 'moonshot');
  const [apiKey, setApiKey] = useState(existingConfig?.apiKey || '');
  const [apiUrl, setApiUrl] = useState(existingConfig?.apiUrl || '');
  const [model, setModel] = useState(existingConfig?.model || '');
  const [showKey, setShowKey] = useState(false);

  const selectedProvider = PROVIDERS.find((p) => p.value === provider);
  const defaultModel = selectedProvider?.models[0] || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    onSave({
      provider,
      apiKey: apiKey.trim(),
      apiUrl: provider === 'custom' ? apiUrl.trim() : undefined,
      model: model || defaultModel,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-stone-800">配置 AI 教练</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              选择 AI 提供商
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setProvider(p.value);
                    setModel(p.models[0]);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    provider === p.value
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              API Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入你的 API Key"
                className="w-full pl-10 pr-10 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-stone-500">
              API Key 仅保存在你的浏览器本地，不会上传到任何服务器
            </p>
          </div>

          {/* Custom API URL */}
          {provider === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                API 地址
              </label>
              <input
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com/v1/chat/completions"
                className="w-full px-3 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              模型
            </label>
            <select
              value={model || defaultModel}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent bg-white"
            >
              {selectedProvider?.models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!apiKey.trim()}
            className="w-full py-3 bg-stone-800 text-white rounded-lg font-medium hover:bg-stone-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            保存并启用 AI 教练
          </button>
        </form>
      </div>
    </div>
  );
}
