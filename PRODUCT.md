# J人养成器 - 产品文档

> **产品定位**：一个帮助用户防止遗漏、克服启动困难、提升行动纪律性的 Checklist 工具。
> 
> **目标用户**：想要培养 J 人特质（计划性、执行力）的 P 人，或希望进一步提升效率的 J 人。

---

## 📋 产品信息

| 项目 | 内容 |
|------|------|
| **产品名称** | P人助手 |
| **英文名称** | P-Helper |
| **当前版本** | v0.2.1 |
| **在线地址** | https://summonpoet.github.io/J-Checklist/ |
| **代码仓库** | https://github.com/summonpoet/J-Checklist |
| **技术栈** | Next.js + React + TypeScript + Tailwind CSS |
| **数据存储** | 浏览器 localStorage |

---

## 🎯 核心功能

### 已实现功能 (v0.1.0)

#### 1. 行动项管理
- ✅ 添加新的行动项
- ✅ 设置行动项属性：
  - 名称（必填）
  - 难度等级（低/中/高）
  - 重要度等级（低/中/高）
  - 一日执行次数（1-n 次）
  - 有始有终模式（是否启用计时）
- ✅ 编辑已有行动项
- ✅ 删除行动项

#### 2. 任务执行
- ✅ 任务列表展示
- ✅ 任务排序逻辑：
  - 未完成优先于已完成
  - 高重要度优先于低重要度
  - 创建时间早的优先
- ✅ 简单完成模式：点击"干"立即完成
- ✅ 计时完成模式：
  - 点击"开干"开始计时
  - 显示进行中的时间
  - 点击"干完"结束并记录用时
- ✅ 取消进行中的任务

#### 3. 进度追踪
- ✅ 血条进度显示（当日多次任务）
- ✅ 完成次数统计
- ✅ 完成率统计
- ✅ 进行中的任务数统计

#### 4. 数据管理
- ✅ 本地存储持久化（localStorage）
- ✅ 跨天自动重置任务状态
- ✅ 数据版本管理（避免升级后数据冲突）

#### 5. AI 养成教练 (Checkup Agent) ⭐ NEW
- ✅ 多 AI 提供商支持（OpenAI、Claude、Moonshot、智谱、自定义）
- ✅ 智能任务分析：
  - 总体完成率分析
  - 重要任务完成率分析
  - 困难任务完成率分析
  - 专注时间统计
- ✅ 个性化评价生成：
  - 一句话总结
  - 详细评价报告
  - 亮点提取
  - 改进建议
- ✅ 历史数据对比（保留最近7天上下文）
- ✅ 综合评分系统（0-100分）
- ✅ 心情标签（超棒/不错/还行/加油）
- ✅ 本地 API Key 存储（安全，不上传服务器）

---

## 🛠️ 技术架构

### 项目结构
```
checklist-app/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── App.tsx           # 主应用组件（含底部导航）
│   ├── ActionItemEditor.tsx  # 界面1：管理行动项
│   ├── TaskExecutor.tsx  # 界面2：执行任务
│   ├── CheckupAgent.tsx  # 界面3：AI 养成教练 ⭐ NEW
│   └── AIConfigModal.tsx # AI 配置弹窗 ⭐ NEW
├── hooks/                # 自定义 Hooks
│   ├── useLocalStorage.ts  # localStorage 持久化
│   ├── useChecklist.ts    # 核心业务逻辑
│   └── useCheckupAgent.ts # AI 教练逻辑 ⭐ NEW
├── types/                # TypeScript 类型定义
│   ├── index.ts          # 基础类型
│   └── checkup.ts        # AI 模块类型 ⭐ NEW
├── docs/                 # 构建输出（GitHub Pages）
└── PRODUCT.md            # 本文件
```

### 数据模型

```typescript
// 行动项配置（用户设置的模板）
interface ActionItem {
  id: string;              // 唯一标识
  name: string;            // 行动项名称
  difficulty: Difficulty;  // 难度：low/medium/high
  importance: Importance;  // 重要度：low/medium/high
  timesPerDay: number;     // 一日执行次数
  hasDuration: boolean;    // 是否启用计时
  createdAt: number;       // 创建时间戳
}

// 今日任务实例（每日生成）
interface TodayTask {
  actionId: string;           // 关联的行动项ID
  completedCount: number;     // 今日已完成次数
  currentExecution: TaskExecution | null;  // 当前进行中的执行
  isCompletedToday: boolean;  // 今日是否已完成全部
  executions: TaskExecution[]; // 所有执行记录
  lastUpdated: number;        // 最后更新时间
}

// 单次执行记录
interface TaskExecution {
  startTime: number | null;   // 开始时间
  endTime: number | null;     // 结束时间
  duration: number;           // 持续时间（毫秒）
}
```

---

## 🚀 开发指南

### 本地开发

```bash
# 1. 进入项目目录
cd checklist-app

# 2. 安装依赖（如未安装）
npm install

# 3. 启动开发服务器
npm run dev

# 4. 浏览器访问 http://localhost:3000
```

### 构建部署

```bash
# 1. 构建生产版本
npm run build

# 2. 提交更改
git add .
git commit -m "描述本次更新"

# 3. 推送到 GitHub（自动触发 GitHub Pages 部署）
git push origin master

# 4. 等待 1-2 分钟后访问线上地址验证
```

### 部署注意事项

1. **GitHub Pages 配置**：
   - Source: Deploy from a branch
   - Branch: master /docs folder
   - 已添加 `.nojekyll` 文件（防止 Jekyll 忽略 `_next` 文件夹）

2. **basePath 配置**：
   - 在 `next.config.ts` 中设置了 `basePath: '/J-Checklist'`
   - 确保资源路径正确指向子目录

---

## 📜 更新日志

### v0.2.1 (2026-02-20) 🎨 星露谷主题更新

**P人助手全新形象**

#### 视觉风格全面升级
- 🌾 **星露谷物语风格 UI**
  - 暖色调配色（稻草黄、泥土棕、农场绿）
  - 像素游戏风格边框和阴影
  - 游戏工具图标（铲子、斧头、镐子）
  - 心形体力条取代传统进度条

#### 文案风格改造
- 产品名称：P人助手
- 今儿的活儿（原今日任务）
- 干完了 / 干着呢（原已完成/进行中）
- J人百分比（原完成率）
- 唠叨奶奶（原AI教练）
- 当个事儿办（原管理行动项）
- 加个事儿（原添加行动项）
- 完整本土化口语化改造

#### 交互体验优化
- 按钮按下缩放反馈
- 卡片悬停浮起效果
- 游戏风格动画（浮动、闪烁、摇摆）
- 三栏底部导航栏（农场风格工具栏）

---

### v0.2.0 (2026-02-20) ⭐ 重大更新
**AI 养成教练模块上线**

#### 新增功能
- ✨ **AI 养成教练 (Checkup Agent)**
  - 支持多平台 AI：OpenAI、Anthropic Claude、Moonshot Kimi、智谱 GLM
  - 智能分析任务完成数据（完成率、重要度、难度）
  - 生成个性化每日评价和总结
  - 历史数据对比分析（7天上下文记忆）
  - 综合评分和心情标签系统
  - API Key 本地加密存储
- ✨ 新增 "AI教练" 底部导航栏入口

#### 技术实现
- 新增 `useCheckupAgent` Hook 管理 AI 逻辑
- 新增 `AIConfigModal` 组件配置 AI 提供商
- 新增 `CheckupAgent` 主组件展示分析结果
- 新增 `checkup.ts` 类型定义
- 使用 React Context 模式管理 AI 状态

---

### v0.1.0 (2026-02-20)
**初始版本发布**

#### 新增功能
- ✨ 行动项管理界面（添加、编辑、删除）
- ✨ 任务执行界面（完成、计时）
- ✨ 血条进度显示（多次任务）
- ✨ 任务排序（完成状态 + 重要度）
- ✨ 本地数据持久化
- ✨ 跨天自动重置

#### 技术实现
- 使用 Next.js 16 + React 19 + TypeScript
- 使用 Tailwind CSS 构建响应式 UI
- 使用 Lucide React 图标库
- 使用 localStorage 本地存储
- 部署到 GitHub Pages

#### 修复问题
- 修复 GitHub Pages 子路径部署问题（basePath）
- 修复 Jekyll 忽略 `_next` 文件夹问题（.nojekyll）
- 修复 hydration 不匹配问题（mounted 状态）

---

## 🗺️ 路线图

### 计划功能（v0.3.0）
- [ ] 数据导出/导入（JSON 格式）
- [ ] 连续完成天数统计（Streak）
- [ ] 任务完成提醒（浏览器通知）
- [ ] AI 语音播报评价（Web Speech API）

### 计划功能（v0.4.0）
- [ ] 周/月报生成（AI 生成周期性总结）
- [ ] 习惯养成建议（基于数据分析）
- [ ] 任务推荐系统（AI 推荐合适的任务量）

### 远期规划（v1.0.0）
- [ ] 云端数据同步（支持多设备）
- [ ] 用户账号系统
- [ ] 数据分析报告（周报/月报）
- [ ] 移动端 App（React Native）

---

## 🐛 已知问题

| 问题 | 状态 | 说明 |
|------|------|------|
| ~~资源 404~~ | ✅ 已修复 | GitHub Pages Jekyll 忽略 `_next` 文件夹 |
| ~~加载中无限显示~~ | ✅ 已修复 | hydration mismatch + basePath 配置 |
| 首次访问闪烁 | 🔄 观察中 | 可能与 React 18 Streaming 有关 |

---

## 💡 开发规范

### 代码提交规范
```
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 样式调整
refactor: 重构代码
test: 测试相关
chore: 构建/配置相关
```

### 文件命名规范
- 组件：PascalCase（如 `ActionItemEditor.tsx`）
- Hooks：camelCase 前缀 use（如 `useChecklist.ts`）
- 类型：camelCase（如 `index.ts`）

### 样式规范
- 使用 Tailwind CSS 工具类
- 颜色主题：stone（灰褐色系）
- 圆角：rounded-lg / rounded-xl
- 间距：4px 为基准（1 = 4px）

---

## 📞 维护记录

| 日期 | 维护人 | 操作 |
|------|--------|------|
| 2026-02-20 | Kimi | 创建项目，实现 v0.1.0 基础功能 |
| 2026-02-20 | Kimi | 修复 GitHub Pages 部署问题 |
| 2026-02-20 | Kimi | 发布 v0.2.0，上线 AI 养成教练模块 |
| 2026-02-20 | Kimi | 发布 v0.2.1，全面星露谷风格 redesign |

---

## 📄 许可证

MIT License - 详见仓库 LICENSE 文件

---

> 最后更新：2026-02-20 (v0.2.1)
