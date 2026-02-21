'use client';

import { useState } from 'react';
import { X, Key, Eye, EyeOff, ChefHat, HelpCircle, ExternalLink } from 'lucide-react';
import { AIConfig, AIProvider } from '@/types/checkup';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AIConfig) => void;
  existingConfig?: AIConfig | null;
}

const PROVIDERS: { value: AIProvider; label: string; models: string[]; desc: string; hasCors: boolean }[] = [
  { 
    value: 'moonshot', 
    label: 'Moonshot', 
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    desc: '国内可用，推荐',
    hasCors: false, // Moonshot 不支持浏览器直接访问
  },
  { 
    value: 'zhipu', 
    label: '智谱', 
    models: ['glm-4-flash', 'glm-4', 'glm-4-plus'],
    desc: '国产大模型',
    hasCors: false,
  },
  { 
    value: 'openai', 
    label: 'OpenAI', 
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    desc: '需要梯子',
    hasCors: false,
  },
  { 
    value: 'anthropic', 
    label: 'Claude', 
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
    desc: '需要梯子',
    hasCors: false,
  },
  { 
    value: 'custom', 
    label: '自定义', 
    models: ['自定义模型'],
    desc: '其他API或代理',
    hasCors: true,
  },
];

/**
 * AI 配置弹窗 - 星露谷风格
 */
export function AIConfigModal({ isOpen, onClose, onSave, existingConfig }: AIConfigModalProps) {
  const [provider, setProvider] = useState<AIProvider>(existingConfig?.provider || 'moonshot');
  const [apiKey, setApiKey] = useState(existingConfig?.apiKey || '');
  const [apiUrl, setApiUrl] = useState(existingConfig?.apiUrl || '');
  const [model, setModel] = useState(existingConfig?.model || '');
  const [showKey, setShowKey] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [useProxy, setUseProxy] = useState(existingConfig?.apiUrl?.includes('cors') || false);

  const selectedProvider = PROVIDERS.find((p) => p.value === provider);
  const defaultModel = selectedProvider?.models[0] || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    // 如果使用代理，自动添加代理地址
    let finalApiUrl = apiUrl;
    if (useProxy && provider !== 'custom') {
      // 使用公开 CORS 代理（仅供测试）
      finalApiUrl = `https://corsproxy.io/?https://api.moonshot.cn/v1/chat/completions`;
    }

    onSave({
      provider,
      apiKey: apiKey.trim(),
      apiUrl: finalApiUrl || undefined,
      model: model || defaultModel,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-[#f8f0d8] rounded-2xl w-full max-w-md overflow-hidden shadow-xl border-2 border-[#8b6914]">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-[#d4c494] flex items-center justify-between bg-[#e8d4a2]">
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-[#e07050]" />
            <h2 className="text-lg font-bold text-[#5c4a32]">叫唠叨奶奶出来</h2>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 text-[#8b6914] hover:text-[#5c4a32] hover:bg-[#d4c494] rounded-lg transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Help Panel */}
        {showHelp && (
          <div className="px-6 py-4 bg-[#f0e8d0] border-b-2 border-[#d4c494] text-sm text-[#5c4a32]">
            <h4 className="font-bold mb-2">为啥可能连不上？</h4>
            <p className="mb-2">
              浏览器有个叫"跨域"的限制，大部分 AI 服务（包括 Moonshot）都不让网页直接调用。
            </p>
            <p className="mb-2">
              <strong>解决办法：</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>使用浏览器插件（如 CORS Unblock）</li>
              <li>使用"自定义"模式填入代理地址</li>
              <li>暂时使用智谱 AI（glm-4-flash 免费）</li>
            </ul>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-bold text-[#5c4a32] mb-2">
              选个唠叨的渠道
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
                  title={p.desc}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-all border-2 ${
                    provider === p.value
                      ? 'bg-[#90c040] text-white border-[#5c8a20]'
                      : 'bg-[#e8d4a2] text-[#5c4a32] border-[#b8a878] hover:bg-[#d4c494]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-[#8b6914]">
              {selectedProvider?.desc}
              {!selectedProvider?.hasCors && (
                <span className="text-[#e07050] ml-1">⚠️ 需要代理</span>
              )}
            </p>
          </div>

          {/* Proxy Option */}
          {provider !== 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useProxy"
                checked={useProxy}
                onChange={(e) => setUseProxy(e.target.checked)}
                className="w-4 h-4 accent-[#90c040]"
              />
              <label htmlFor="useProxy" className="text-sm text-[#5c4a32] font-bold cursor-pointer">
                使用 CORS 代理（不稳定，仅测试）
              </label>
            </div>
          )}

          {/* API Key */}
          <div>
            <label className="block text-sm font-bold text-[#5c4a32] mb-2">
              钥匙（API Key）
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b6914]" />
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="把你的钥匙搁这儿"
                className="w-full pl-10 pr-10 py-2.5 bg-white border-2 border-[#b8a878] rounded-lg focus:outline-none focus:border-[#90c040] text-[#5c4a32] placeholder-[#a08060]"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b6914] hover:text-[#5c4a32]"
              >
                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-[#8b6914]">
              钥匙只存在你手机里，奶奶不会告诉别人
            </p>
          </div>

          {/* Custom API URL */}
          {provider === 'custom' && (
            <div>
              <label className="block text-sm font-bold text-[#5c4a32] mb-2">
                自定义地址
              </label>
              <input
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com/v1/chat/completions"
                className="w-full px-3 py-2.5 bg-white border-2 border-[#b8a878] rounded-lg focus:outline-none focus:border-[#90c040] text-[#5c4a32]"
                required
              />
              <p className="mt-1.5 text-xs text-[#8b6914]">
                可以填入 CORS 代理地址，如 corsproxy.io
              </p>
            </div>
          )}

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-bold text-[#5c4a32] mb-2">
              选个嗓门
            </label>
            <select
              value={model || defaultModel}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border-2 border-[#b8a878] rounded-lg focus:outline-none focus:border-[#90c040] text-[#5c4a32]"
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
            className="w-full py-3 bg-[#90c040] text-white rounded-xl font-bold hover:bg-[#7ab030] disabled:bg-[#c4b494] disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 border-2 border-[#5c8a20] shadow-md"
          >
            <ChefHat className="w-5 h-5" />
            奶奶出来吧！
          </button>

          {/* Get API Key Link */}
          <div className="text-center">
            <a
              href={provider === 'moonshot' ? 'https://platform.moonshot.cn' : 
                    provider === 'zhipu' ? 'https://open.bigmodel.cn' :
                    provider === 'openai' ? 'https://platform.openai.com' :
                    provider === 'anthropic' ? 'https://console.anthropic.com' : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[#6090c0] hover:text-[#305070] font-bold"
            >
              去 {selectedProvider?.label} 搞个钥匙
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
