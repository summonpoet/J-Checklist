'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ActionItem, TodayTask, TaskExecution, Difficulty, Importance, AppState } from '@/types';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'checklist-app-v1';

/**
 * 获取今日日期字符串 YYYY-MM-DD
 */
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 创建空的任务实例
 */
function createEmptyTodayTask(actionId: string): TodayTask {
  return {
    actionId,
    completedCount: 0,
    currentExecution: null,
    isCompletedToday: false,
    executions: [],
    lastUpdated: Date.now(),
  };
}

/**
 * 主应用 Hook - 管理所有 Checklist 逻辑
 */
export function useChecklist() {
  const { value: storedState, setValue: setStoredState, isLoaded } = useLocalStorage<AppState>(STORAGE_KEY, {
    actionItems: [],
    todayTasks: [],
    currentDate: getTodayString(),
  });

  // 确保日期一致性 - 如果跨天了，重置今日任务
  const [appState, setAppState] = useState<AppState>(storedState);

  useEffect(() => {
    if (!isLoaded) return;

    const today = getTodayString();
    if (storedState.currentDate !== today) {
      // 跨天了，重置今日任务但保留行动项配置
      const resetState: AppState = {
        actionItems: storedState.actionItems,
        todayTasks: storedState.actionItems.map(item => createEmptyTodayTask(item.id)),
        currentDate: today,
      };
      setAppState(resetState);
      setStoredState(resetState);
    } else {
      setAppState(storedState);
    }
  }, [storedState, isLoaded, setStoredState]);

  // ========== 行动项管理 ==========

  /**
   * 添加新的行动项
   */
  const addActionItem = useCallback((
    name: string,
    difficulty: Difficulty,
    importance: Importance,
    timesPerDay: number,
    hasDuration: boolean
  ) => {
    const newItem: ActionItem = {
      id: generateId(),
      name: name.trim(),
      difficulty,
      importance,
      timesPerDay: Math.max(1, timesPerDay),
      hasDuration,
      createdAt: Date.now(),
    };

    setAppState(prev => {
      const newState: AppState = {
        ...prev,
        actionItems: [...prev.actionItems, newItem],
        todayTasks: [...prev.todayTasks, createEmptyTodayTask(newItem.id)],
      };
      setStoredState(newState);
      return newState;
    });
  }, [setStoredState]);

  /**
   * 更新行动项
   */
  const updateActionItem = useCallback((id: string, updates: Partial<Omit<ActionItem, 'id' | 'createdAt'>>) => {
    setAppState(prev => {
      const newActionItems = prev.actionItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      
      // 如果修改了 timesPerDay 或 hasDuration，可能需要重置今日任务
      const existingTask = prev.todayTasks.find(t => t.actionId === id);
      let newTodayTasks = prev.todayTasks;
      
      if (existingTask && (updates.timesPerDay !== undefined || updates.hasDuration !== undefined)) {
        newTodayTasks = prev.todayTasks.map(t =>
          t.actionId === id ? createEmptyTodayTask(id) : t
        );
      }

      const newState: AppState = {
        ...prev,
        actionItems: newActionItems,
        todayTasks: newTodayTasks,
      };
      setStoredState(newState);
      return newState;
    });
  }, [setStoredState]);

  /**
   * 删除行动项
   */
  const deleteActionItem = useCallback((id: string) => {
    setAppState(prev => {
      const newState: AppState = {
        ...prev,
        actionItems: prev.actionItems.filter(item => item.id !== id),
        todayTasks: prev.todayTasks.filter(t => t.actionId !== id),
      };
      setStoredState(newState);
      return newState;
    });
  }, [setStoredState]);

  // ========== 任务执行管理 ==========

  /**
   * 开始执行任务（有始有终类型）
   */
  const startTask = useCallback((actionId: string) => {
    setAppState(prev => {
      const newTodayTasks = prev.todayTasks.map(task => {
        if (task.actionId !== actionId) return task;
        
        const newExecution: TaskExecution = {
          startTime: Date.now(),
          endTime: null,
          duration: 0,
        };

        return {
          ...task,
          currentExecution: newExecution,
          lastUpdated: Date.now(),
        };
      });

      const newState: AppState = { ...prev, todayTasks: newTodayTasks };
      setStoredState(newState);
      return newState;
    });
  }, [setStoredState]);

  /**
   * 完成任务（有始有终类型 - 结束计时）
   */
  const completeTaskWithDuration = useCallback((actionId: string) => {
    setAppState(prev => {
      const newTodayTasks = prev.todayTasks.map(task => {
        if (task.actionId !== actionId || !task.currentExecution?.startTime) return task;

        const endTime = Date.now();
        const duration = endTime - task.currentExecution.startTime;
        const completedExecution: TaskExecution = {
          ...task.currentExecution,
          endTime,
          duration,
        };

        const actionItem = prev.actionItems.find(a => a.id === actionId);
        const timesPerDay = actionItem?.timesPerDay || 1;
        const newCompletedCount = task.completedCount + 1;

        return {
          ...task,
          completedCount: newCompletedCount,
          currentExecution: null,
          executions: [...task.executions, completedExecution],
          isCompletedToday: newCompletedCount >= timesPerDay,
          lastUpdated: Date.now(),
        };
      });

      const newState: AppState = { ...prev, todayTasks: newTodayTasks };
      setStoredState(newState);
      return newState;
    });
  }, [setStoredState]);

  /**
   * 完成任务（无持续时间类型）
   */
  const completeTaskSimple = useCallback((actionId: string) => {
    setAppState(prev => {
      const newTodayTasks = prev.todayTasks.map(task => {
        if (task.actionId !== actionId) return task;

        const actionItem = prev.actionItems.find(a => a.id === actionId);
        const timesPerDay = actionItem?.timesPerDay || 1;
        const newCompletedCount = task.completedCount + 1;

        return {
          ...task,
          completedCount: newCompletedCount,
          isCompletedToday: newCompletedCount >= timesPerDay,
          lastUpdated: Date.now(),
        };
      });

      const newState: AppState = { ...prev, todayTasks: newTodayTasks };
      setStoredState(newState);
      return newState;
    });
  }, [setStoredState]);

  /**
   * 取消进行中的任务
   */
  const cancelTask = useCallback((actionId: string) => {
    setAppState(prev => {
      const newTodayTasks = prev.todayTasks.map(task => {
        if (task.actionId !== actionId) return task;
        return {
          ...task,
          currentExecution: null,
          lastUpdated: Date.now(),
        };
      });

      const newState: AppState = { ...prev, todayTasks: newTodayTasks };
      setStoredState(newState);
      return newState;
    });
  }, [setStoredState]);

  // ========== 排序后的任务列表 ==========

  /**
   * 获取排序后的今日任务（未完成在前，重要任务在前）
   */
  const sortedTasks = useMemo(() => {
    const importanceWeight: Record<Importance, number> = { high: 3, medium: 2, low: 1 };
    
    return [...appState.todayTasks].sort((a, b) => {
      const actionA = appState.actionItems.find(item => item.id === a.actionId);
      const actionB = appState.actionItems.find(item => item.id === b.actionId);
      
      if (!actionA || !actionB) return 0;

      // 1. 未完成在前，已完成在后
      if (a.isCompletedToday !== b.isCompletedToday) {
        return a.isCompletedToday ? 1 : -1;
      }

      // 2. 重要度高的在前
      const importanceDiff = importanceWeight[actionB.importance] - importanceWeight[actionA.importance];
      if (importanceDiff !== 0) return importanceDiff;

      // 3. 创建时间早的在前
      return actionA.createdAt - actionB.createdAt;
    }).map(task => ({
      task,
      actionItem: appState.actionItems.find(a => a.id === task.actionId)!,
    })).filter(({ actionItem }) => actionItem !== undefined);
  }, [appState.todayTasks, appState.actionItems]);

  return {
    actionItems: appState.actionItems,
    todayTasks: appState.todayTasks,
    sortedTasks,
    isLoaded,
    addActionItem,
    updateActionItem,
    deleteActionItem,
    startTask,
    completeTaskWithDuration,
    completeTaskSimple,
    cancelTask,
  };
}
