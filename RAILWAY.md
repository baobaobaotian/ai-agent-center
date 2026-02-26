# Railway 部署指南

## 方式一：GitHub 自动部署（推荐）

### 1. 准备代码
确保项目结构：
```
ai-agent-center/
├── backend/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── index.html
│   └── app.js
├── package.json      (根目录)
├── Dockerfile
└── railway.json
```

### 2. 创建 Railway 账号
- 访问 https://railway.app
- 使用 GitHub 账号登录

### 3. 创建新项目
1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择你的 `ai-agent-center` 仓库
4. Railway 会自动检测并部署

### 4. 配置环境变量（可选）
在 Railway Dashboard → Variables 中添加：
- `PORT`: 3000
- `NODE_ENV`: production

### 5. 生成域名
- Railway 会自动分配域名
- 或点击 Settings → Domains 添加自定义域名

## 方式二：Railway CLI 部署

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 进入项目目录
cd ai-agent-center

# 初始化项目
railway init

# 部署
railway up

# 生成域名
railway domain
```

## 方式三：Docker 部署

```bash
# Railway 会自动识别 Dockerfile
# 无需额外配置
```

## 部署后验证

```bash
# 测试 API
curl https://你的域名.railway.app/api/health

# 测试订阅列表
curl https://你的域名.railway.app/api/subscribe/list
```

## 优势

- ✅ 完整 Node.js 支持
- ✅ 持久化存储（数据不会丢失）
- ✅ 自动 HTTPS
- ✅ 免费额度充足
- ✅ 支持 WebSocket
- ✅ 支持定时任务

## 免费额度

- 每月 $5 免费额度
- 512MB RAM
- 1GB 存储
- 足够个人使用
