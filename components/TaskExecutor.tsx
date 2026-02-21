'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Square, 
  CheckCircle2, 
  Clock, 
  Sprout, 
  TrendingUp,
  Heart,
  Calendar,
  Pickaxe,
  Axe,
  Shovel
} from 'lucide-react';
import { ActionItem, TodayTask, Difficulty, Importance } from '@/types';

interface TaskExecutorProps {
  sortedTasks: { task: TodayTask; actionItem: ActionItem }[];
  onStart: (actionId: string) => void;
  onCompleteWithDuration: (actionId: string) => void;
  onCompleteSimple: (actionId: string) => void;
  onCancel: (actionId: string) => void;
}

const difficultyIcons: Record<Difficulty, typeof Pickaxe> = {
  low: Shovel,
  medium: Axe,
  high: Pickaxe,
};

const difficultyColors: Record<Difficulty, string> = {
  low: 'text-green-600 bg-green-100',
  medium: 'text-yellow-600 bg-yellow-100',
  high: 'text-red-600 bg-red-100',
};

const importanceHearts: Record<Importance, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

/**
 * 格式化时长为可读字符串
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}时${minutes % 60}分`;
  } else if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`;
  } else {
    return `${seconds}秒`;
  }
}

/**
 * 血条/体力条组件 - 星露谷风格
 */
function StaminaBar({ current, max }: { current: number; max: number }) {
  const percentage = Math.min(100, (current / max) * 100);
  const hearts = Math.ceil(max);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
        <div className="flex-1 h-3 bg-[#3d2914] rounded-full overflow-hidden border border-[#5c4a32]">
          <div
            className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs font-bold text-[#5c4a32] min-w-[2.5rem] text-right">
          {current}/{max}
        </span>
      </div>
      {/* 心形指示器 */}
      <div className="flex gap-1">
        {Array.from({ length: hearts }).map((_, i) => (
          <Heart
            key={i}
            className={`w-3 h-3 transition-colors ${
              i < current ? 'text-red-500 fill-red-500' : 'text-[#c4b484]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 单个任务卡片 - 星露谷风格物品卡片
 */
function TaskCard({
  task,
  actionItem,
  onStart,
  onCompleteWithDuration,
  onCompleteSimple,
  onCancel,
}: {
  task: TodayTask;
  actionItem: ActionItem;
  onStart: (actionId: string) => void;
  onCompleteWithDuration: (actionId: string) => void;
  onCompleteSimple: (actionId: string) => void;
  onCancel: (actionId: string) => void;
}) {
  const isInProgress = task.currentExecution?.startTime !== null && task.currentExecution?.endTime === null;
  const [elapsedTime, setElapsedTime] = useState(0);
  const DifficultyIcon = difficultyIcons[actionItem.difficulty];

  // 计时器
  useEffect(() => {
    if (!isInProgress || !task.currentExecution?.startTime) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - task.currentExecution!.startTime!);
    }, 1000);

    return () => clearInterval(interval);
  }, [isInProgress, task.currentExecution]);

  // 已完成状态
  if (task.isCompletedToday) {
    const totalDuration = task.executions.reduce((sum, e) => sum + e.duration, 0);
    
    return (
      <div className="bg-[#d4e8c0] rounded-xl border-2 border-[#7a9a5a] p-4 opacity-80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#90c040] rounded-lg flex items-center justify-center border-2 border-[#5c8a20] shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-[#5c4a32] line-through opacity-60">{actionItem.name}</h3>
              <p className="text-xs text-[#7a9a5a]">
                干了 {task.completedCount}/{actionItem.timesPerDay} 次
                {totalDuration > 0 && ` · 用了 ${formatDuration(totalDuration)}`}
              </p>
            </div>
          </div>
          <span className="text-lg">✓</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f0d8] rounded-xl border-2 border-[#b8a878] p-4 shadow-md">
      {/* 头部：名称和标签 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#5c4a32] text-lg">{actionItem.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${difficultyColors[actionItem.difficulty]} border border-[#8b6914]`}>
              <DifficultyIcon className="w-3 h-3" />
              {actionItem.difficulty === 'low' ? '轻松活' : actionItem.difficulty === 'medium' ? '费点劲' : '苦力活'}
            </span>
            <span className="inline-flex items-center gap-1 text-[#e07050]">
              {Array.from({ length: importanceHearts[actionItem.importance] }).map((_, i) => (
                <Heart key={i} className="w-4 h-4 fill-current" />
              ))}
            </span>
            {actionItem.hasDuration && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-[#6090c0] bg-[#d0e0f0] border border-[#305070]">
                <Clock className="w-3 h-3" />
                计时的
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 体力条 */}
      {actionItem.timesPerDay > 1 && (
        <div className="mb-4">
          <StaminaBar
            current={task.completedCount}
            max={actionItem.timesPerDay}
          />
        </div>
      )}

      {/* 进行中状态 */}
      {isInProgress && (
        <div className="mb-4 p-3 bg-[#f0d8a0] rounded-lg border-2 border-[#d4a574] animate-pulse">
          <div className="flex items-center gap-2 text-[#8b6914]">
            <div className="w-2 h-2 bg-[#e07050] rounded-full" />
            <span className="text-sm font-bold">干着呢！</span>
            <span className="text-lg font-mono font-bold ml-auto text-[#5c4a32]">
              {formatDuration(elapsedTime)}
            </span>
          </div>
        </div>
      )}

      {/* 操作按钮 - 星露谷风格 */}
      <div className="flex gap-2">
        {actionItem.hasDuration ? (
          // 计时的活儿
          isInProgress ? (
            <>
              <button
                onClick={() => onCancel(actionItem.id)}
                className="flex-1 py-2.5 px-4 border-2 border-[#8b6914] rounded-lg text-[#5c4a32] hover:bg-[#e8d4a2] transition-colors text-sm font-bold"
              >
                算了
              </button>
              <button
                onClick={() => onCompleteWithDuration(actionItem.id)}
                className="flex-[2] py-2.5 px-4 bg-[#90c040] text-white rounded-lg hover:bg-[#7ab030] transition-colors border-2 border-[#5c8a20] shadow-md flex items-center justify-center gap-2 font-bold"
              >
                <Square className="w-4 h-4 fill-current" />
                收工！
              </button>
            </>
          ) : (
            <button
              onClick={() => onStart(actionItem.id)}
              className="w-full py-2.5 px-4 bg-[#6090c0] text-white rounded-lg hover:bg-[#5080b0] transition-colors border-2 border-[#305070] shadow-md flex items-center justify-center gap-2 font-bold"
            >
              <Play className="w-4 h-4 fill-current" />
              开干！
            </button>
          )
        ) : (
          // 简单的活儿
          <button
            onClick={() => onCompleteSimple(actionItem.id)}
            className="w-full py-2.5 px-4 bg-[#90c040] text-white rounded-lg hover:bg-[#7ab030] transition-colors border-2 border-[#5c8a20] shadow-md flex items-center justify-center gap-2 font-bold"
          >
            <CheckCircle2 className="w-4 h-4" />
            干完！
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * 任务执行界面 - 今儿的活儿
 */
export function TaskExecutor({
  sortedTasks,
  onStart,
  onCompleteWithDuration,
  onCompleteSimple,
  onCancel,
}: TaskExecutorProps) {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  // 统计
  const stats = useMemo(() => {
    const total = sortedTasks.length;
    const completed = sortedTasks.filter(({ task }) => task.isCompletedToday).length;
    const inProgress = sortedTasks.filter(
      ({ task }) => task.currentExecution?.startTime && !task.currentExecution?.endTime
    ).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, inProgress, completionRate };
  }, [sortedTasks]);

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-[#5c8a20]" />
          <h2 className="text-xl font-bold text-[#5c4a32]">今儿的活儿</h2>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-[#8b6914] bg-[#e8d4a2] px-3 py-1 rounded-full border border-[#b8a878]">
          <Calendar className="w-4 h-4" />
          {today}
        </div>
      </div>

      {/* 统计看板 - 星露谷风格 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#90c040] rounded-xl border-2 border-[#5c8a20] p-3 text-center shadow-md">
          <p className="text-2xl font-bold text-white drop-shadow-sm">{stats.completed}</p>
          <p className="text-xs text-[#d4f0b0] font-bold mt-0.5">干完的</p>
        </div>
        <div className="bg-[#6090c0] rounded-xl border-2 border-[#305070] p-3 text-center shadow-md">
          <p className="text-2xl font-bold text-white drop-shadow-sm">{stats.inProgress}</p>
          <p className="text-xs text-[#d0e0f0] font-bold mt-0.5">干着的</p>
        </div>
        <div className="bg-[#e07050] rounded-xl border-2 border-[#a04030] p-3 text-center shadow-md">
          <p className="text-2xl font-bold text-white drop-shadow-sm">{stats.completionRate}%</p>
          <p className="text-xs text-[#f8d0c8] font-bold mt-0.5">J人百分比</p>
        </div>
      </div>

      {/* 任务列表 */}
      {sortedTasks.length > 0 ? (
        <div className="space-y-3">
          {sortedTasks.map(({ task, actionItem }) => (
            <TaskCard
              key={task.actionId}
              task={task}
              actionItem={actionItem}
              onStart={onStart}
              onCompleteWithDuration={onCompleteWithDuration}
              onCompleteSimple={onCompleteSimple}
              onCancel={onCancel}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#e8d4a2] rounded-xl border-2 border-dashed border-[#b8a878]">
          <Sprout className="w-16 h-16 text-[#b8a878] mx-auto mb-3 opacity-60" />
          <p className="text-[#8b6914] font-bold">今儿没活儿干</p>
          <p className="text-sm text-[#a08060] mt-1">去"当个事儿办"加几个事儿吧</p>
        </div>
      )}
    </div>
  );
}
