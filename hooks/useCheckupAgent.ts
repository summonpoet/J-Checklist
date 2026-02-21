'use client';

import { useState, useCallback, useMemo } from 'react';
import { 
  AIConfig, 
  AIProvider, 
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
 * 构建 AI Prompt
 */
function buildPrompt(stats: DailyStats, history: CheckupHistory): string {
  const prevReviews = history.reviews.slice(-7); // 最近7天
  
  let prompt = `你是一位专业的习惯养成教练和心理咨询师。请根据用户今天的任务完成数据，给出温暖、鼓励但真诚的反馈。

## 今日任务数据 (${stats.date})

### 总体完成情况
- 总任务数: ${stats.totalTasks}
- 已完成: ${stats.completedTasks}
- 完成率: ${stats.completionRate}%

### 重要度完成情况
- 高重要度: ${stats.highImportance.completed}/${stats.highImportance.total} 完成
- 中重要度: ${stats.mediumImportance.completed}/${stats.mediumImportance.total} 完成
- 低重要度: ${stats.lowImportance.completed}/${stats.lowImportance.total} 完成

### 难度完成情况
- 高难度: ${stats.highDifficulty.completed}/${stats.highDifficulty.total} 完成
- 中难度: ${stats.mediumDifficulty.completed}/${stats.mediumDifficulty.total} 完成
- 低难度: ${stats.lowDifficulty.completed}/${stats.lowDifficulty.total} 完成
`;

  if (stats.totalDuration > 0) {
    const hours = Math.floor(stats.totalDuration / 3600000);
    const minutes = Math.floor((stats.totalDuration % 3600000) / 60000);
    prompt += `\n### 专注时间\n- 总专注时长: ${hours}小时${minutes}分钟\n`;
  }

  if (prevReviews.length > 0) {
    prompt += `\n### 历史表现回顾\n`;
    prevReviews.forEach((review) => {
      prompt += `- ${review.date}: ${review.summary} (评分: ${review.score})\n`;
    });
  }

  prompt += `
## 请输出以下格式的 JSON 回复：

{
  "summary": "一句话总结今天（20字以内，温暖幽默的风格）",
  "detailedReview": "详细评价（200-300字，分析今天的表现，结合历史对比，给予鼓励或建议）",
  "highlights": ["亮点1", "亮点2"],
  "suggestions": ["建议1"],
  "mood": "excellent/good/average/poor 之一",
  "score": 0-100的数字评分
}

注意：
1. 语气要像朋友一样温暖自然，不要太官方
2. 如果完成率高，要真心庆祝；如果完成率低，要理解并鼓励，不要批评
3. highlights 和 suggestions 各 1-2 条即可
4. 如果有历史数据，可以适当对比进步或退步
`;

  return prompt;
}

/**
 * 调用 AI API
 */
async function callAI(config: AIConfig, prompt: string): Promise<string> {
  let url: string;
  let body: Record<string, unknown>;
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  switch (config.provider) {
    case 'openai':
      url = 'https://api.openai.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      body = {
        model: config.model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      };
      break;

    case 'anthropic':
      url = 'https://api.anthropic.com/v1/messages';
      headers['x-api-key'] = config.apiKey;
      headers['anthropic-version'] = '2023-06-01';
      body = {
        model: config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      };
      break;

    case 'moonshot':
      url = 'https://api.moonshot.cn/v1/chat/completions';
      // Moonshot 使用 api-key header 而不是 Authorization
      headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
      body = {
        model: config.model || 'moonshot-v1-8k',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      };
      break;

    case 'zhipu':
      url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      body = {
        model: config.model || 'glm-4-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      };
      break;

    case 'custom':
      url = config.apiUrl || '';
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      body = {
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      };
      break;

    default:
      throw new Error('不支持的 AI 提供商');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'API 调用失败';
    
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.error?.message?.includes('Authentication') || errorJson.error?.type?.includes('authentication')) {
        errorMessage = 'API Key 验证失败。可能原因：\n1. Key 复制不完整（检查是否以 sk- 开头）\n2. 浏览器跨域限制（需要使用代理）\n3. Key 确实无效';
      } else if (errorJson.error?.message) {
        errorMessage = errorJson.error.message;
      } else {
        errorMessage = JSON.stringify(errorJson);
      }
    } catch {
      errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // 解析不同提供商的响应格式
  if (config.provider === 'anthropic') {
    return data.content?.[0]?.text || '';
  }
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Checkup Agent Hook
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
   * 保存 AI 配置
   */
  const saveConfig = useCallback((config: AIConfig) => {
    // 确保 API Key 没有前后空格
    const cleanConfig = {
      ...config,
      apiKey: config.apiKey.trim(),
    };
    setState((prev) => ({ ...prev, config: cleanConfig, error: null }));
  }, [setState]);

  /**
   * 清除 AI 配置
   */
  const clearConfig = useCallback(() => {
    setState((prev) => ({ ...prev, config: null }));
  }, [setState]);

  /**
   * 执行 AI 分析
   */
  const analyze = useCallback(async () => {
    if (!state.config) {
      setState((prev) => ({ ...prev, error: '请先配置 AI' }));
      return;
    }

    setState((prev) => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const prompt = buildPrompt(todayStats, state.history);
      const response = await callAI(state.config, prompt);
      
      // 解析 JSON 响应
      let review: CheckupReview;
      try {
        // 尝试从响应中提取 JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          review = {
            date: currentDate,
            summary: parsed.summary || '今天也是努力的一天！',
            detailedReview: parsed.detailedReview || response,
            highlights: parsed.highlights || [],
            suggestions: parsed.suggestions || [],
            mood: parsed.mood || 'good',
            score: parsed.score || 70,
          };
        } else {
          throw new Error('无法解析 AI 响应');
        }
      } catch (e) {
        // 如果不是 JSON，直接使用文本
        review = {
          date: currentDate,
          summary: '今天也是努力的一天！',
          detailedReview: response,
          highlights: [],
          suggestions: [],
          mood: 'good',
          score: 70,
        };
      }

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
  }, [state.config, state.history, todayStats, currentDate, setState]);

  /**
   * 清除今日分析（用于重新分析）
   */
  const clearTodayReview = useCallback(() => {
    setState((prev) => ({ ...prev, todayReview: null, error: null }));
  }, [setState]);

  return {
    ...state,
    todayStats,
    saveConfig,
    clearConfig,
    analyze,
    clearTodayReview,
  };
}
