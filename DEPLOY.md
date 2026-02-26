# AI Agent Center - Vercel 部署指南

## 快速部署

### 1. 安装 Vercel CLI
```bash
npm i -g vercel
```

### 2. 登录 Vercel
```bash
vercel login
```

### 3. 部署
```bash
cd ai-agent-center
vercel --prod
```

## 环境变量（可选）
在 Vercel Dashboard 设置：
- `NODE_ENV`: production

## 注意事项

1. **数据存储**: Vercel 是无服务器环境，数据存储在 `/tmp`，重启后会清空。如需持久化，请连接数据库（MongoDB/PostgreSQL）。

2. **定时任务**: Vercel 不支持 node-cron，可使用 Vercel Cron Jobs 或外部服务。

3. **WebSocket**: Vercel 不支持 WebSocket，实时功能使用轮询替代。

## 连接数据库（推荐）

如需持久化数据，添加 MongoDB：

```bash
# 安装依赖
npm install mongodb

# 设置环境变量
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai-agent
```

## 自定义域名

```bash
vercel domains add your-domain.com
```
