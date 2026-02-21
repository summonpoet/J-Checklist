# P人助手 - Vercel 部署指南

## 📋 前置要求

- GitHub 账号
- Vercel 账号（可以用 GitHub 直接登录）
- AI 服务平台的 API Key（Moonshot/智谱/OpenAI）

---

## 🚀 部署步骤

### 第一步：将代码推送到 GitHub

```bash
# 在 checklist-app 目录下
git push origin feature/backend-api

# 然后创建 Pull Request 或直接合并到 master
git checkout master
git merge feature/backend-api
git push origin master
```

---

### 第二步：在 Vercel 创建项目

1. 访问 https://vercel.com
2. 点击 "Add New Project"
3. 选择你的 GitHub 仓库 `J-Checklist`
4. 点击 "Import"

---

### 第三步：配置项目

在 Import 页面，确认以下设置：

| 配置项 | 值 |
|--------|-----|
| **Framework Preset** | Next.js |
| **Root Directory** | `checklist-app` |
| **Build Command** | `npm run build`（默认）|
| **Output Directory** | `.next`（默认）|

点击 "Deploy" 等待部署完成。

---

### 第四步：配置环境变量

项目创建完成后，需要配置 API Key：

1. 在 Vercel Dashboard 选择你的项目
2. 点击 "Settings" → "Environment Variables"
3. 添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `CHECKUP_API_PROVIDER` | `moonshot` | AI 提供商 |
| `CHECKUP_API_KEY` | `sk-...` | 你的 API Key |
| `CHECKUP_API_MODEL` | `moonshot-v1-8k` | 模型名称 |

示例：
```
CHECKUP_API_PROVIDER=moonshot
CHECKUP_API_KEY=sk-your-actual-api-key-here
CHECKUP_API_MODEL=moonshot-v1-8k
```

4. 点击 "Save"
5. 重新部署项目（Vercel 会自动触发）

---

### 第五步：配置自定义域名（可选）

如果想用自己的域名：

1. 在 Vercel Dashboard → "Domains"
2. 输入你的域名，如 `p-helper.yourdomain.com`
3. 按提示添加 DNS 记录

或使用 Vercel 提供的免费域名：
- `j-checklist.vercel.app`（自动分配）

---

## 🔧 常见问题

### 构建失败

**问题**: `npm run build` 失败
**解决**: 检查 Root Directory 是否正确设置为 `checklist-app`

### API 调用失败

**问题**: 点击"听奶奶唠叨两句"报错
**解决**: 
1. 检查环境变量是否正确设置
2. 检查 API Key 是否有效
3. 查看 Vercel Logs（Dashboard → Deployments → 点击最新部署 → Functions）

### 成本估算

假设使用 Moonshot：
- 每次分析约 1000-2000 tokens
- 免费额度：15元
- 每日限流：5次/用户

**估算**：
- 10个用户，每天5次 = 1500次/月 → **基本免费**
- 100个用户，每天5次 = 15000次/月 → **约 50-100 元/月**

如需降低成本，可：
- 降低限流次数（如改为 3次/天）
- 改用智谱 AI（glm-4-flash 免费额度更多）

---

## 📊 监控与维护

### 查看日志

Vercel Dashboard → Deployments → 选择部署 → Functions

### 成本监控

在 AI 提供商后台查看用量：
- Moonshot: https://platform.moonshot.cn
- 智谱: https://open.bigmodel.cn

### 限流调整

编辑 `app/api/checkup/route.ts` 中的 `DAILY_LIMIT` 常量：
```typescript
const DAILY_LIMIT = 5; // 修改为你想要的次数
```

---

## 🔄 更新代码

后续更新只需推送代码到 GitHub，Vercel 会自动重新部署：

```bash
git add .
git commit -m "你的更新说明"
git push origin master
```

---

## 📞 回滚方案

如果新版本有问题，可以在 Vercel Dashboard：
1. 进入 Deployments
2. 找到上一个正常版本
3. 点击 "Promote to Production"

或在本地回滚后重新推送：
```bash
git checkout v0.2.1-stable
git checkout -b master
git push origin master --force
```

---

## 📁 文件说明

| 文件 | 说明 |
|------|------|
| `app/api/checkup/route.ts` | 后端 API 路由 |
| `hooks/useCheckupAgent.ts` | 前端调用后端 API |
| `.env.local` | 本地开发环境变量（不提交 git）|
| `.env.local.example` | 环境变量模板 |

---

**部署完成后，记得把你的 Vercel 域名告诉我！** 🎉
