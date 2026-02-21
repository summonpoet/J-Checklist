'use client';

import { useState } from 'react';
import { 
  MessageCircleHeart, 
  TrendingUp, 
  Award, 
  Lightbulb, 
  RotateCcw,
  ChevronRight,
  Heart,
  Zap,
  Clock,
  AlertCircle,
  Sparkles,
  Scroll,
  ChefHat
} from 'lucide-react';
import { CheckupReview, DailyStats, CheckupHistory, AIConfig } from '@/types/checkup';
import { AIConfigModal } from './AIConfigModal';

interface CheckupAgentProps {
  config: AIConfig | null;
  todayReview: CheckupReview | null;
  todayStats: DailyStats;
  history: CheckupHistory;
  isAnalyzing: boolean;
  error: string | null;
  onSaveConfig: (config: AIConfig) => void;
  onAnalyze: () => void;
  onClearReview: () => void;
}

const moodConfig = {
  excellent: { label: '倍儿棒', color: 'bg-[#90c040] text-white border-[#5c8a20]', icon: Award },
  good: { label: '不赖', color: 'bg-[#6090c0] text-white border-[#305070]', icon: TrendingUp },
  average: { label: '还行', color: 'bg-[#e0c040] text-[#5c4a32] border-[#b0a030]', icon: Clock },
  poor: { label: '得加油', color: 'bg-[#e07050] text-white border-[#a04030]', icon: Zap },
};

/**
 * 统计数据卡片 - 星露谷风格
 */
function StatCard({ 
  label, 
  value, 
  color = 'wood' 
}: { 
  label: string; 
  value: string;
  color?: 'green' | 'blue' | 'red' | 'wood';
}) {
  const colorClasses = {
    green: 'bg-[#90c040] border-[#5c8a20]',
    blue: 'bg-[#6090c0] border-[#305070]',
    red: 'bg-[#e07050] border-[#a04030]',
    wood: 'bg-[#d4a574] border-[#8b6914]',
  };

  return (
    <div className={`p-3 rounded-xl border-2 ${colorClasses[color]} text-center shadow-md`}>
      <p className="text-xs text-white/80 font-bold mb-1">{label}</p>
      <p className="text-xl font-bold text-white drop-shadow-sm">{value}</p>
    </div>
  );
}

/**
 * 进度条组件 - 星露谷风格
 */
function ProgressBar({ 
  label, 
  completed, 
  total, 
  color = 'wood' 
}: { 
  label: string; 
  completed: number; 
  total: number;
  color?: 'green' | 'blue' | 'purple' | 'red' | 'wood';
}) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const colorClasses = {
    green: 'from-[#90c040] to-[#7ab030]',
    blue: 'from-[#6090c0] to-[#5080b0]',
    purple: 'from-[#9060c0] to-[#8050b0]',
    red: 'from-[#e07050] to-[#d06040]',
    wood: 'from-[#d4a574] to-[#c49464]',
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#5c4a32] font-bold">{label}</span>
        <span className="text-[#5c4a32] font-bold">{completed}/{total}</span>
      </div>
      <div className="h-3 bg-[#3d2914] rounded-full overflow-hidden border border-[#5c4a32]">
        <div 
          className={`h-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * 唠叨奶奶主组件
 */
export function CheckupAgent({
  config,
  todayReview,
  todayStats,
  history,
  isAnalyzing,
  error,
  onSaveConfig,
  onAnalyze,
  onClearReview,
}: CheckupAgentProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 未配置 AI
  if (!config) {
    return (
      <div className="bg-gradient-to-br from-[#f0d8a0] to-[#e8c080] rounded-2xl border-2 border-[#b8a878] p-6 shadow-md">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-[#f8f0d8] rounded-full flex items-center justify-center mx-auto border-4 border-[#8b6914] shadow-inner">
            <ChefHat className="w-10 h-10 text-[#8b6914]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#5c4a32]">叫唤你的唠叨奶奶</h3>
            <p className="text-sm text-[#8b6914] mt-2 max-w-sm mx-auto leading-relaxed">
              唠叨奶奶虽然烦，但她会给你鼠粮。<br/>
              她会每天瞅瞅你活儿干得咋样，<br/>
              唠叨几句，再给点实在的鼓励。
            </p>
          </div>
          <button
            onClick={() => setShowConfig(true)}
            className="px-6 py-3 bg-[#90c040] text-white rounded-xl font-bold hover:bg-[#7ab030] transition-colors border-2 border-[#5c8a20] shadow-md"
          >
            叫奶奶出来
          </button>
        </div>
        <AIConfigModal
          isOpen={showConfig}
          onClose={() => setShowConfig(false)}
          onSave={onSaveConfig}
        />
      </div>
    );
  }

  // 分析中
  if (isAnalyzing) {
    return (
      <div className="bg-[#f8f0d8] rounded-2xl border-2 border-[#b8a878] p-8 shadow-md">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#b8a878] border-t-[#90c040] rounded-full animate-spin" />
            <ChefHat className="w-8 h-8 text-[#8b6914] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center">
            <p className="text-[#5c4a32] font-bold text-lg">唠叨奶奶正在琢磨...</p>
            <p className="text-sm text-[#8b6914] mt-1">翻翻账本，看看你今天干得咋样</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="w-7 h-7 text-[#e07050]" />
          <h2 className="text-xl font-bold text-[#5c4a32]">唠叨奶奶</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-3 py-1.5 text-sm text-[#5c4a32] font-bold hover:bg-[#e8d4a2] rounded-lg transition-colors border border-[#b8a878]"
          >
            {showHistory ? '收起账本' : '翻翻旧账'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-[#f0d0c8] border-2 border-[#e07050] rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#a04030] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-[#a04030] font-bold">{error}</p>
            <button
              onClick={() => setShowConfig(true)}
              className="text-sm text-[#e07050] hover:text-[#a04030] mt-1 underline font-bold"
            >
              去修修
            </button>
          </div>
        </div>
      )}

      {/* Today's Review */}
      {todayReview ? (
        <div className="bg-[#f8f0d8] rounded-2xl border-2 border-[#b8a878] overflow-hidden shadow-md">
          {/* Review Header */}
          <div className="p-5 border-b-2 border-[#e8d4a2]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#8b6914] font-bold">{todayReview.date} 的唠叨</p>
                <h3 className="text-xl font-bold text-[#5c4a32] mt-1">{todayReview.summary}</h3>
              </div>
              <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 border-2 ${moodConfig[todayReview.mood].color}`}>
                {(() => {
                  const Icon = moodConfig[todayReview.mood].icon;
                  return <Icon className="w-4 h-4" />;
                })()}
                <span className="text-sm font-bold">{moodConfig[todayReview.mood].label}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-3 bg-[#3d2914] rounded-full overflow-hidden border border-[#5c4a32]">
                <div 
                  className="h-full bg-gradient-to-r from-[#90c040] to-[#7ab030] rounded-full transition-all"
                  style={{ width: `${todayReview.score}%` }}
                />
              </div>
              <span className="text-sm font-bold text-[#5c4a32]">{todayReview.score}分</span>
            </div>
          </div>

          {/* Review Content */}
          <div className="p-5 space-y-4">
            <p className="text-[#5c4a32] leading-relaxed font-medium">{todayReview.detailedReview}</p>
            
            {todayReview.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {todayReview.highlights.map((highlight, i) => (
                  <span 
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#d4e8c0] text-[#5c8a20] rounded-full text-sm font-bold border border-[#7a9a5a]"
                  >
                    <Award className="w-3.5 h-3.5" />
                    {highlight}
                  </span>
                ))}
              </div>
            )}

            {todayReview.suggestions.length > 0 && (
              <div className="p-3 bg-[#e0f0f8] rounded-xl border border-[#6090c0]">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-[#6090c0] mt-0.5" />
                  <div className="space-y-1">
                    {todayReview.suggestions.map((suggestion, i) => (
                      <p key={i} className="text-sm text-[#305070] font-bold">{suggestion}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-5 py-3 bg-[#e8d4a2] border-t-2 border-[#d4c494] flex items-center justify-between">
            <span className="text-xs text-[#8b6914] font-bold">
              唠叨奶奶来自 {config.provider}
            </span>
            <button
              onClick={onClearReview}
              className="flex items-center gap-1.5 text-sm text-[#5c4a32] hover:text-[#8b6914] transition-colors font-bold"
            >
              <RotateCcw className="w-4 h-4" />
              再唠叨一遍
            </button>
          </div>
        </div>
      ) : (
        /* Ready to Analyze */
        <div className="bg-[#f8f0d8] rounded-2xl border-2 border-[#b8a878] p-5 shadow-md">
          {/* Stats Preview */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard 
              label="J人百分比" 
              value={`${todayStats.completionRate}%`}
              color="green"
            />
            <StatCard 
              label="重要事儿" 
              value={`${todayStats.highImportance.completed}/${todayStats.highImportance.total}`}
              color="blue"
            />
            <StatCard 
              label="苦力活" 
              value={`${todayStats.highDifficulty.completed}/${todayStats.highDifficulty.total}`}
              color="red"
            />
          </div>

          {/* Progress Bars */}
          <div className="space-y-4 mb-6">
            <ProgressBar 
              label="活儿进度" 
              completed={todayStats.completedTasks} 
              total={todayStats.totalTasks}
              color="green"
            />
            <ProgressBar 
              label="重要事儿进度" 
              completed={todayStats.highImportance.completed} 
              total={todayStats.highImportance.total}
              color="blue"
            />
            <ProgressBar 
              label="苦力活进度" 
              completed={todayStats.highDifficulty.completed} 
              total={todayStats.highDifficulty.total}
              color="purple"
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={onAnalyze}
            className="w-full py-3 bg-gradient-to-r from-[#e07050] to-[#d06040] text-white rounded-xl font-bold hover:from-[#d06040] hover:to-[#c05030] transition-all flex items-center justify-center gap-2 shadow-md border-2 border-[#a04030]"
          >
            <ChefHat className="w-5 h-5" />
            听奶奶唠叨两句
          </button>
        </div>
      )}

      {/* History */}
      {showHistory && history.reviews.length > 0 && (
        <div className="bg-[#f8f0d8] rounded-2xl border-2 border-[#b8a878] p-5 shadow-md">
          <h3 className="font-bold text-[#5c4a32] mb-4 flex items-center gap-2">
            <Scroll className="w-5 h-5" />
            奶奶的唠叨本
          </h3>
          <div className="space-y-3">
            {history.reviews.slice().reverse().map((review) => (
              <div 
                key={review.date}
                className="flex items-center gap-3 p-3 bg-[#e8d4a2] rounded-xl hover:bg-[#d4c494] transition-colors border border-[#b8a878]"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${moodConfig[review.mood].color}`}>
                  <span className="text-sm font-bold">{review.score}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#5c4a32]">{review.summary}</p>
                  <p className="text-xs text-[#8b6914]">{review.date}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8b6914]" />
              </div>
            ))}
          </div>
        </div>
      )}

      <AIConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onSave={onSaveConfig}
        existingConfig={config}
      />
    </div>
  );
}
