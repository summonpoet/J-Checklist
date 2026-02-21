'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Award, 
  Lightbulb, 
  MessageCircle,
  Settings,
  RotateCcw,
  ChevronRight,
  Target,
  Zap,
  Clock,
  AlertCircle
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
  excellent: { label: '超棒', color: 'text-green-600 bg-green-100', icon: Award },
  good: { label: '不错', color: 'text-blue-600 bg-blue-100', icon: TrendingUp },
  average: { label: '还行', color: 'text-yellow-600 bg-yellow-100', icon: Clock },
  poor: { label: '加油', color: 'text-orange-600 bg-orange-100', icon: Zap },
};

/**
 * 统计数据卡片
 */
function StatCard({ 
  label, 
  value, 
  subtext, 
  color = 'stone' 
}: { 
  label: string; 
  value: string; 
  subtext?: string;
  color?: 'green' | 'blue' | 'purple' | 'stone';
}) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    stone: 'bg-stone-50 border-stone-200',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <p className="text-xs text-stone-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-stone-800">{value}</p>
      {subtext && <p className="text-xs text-stone-400 mt-1">{subtext}</p>}
    </div>
  );
}

/**
 * 进度条组件
 */
function ProgressBar({ 
  label, 
  completed, 
  total, 
  color = 'stone' 
}: { 
  label: string; 
  completed: number; 
  total: number;
  color?: 'green' | 'blue' | 'purple' | 'red' | 'stone';
}) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    stone: 'bg-stone-500',
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-stone-600">{label}</span>
        <span className="text-stone-800 font-medium">{completed}/{total}</span>
      </div>
      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color]} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Checkup Agent 主组件
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
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-stone-800">开启你的 AI 养成教练</h3>
            <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto">
              AI 教练会每天分析你的任务完成情况，给出温暖的反馈和建议，帮助你养成 J 人特质
            </p>
          </div>
          <button
            onClick={() => setShowConfig(true)}
            className="px-6 py-2.5 bg-stone-800 text-white rounded-lg font-medium hover:bg-stone-700 transition-colors"
          >
            配置 AI 教练
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
      <div className="bg-white rounded-2xl border border-stone-200 p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-3 border-stone-200 border-t-purple-500 rounded-full animate-spin" />
            <Sparkles className="w-5 h-5 text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center">
            <p className="text-stone-800 font-medium">AI 教练正在分析中...</p>
            <p className="text-sm text-stone-500 mt-1">正在对比历史数据，生成今日评价</p>
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
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-stone-800">AI 养成教练</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            {showHistory ? '隐藏历史' : '查看历史'}
          </button>
          <button
            onClick={() => setShowConfig(true)}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => setShowConfig(true)}
              className="text-sm text-red-600 hover:text-red-800 mt-1 underline"
            >
              检查配置
            </button>
          </div>
        </div>
      )}

      {/* Today's Review */}
      {todayReview ? (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {/* Review Header */}
          <div className="p-5 border-b border-stone-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-stone-500">{todayReview.date} 的评价</p>
                <h3 className="text-xl font-bold text-stone-800 mt-1">{todayReview.summary}</h3>
              </div>
              <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${moodConfig[todayReview.mood].color}`}>
                {(() => {
                  const Icon = moodConfig[todayReview.mood].icon;
                  return <Icon className="w-4 h-4" />;
                })()}
                <span className="text-sm font-medium">{moodConfig[todayReview.mood].label}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${todayReview.score}%` }}
                />
              </div>
              <span className="text-sm font-medium text-stone-700">{todayReview.score}分</span>
            </div>
          </div>

          {/* Review Content */}
          <div className="p-5 space-y-4">
            <p className="text-stone-700 leading-relaxed">{todayReview.detailedReview}</p>
            
            {todayReview.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {todayReview.highlights.map((highlight, i) => (
                  <span 
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                  >
                    <Award className="w-3.5 h-3.5" />
                    {highlight}
                  </span>
                ))}
              </div>
            )}

            {todayReview.suggestions.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-xl">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div className="space-y-1">
                    {todayReview.suggestions.map((suggestion, i) => (
                      <p key={i} className="text-sm text-blue-800">{suggestion}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-400">
              使用 {config.provider} / {config.model}
            </span>
            <button
              onClick={onClearReview}
              className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              重新分析
            </button>
          </div>
        </div>
      ) : (
        /* Ready to Analyze */
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          {/* Stats Preview */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard 
              label="完成率" 
              value={`${todayStats.completionRate}%`}
              color="green"
            />
            <StatCard 
              label="重要任务" 
              value={`${todayStats.highImportance.completed}/${todayStats.highImportance.total}`}
              color="blue"
            />
            <StatCard 
              label="困难任务" 
              value={`${todayStats.highDifficulty.completed}/${todayStats.highDifficulty.total}`}
              color="purple"
            />
          </div>

          {/* Progress Bars */}
          <div className="space-y-4 mb-6">
            <ProgressBar 
              label="总体完成" 
              completed={todayStats.completedTasks} 
              total={todayStats.totalTasks}
              color="green"
            />
            <ProgressBar 
              label="高重要度任务" 
              completed={todayStats.highImportance.completed} 
              total={todayStats.highImportance.total}
              color="blue"
            />
            <ProgressBar 
              label="高难度任务" 
              completed={todayStats.highDifficulty.completed} 
              total={todayStats.highDifficulty.total}
              color="purple"
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={onAnalyze}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
          >
            <Sparkles className="w-5 h-5" />
            让 AI 教练分析今日表现
          </button>
        </div>
      )}

      {/* History */}
      {showHistory && history.reviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            历史评价
          </h3>
          <div className="space-y-3">
            {history.reviews.slice().reverse().map((review) => (
              <div 
                key={review.date}
                className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${moodConfig[review.mood].color}`}>
                  <span className="text-sm font-bold">{review.score}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800">{review.summary}</p>
                  <p className="text-xs text-stone-500">{review.date}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      <AIConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onSave={onSaveConfig}
        existingConfig={config as any}
      />
    </div>
  );
}
