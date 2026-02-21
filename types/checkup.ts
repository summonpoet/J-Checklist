/**
 * Checkup Agent 相关类型定义
 */

/**
 * AI 提供商类型
 */
export type AIProvider = 'openai' | 'anthropic' | 'zhipu' | 'moonshot' | 'custom';

/**
 * AI 配置
 */
export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  apiUrl?: string; // 自定义 API 地址（用于代理或自定义模型）
  model: string;
}

/**
 * 每日任务统计数据
 */
export interface DailyStats {
  date: string; // YYYY-MM-DD
  totalTasks: number;
  completedTasks: number;
  completionRate: number; // 0-100
  
  // 重要度分析
  highImportance: { total: number; completed: number };
  mediumImportance: { total: number; completed: number };
  lowImportance: { total: number; completed: number };
  
  // 难度分析
  highDifficulty: { total: number; completed: number };
  mediumDifficulty: { total: number; completed: number };
  lowDifficulty: { total: number; completed: number };
  
  // 计时任务分析
  totalDuration: number; // 毫秒
  averageDuration: number; // 毫秒
}

/**
 * AI 评价结果
 */
export interface CheckupReview {
  date: string;
  summary: string; // 简短总结（一句话）
  detailedReview: string; // 详细评价
  highlights: string[]; // 亮点
  suggestions: string[]; // 建议
  mood: 'excellent' | 'good' | 'average' | 'poor'; // 整体心情
  score: number; // 0-100 综合评分
}

/**
 * 历史记录（用于对比分析）
 */
export interface CheckupHistory {
  reviews: CheckupReview[];
  stats: DailyStats[];
}

/**
 * Checkup Agent 状态
 */
export interface CheckupAgentState {
  config: AIConfig | null;
  todayReview: CheckupReview | null;
  history: CheckupHistory;
  isAnalyzing: boolean;
  error: string | null;
}
