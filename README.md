# AI Agent Center

AI 助理中心 - 全功能实现

## 功能列表

### ✅ AI 下载助理
- 智能分析网页，提取下载链接
- 支持批量下载
- 实时下载进度

### ✅ AI 资源猎手
- 全网资源搜索
- 按类型筛选（视频/音频/文档/图片）
- 一键下载

### ✅ AI 订阅助理
- 网页内容订阅
- 自定义抓取规则（CSS 选择器）
- 定时自动更新
- 多频率设置（5分钟/15分钟/1小时/6小时/1天）

### ✅ AI 追踪主题
- 多平台热点追踪（微博/知乎/百度）
- 关键词监控
- 实时热度排行

### ✅ AI 更新助理
- 网页变更监控
- 自动通知

### ✅ AI 盯守网页
- 24小时持续监控
- 变更即时提醒

### ✅ AI 财经助理
- 实时股票行情
- AI 智能分析
- 技术指标（MACD/RSI）
- 风险评估

### ✅ AI 学术助理
- 论文搜索
- 引用统计
- 多源检索

### ✅ 较真 AI
- 事实核查
- 可信度评估
- 多源验证

### ✅ AI 高考通
- 志愿填报辅助
- 院校专业分析

## 技术栈

- **后端**: Node.js + Express
- **前端**: 原生 HTML/CSS/JS
- **数据存储**: JSON 文件
- **定时任务**: node-cron
- **WebSocket**: 实时推送

## 安装运行

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动服务
npm start

# 或开发模式
npm run dev
```

服务默认运行在 http://localhost:3000

## API 接口

### 下载助理
- `POST /api/download/analyze` - 分析下载链接
- `POST /api/download/start` - 开始下载
- `GET /api/download/list` - 下载列表

### 订阅助理
- `POST /api/subscribe/create` - 创建订阅
- `GET /api/subscribe/list` - 订阅列表
- `DELETE /api/subscribe/:id` - 删除订阅

### 追踪主题
- `POST /api/track/create` - 创建追踪
- `GET /api/track/list` - 追踪列表

### 财经助理
- `GET /api/finance/market` - 市场行情
- `GET /api/finance/analysis/:symbol` - 股票分析

### 学术助理
- `GET /api/academic/search?q=keyword` - 论文搜索

### 较真 AI
- `POST /api/fact-check` - 事实核查

### 任务管理
- `POST /api/task/create` - 创建任务
- `GET /api/task/list` - 任务列表
- `GET /api/task/:id` - 任务详情

## 数据存储

所有数据保存在 `data/` 目录：
- `tasks.json` - 任务数据
- `subscriptions.json` - 订阅数据
- `downloads.json` - 下载记录
- `tracks.json` - 追踪数据
- `notifications.json` - 通知数据

## 定时任务

每 5 分钟自动执行：
- 检查订阅更新
- 更新追踪主题数据

## 开发计划

- [ ] WebSocket 实时推送
- [ ] 用户系统
- [ ] 更多数据源接入
- [ ] 移动端 App
