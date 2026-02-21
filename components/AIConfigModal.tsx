'use client';

import { ChefHat, Info, X } from 'lucide-react';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AI 服务说明弹窗 - 星露谷风格
 * 现在使用服务端统一 API，无需用户配置
 */
export function AIConfigModal({ isOpen, onClose }: AIConfigModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-[#f8f0d8] rounded-2xl w-full max-w-md overflow-hidden shadow-xl border-2 border-[#8b6914]">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-[#d4c494] flex items-center justify-between bg-[#e8d4a2]">
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-[#e07050]" />
            <h2 className="text-lg font-bold text-[#5c4a32]">唠叨奶奶来了</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8b6914] hover:text-[#5c4a32] hover:bg-[#d4c494] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#90c040] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#5c8a20] shadow-md">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#5c4a32] mb-2">唠叨奶奶在这儿呢！</h3>
            <p className="text-[#8b6914] leading-relaxed">
              奶奶已经在这儿等着了，不用你自己去找钥匙。<br/>
              直接点"听奶奶唠叨两句"就能开始。
            </p>
          </div>

          <div className="bg-[#e8d4a2] rounded-xl p-4 border border-[#b8a878]">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#6090c0] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[#5c4a32]">
                <p className="font-bold mb-1">使用说明</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>奶奶每天最多唠叨 5 次</li>
                  <li>超过次数得等明天</li>
                  <li>唠叨内容会保存 7 天</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#90c040] text-white rounded-xl font-bold hover:bg-[#7ab030] transition-colors border-2 border-[#5c8a20] shadow-md"
          >
            知道了，听奶奶唠叨去！
          </button>
        </div>
      </div>
    </div>
  );
}
