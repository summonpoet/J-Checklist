/**
 * 难度级别
 */
export type Difficulty = 'low' | 'medium' | 'high';

/**
 * 重要度级别
 */
export type Importance = 'low' | 'medium' | 'high';

/**
 * 行动项（Checklist 配置）
 */
export interface ActionItem {
  id: string;
  name: string;
  difficulty: Difficulty;
  importance: Importance;
  timesPerDay: number;
  hasDuration: boolean; // 有始有终？
  createdAt: number;
}

/**
 * 任务执行记录（单次）
 */
export interface TaskExecution {
  startTime: number | null;
  endTime: number | null;
  duration: number; // 毫秒
}

/**
 * 今日任务实例
 */
export interface TodayTask {
  actionId: string;
  completedCount: number; // 已完成次数
  currentExecution: TaskExecution | null; // 当前进行中的执行（用于"有始有终"）
  isCompletedToday: boolean; // 今日是否已完成全部次数
  executions: TaskExecution[]; // 所有执行记录
  lastUpdated: number;
}

/**
 * 应用状态
 */
export interface AppState {
  actionItems: ActionItem[];
  todayTasks: TodayTask[];
  currentDate: string; // YYYY-MM-DD 格式
}
