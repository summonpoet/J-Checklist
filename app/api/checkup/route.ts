/**
 * Checkup Agent API - 后端服务
 * 统一使用服务端 API Key，前端无需配置
 */

import { NextRequest, NextResponse } from 'next/server';
import { DailyStats, CheckupHistory, CheckupReview, AIProvider } from '@/types/checkup';

// 从环境变量读取 API 配置
const API_PROVIDER = (process.env.CHECKUP_API_PROVIDER || 'moonshot') as AIProvider;
const API_KEY = process.env.CHECKUP_API_KEY || '';
const API_MODEL = process.env.CHECKUP_API_MODEL || 'moonshot-v1-8k';

// 简单的内存限流存储（生产环境建议使用 Redis）
const rateLimitMap = new Map<string, { count: number; date: string }>();
const DAILY_LIMIT = 5; // 每天限制 5 次

/**
 * 构建 AI Prompt
 */
function buildPrompt(stats: DailyStats, history: CheckupHistory): string {
  const prevReviews = history.reviews.slice(-7);
  
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
async function callAI(prompt: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('服务器未配置 API Key');
  }

  let url: string;
  let body: Record<string, unknown>;
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  };

  switch (API_PROVIDER) {
    case 'moonshot':
      url = 'https://api.moonshot.cn/v1/chat/completions';
      body = {
        model: API_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      };
      break;

    case 'openai':
      url = 'https://api.openai.com/v1/chat/completions';
      body = {
        model: API_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      };
      break;

    case 'zhipu':
      url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      body = {
        model: API_MODEL,
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
    throw new Error(`AI 服务错误: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * 检查限流
 */
function checkRateLimit(clientId: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  const record = rateLimitMap.get(clientId);

  if (!record || record.date !== today) {
    // 新的一天，重置计数
    rateLimitMap.set(clientId, { count: 1, date: today });
    return true;
  }

  if (record.count >= DAILY_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * POST /api/checkup
 */
export async function POST(request: NextRequest) {
  try {
    // 获取客户端标识（IP 地址）
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const clientId = ip;

    // 检查限流
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: '今天唠叨奶奶累了，明天再来吧（每日限5次）' },
        { status: 429 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { stats, history }: { stats: DailyStats; history: CheckupHistory } = body;

    if (!stats || !history) {
      return NextResponse.json(
        { error: '缺少必要的参数' },
        { status: 400 }
      );
    }

    // 构建 Prompt
    const prompt = buildPrompt(stats, history);

    // 调用 AI
    const aiResponse = await callAI(prompt);

    // 解析 AI 响应
    let review: CheckupReview;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        review = {
          date: stats.date,
          summary: parsed.summary || '今天也是努力的一天！',
          detailedReview: parsed.detailedReview || aiResponse,
          highlights: parsed.highlights || [],
          suggestions: parsed.suggestions || [],
          mood: parsed.mood || 'good',
          score: parsed.score || 70,
        };
      } else {
        throw new Error('无法解析 AI 响应');
      }
    } catch (e) {
      review = {
        date: stats.date,
        summary: '今天也是努力的一天！',
        detailedReview: aiResponse,
        highlights: [],
        suggestions: [],
        mood: 'good',
        score: 70,
      };
    }

    return NextResponse.json({ review });

  } catch (error) {
    console.error('Checkup API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
