'use client';

import { useState, useCallback, useMemo } from 'react';
import { 
  CheckupReview, 
  DailyStats, 
  CheckupHistory,
  CheckupAgentState 
} from '@/types/checkup';
import { ActionItem, TodayTask } from '@/types';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'checkup-agent-v1';

/**
 * 计算每日统计数据
 */
function calculateDailyStats(
  date: string,
  actionItems: ActionItem[],
  todayTasks: TodayTask[]
): DailyStats {
  const stats: DailyStats = {
    date,
    totalTasks: actionItems.length,
    completedTasks: 0,
    completionRate: 0,
    highImportance: { total: 0, completed: 0 },
    mediumImportance: { total: 0, completed: 0 },
    lowImportance: { total: 0, completed: 0 },
    highDifficulty: { total: 0, completed: 0 },
    mediumDifficulty: { total: 0, completed: 0 },
    lowDifficulty: { total: 0, completed: 0 },
    totalDuration: 0,
    averageDuration: 0,
  };

  let totalDuration = 0;
  let durationCount = 0;

  actionItems.forEach((action) => {
    const task = todayTasks.find((t) => t.actionId === action.id);
    if (!task) return;

    const isCompleted = task.isCompletedToday;

    // 总体完成
    if (isCompleted) {
      stats.completedTasks++;
    }

    // 重要度统计
    const importanceKey = `${action.importance}Importance` as const;
    stats[importanceKey].total++;
    if (isCompleted) {
      stats[importanceKey].completed++;
    }

    // 难度统计
    const difficultyKey = `${action.difficulty}Difficulty` as const;
    stats[difficultyKey].total++;
    if (isCompleted) {
      stats[difficultyKey].completed++;
    }

    // 计时统计
    if (task.executions.length > 0) {
      task.executions.forEach((exec) => {
        if (exec.duration > 0) {
          totalDuration += exec.duration;
          durationCount++;
        }
      });
    }
  });

  stats.completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;
  
  stats.totalDuration = totalDuration;
  stats.averageDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

  return stats;
}

/**
 * Checkup Agent Hook - 后端服务版本
 */
export function useCheckupAgent(
  actionItems: ActionItem[],
  todayTasks: TodayTask[],
  currentDate: string
) {
  const { value: state, setValue: setState } = useLocalStorage<CheckupAgentState>(
    STORAGE_KEY,
    {
      config: null,
      todayReview: null,
      history: { reviews: [], stats: [] },
      isAnalyzing: false,
      error: null,
    }
  );

  // 计算今日统计
  const todayStats = useMemo(() => {
    return calculateDailyStats(currentDate, actionItems, todayTasks);
  }, [currentDate, actionItems, todayTasks]);

  /**
   * 执行 AI 分析 - 调用后端 API
   */
  const analyze = useCallback(async () => {
    setState((prev) => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      // 调用后端 API
      const response = await fetch('/api/checkup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stats: todayStats,
          history: state.history,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '服务器错误');
      }

      const review: CheckupReview = data.review;

      // 更新历史记录
      const newHistory: CheckupHistory = {
        reviews: [...state.history.reviews.filter((r) => r.date !== currentDate), review],
        stats: [...state.history.stats.filter((s) => s.date !== currentDate), todayStats],
      };

      setState((prev) => ({
        ...prev,
        todayReview: review,
        history: newHistory,
        isAnalyzing: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : '未知错误',
      }));
    }
  }, [todayStats, state.history, currentDate, setState]);

  /**
   * 清除今日分析（用于重新分析）
   */
  const clearTodayReview = useCallback(() => {
    setState((prev) => ({ ...prev, todayReview: null, error: null }));
  }, [setState]);

  return {
    ...state,
    todayStats,
    analyze,
    clearTodayReview,
  };
}
