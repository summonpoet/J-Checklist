'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Square, 
  CheckCircle2, 
  Clock, 
  Target, 
  TrendingUp,
  Flame,
  Calendar
} from 'lucide-react';
import { ActionItem, TodayTask, Difficulty, Importance } from '@/types';

interface TaskExecutorProps {
  sortedTasks: { task: TodayTask; actionItem: ActionItem }[];
  onStart: (actionId: string) => void;
  onCompleteWithDuration: (actionId: string) => void;
  onCompleteSimple: (actionId: string) => void;
  onCancel: (actionId: string) => void;
}

const difficultyColors: Record<Difficulty, string> = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
};

const importanceColors: Record<Importance, string> = {
  low: 'bg-gray-400',
  medium: 'bg-blue-500',
  high: 'bg-purple-500',
};

/**
 * 格式化时长为可读字符串
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`;
  } else {
    return `${seconds}秒`;
  }
}

/**
 * 格式化日期
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  
  if (isToday) {
    return '今天';
  }
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

/**
 * 进度条/血条组件
 */
function HealthBar({ current, max, color }: { current: number; max: number; color: string }) {
  const percentage = Math.min(100, (current / max) * 100);
  const hearts = Math.ceil(max);
  const filledHearts = current;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Flame className="w-4 h-4 text-orange-500" />
        <div className="flex-1 h-2.5 bg-stone-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs font-medium text-stone-600 min-w-[3rem] text-right">
          {current}/{max}
        </span>
      </div>
      {/* 心形指示器 */}
      <div className="flex gap-1">
        {Array.from({ length: hearts }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              i < filledHearts ? color : 'bg-stone-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 单个任务卡片
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

  // 计时器 - 更新进行中的任务时间
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

  const progressColor = useMemo(() => {
    if (actionItem.importance === 'high') return 'bg-purple-500';
    if (actionItem.importance === 'medium') return 'bg-blue-500';
    return 'bg-stone-500';
  }, [actionItem.importance]);

  // 已完成状态
  if (task.isCompletedToday) {
    const totalDuration = task.executions.reduce((sum, e) => sum + e.duration, 0);
    
    return (
      <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 opacity-75">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-stone-600 line-through">{actionItem.name}</h3>
              <p className="text-xs text-stone-400">
                已完成 {task.completedCount}/{actionItem.timesPerDay} 次
                {totalDuration > 0 && ` · 总用时 ${formatDuration(totalDuration)}`}
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-green-600">✓</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
      {/* 头部：名称和标签 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-800">{actionItem.name}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-white ${difficultyColors[actionItem.difficulty]}`}>
              难度
            </span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-white ${importanceColors[actionItem.importance]}`}>
              重要
            </span>
            {actionItem.hasDuration && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700">
                <Clock className="w-3 h-3 mr-0.5" />
                计时
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 血条（当一日多次时显示） */}
      {actionItem.timesPerDay > 1 && (
        <div className="mb-4">
          <HealthBar
            current={task.completedCount}
            max={actionItem.timesPerDay}
            color={progressColor}
          />
        </div>
      )}

      {/* 进行中状态 */}
      {isInProgress && (
        <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
          <div className="flex items-center gap-2 text-orange-800">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">进行中</span>
            <span className="text-lg font-mono font-semibold ml-auto">
              {formatDuration(elapsedTime)}
            </span>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2">
        {actionItem.hasDuration ? (
          // 有始有终类型
          isInProgress ? (
            <>
              <button
                onClick={() => onCancel(actionItem.id)}
                className="flex-1 py-2.5 px-4 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={() => onCompleteWithDuration(actionItem.id)}
                className="flex-[2] py-2.5 px-4 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Square className="w-4 h-4 fill-current" />
                干完
              </button>
            </>
          ) : (
            <button
              onClick={() => onStart(actionItem.id)}
              className="w-full py-2.5 px-4 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Play className="w-4 h-4 fill-current" />
              开干
            </button>
          )
        ) : (
          // 无持续时间类型
          <button
            onClick={() => onCompleteSimple(actionItem.id)}
            className="w-full py-2.5 px-4 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <CheckCircle2 className="w-4 h-4" />
            干
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * 任务执行界面组件
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
      {/* 标题和日期 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-stone-600" />
          <h2 className="text-lg font-semibold text-stone-800">今日任务</h2>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-stone-500">
          <Calendar className="w-4 h-4" />
          {formatDate(today)}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-stone-200 p-3 text-center">
          <p className="text-2xl font-bold text-stone-800">{stats.completed}</p>
          <p className="text-xs text-stone-500 mt-0.5">已完成</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-3 text-center">
          <p className="text-2xl font-bold text-stone-800">{stats.inProgress}</p>
          <p className="text-xs text-stone-500 mt-0.5">进行中</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-3 text-center">
          <p className="text-2xl font-bold text-stone-800">{stats.completionRate}%</p>
          <p className="text-xs text-stone-500 mt-0.5">完成率</p>
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
        <div className="text-center py-12 bg-stone-50 rounded-xl border border-dashed border-stone-300">
          <TrendingUp className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 font-medium">还没有行动项</p>
          <p className="text-sm text-stone-400 mt-1">先去"管理"界面添加吧</p>
        </div>
      )}
    </div>
  );
}
