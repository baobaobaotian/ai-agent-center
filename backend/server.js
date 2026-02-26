const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Vercel serverless 适配
const isVercel = process.env.VERCEL === '1';

// 数据存储 - Vercel 使用 /tmp 目录
const DATA_DIR = isVercel ? '/tmp/data' : path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// 内存数据存储
const db = {
  tasks: [],
  subscriptions: [],
  downloads: [],
  tracks: [],
  users: [],
  notifications: []
};

// 加载持久化数据
function loadData() {
  const files = ['tasks', 'subscriptions', 'downloads', 'tracks', 'users', 'notifications'];
  files.forEach(file => {
    const filePath = path.join(DATA_DIR, `${file}.json`);
    if (fs.existsSync(filePath)) {
      db[file] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  });
}

// 保存数据
function saveData(key) {
  const filePath = path.join(DATA_DIR, `${key}.json`);
  fs.writeFileSync(filePath, JSON.stringify(db[key], null, 2));
}

loadData();

// 中间件
app.use(cors());
app.use(express.json());

// API 路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 文件上传配置 - Vercel 使用 /tmp
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = isVercel ? '/tmp/uploads' : path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// ========== AI 下载助理 ==========
app.post('/api/download/analyze', async (req, res) => {
  const { url } = req.body;
  try {
    // 分析 URL 提取下载链接
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    
    const downloads = [];
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (/\.(mp4|mp3|pdf|zip|rar|exe|apk|dmg)$/i.test(href)) {
        downloads.push({
          id: uuidv4(),
          url: href.startsWith('http') ? href : new URL(href, url).href,
          filename: text || path.basename(href),
          size: '未知',
          type: path.extname(href).slice(1)
        });
      }
    });
    
    res.json({ success: true, downloads });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/download/start', (req, res) => {
  const { url, filename } = req.body;
  const download = {
    id: uuidv4(),
    url,
    filename: filename || path.basename(url),
    status: 'downloading',
    progress: 0,
    createdAt: new Date().toISOString()
  };
  db.downloads.push(download);
  saveData('downloads');
  
  // 模拟下载进度
  simulateDownload(download.id);
  
  res.json({ success: true, download });
});

function simulateDownload(id) {
  const download = db.downloads.find(d => d.id === id);
  if (!download) return;
  
  const interval = setInterval(() => {
    download.progress += Math.random() * 15;
    if (download.progress >= 100) {
      download.progress = 100;
      download.status = 'completed';
      clearInterval(interval);
    }
    saveData('downloads');
  }, 1000);
}

app.get('/api/download/list', (req, res) => {
  res.json({ success: true, downloads: db.downloads });
});

// ========== AI 订阅助理 ==========
app.post('/api/subscribe/create', (req, res) => {
  const { name, url, selector, interval } = req.body;
  const subscription = {
    id: uuidv4(),
    name,
    url,
    selector,
    interval: interval || '1h',
    lastCheck: null,
    items: [],
    createdAt: new Date().toISOString(),
    active: true
  };
  db.subscriptions.push(subscription);
  saveData('subscriptions');
  
  // 立即抓取一次
  fetchSubscription(subscription.id);
  
  res.json({ success: true, subscription });
});

app.get('/api/subscribe/list', (req, res) => {
  res.json({ success: true, subscriptions: db.subscriptions });
});

app.delete('/api/subscribe/:id', (req, res) => {
  const { id } = req.params;
  db.subscriptions = db.subscriptions.filter(s => s.id !== id);
  saveData('subscriptions');
  res.json({ success: true });
});

async function fetchSubscription(id) {
  const sub = db.subscriptions.find(s => s.id === id);
  if (!sub || !sub.active) return;
  
  try {
    const response = await axios.get(sub.url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    
    const items = [];
    $(sub.selector).each((i, el) => {
      items.push({
        title: $(el).text().trim(),
        link: $(el).attr('href') || sub.url,
        time: new Date().toISOString()
      });
    });
    
    sub.items = items.slice(0, 20);
    sub.lastCheck = new Date().toISOString();
    saveData('subscriptions');
  } catch (error) {
    console.error('Fetch subscription error:', error.message);
  }
}

// ========== AI 追踪主题 ==========
app.post('/api/track/create', (req, res) => {
  const { keyword, platforms } = req.body;
  const track = {
    id: uuidv4(),
    keyword,
    platforms: platforms || ['weibo', 'zhihu', 'baidu'],
    results: [],
    createdAt: new Date().toISOString(),
    active: true
  };
  db.tracks.push(track);
  saveData('tracks');
  
  // 立即搜索一次
  searchTrack(track.id);
  
  res.json({ success: true, track });
});

app.get('/api/track/list', (req, res) => {
  res.json({ success: true, tracks: db.tracks });
});

async function searchTrack(id) {
  const track = db.tracks.find(t => t.id === id);
  if (!track) return;
  
  const results = [];
  
  // 模拟从各平台抓取数据
  for (const platform of track.platforms) {
    try {
      let items = [];
      switch (platform) {
        case 'weibo':
          items = await fetchWeiboHot(track.keyword);
          break;
        case 'zhihu':
          items = await fetchZhihuHot(track.keyword);
          break;
        case 'baidu':
          items = await fetchBaiduHot(track.keyword);
          break;
      }
      results.push({ platform, items });
    } catch (error) {
      console.error(`Search ${platform} error:`, error.message);
    }
  }
  
  track.results = results;
  track.lastUpdate = new Date().toISOString();
  saveData('tracks');
}

// 模拟各平台热点抓取
async function fetchWeiboHot(keyword) {
  // 实际实现需要接入微博 API
  return [
    { title: `${keyword} 最新动态`, hot: '234万', rank: 1 },
    { title: `${keyword} 引发热议`, hot: '189万', rank: 2 },
    { title: `${keyword} 相关话题`, hot: '156万', rank: 3 },
  ];
}

async function fetchZhihuHot(keyword) {
  return [
    { title: `如何看待 ${keyword}？`, hot: '1.2万', rank: 1 },
    { title: `${keyword} 的深度分析`, hot: '8.5k', rank: 2 },
  ];
}

async function fetchBaiduHot(keyword) {
  return [
    { title: `${keyword} 百度百科`, hot: '热搜', rank: 1 },
    { title: `${keyword} 最新新闻`, hot: '推荐', rank: 2 },
  ];
}

// ========== AI 财经助理 ==========
app.get('/api/finance/market', async (req, res) => {
  try {
    // 模拟股票数据
    const stocks = [
      { symbol: '000001', name: '平安银行', price: 12.58, change: 2.35 },
      { symbol: '000002', name: '万科A', price: 15.32, change: -1.25 },
      { symbol: '600519', name: '贵州茅台', price: 1688.00, change: 0.85 },
      { symbol: '00700', name: '腾讯控股', price: 385.60, change: 3.12 },
      { symbol: 'BABA', name: '阿里巴巴', price: 88.45, change: -0.56 },
    ];
    
    // 计算涨跌幅
    stocks.forEach(s => {
      s.trend = s.change >= 0 ? 'up' : 'down';
      s.changePercent = (s.change / (s.price - s.change) * 100).toFixed(2);
    });
    
    res.json({ success: true, stocks });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get('/api/finance/analysis/:symbol', (req, res) => {
  const { symbol } = req.params;
  
  // AI 分析结果
  const analysis = {
    symbol,
    rating: Math.random() > 0.5 ? '买入' : '观望',
    targetPrice: (Math.random() * 100 + 50).toFixed(2),
    aiInsight: `基于技术分析和基本面数据，该股票${Math.random() > 0.5 ? '呈现上涨趋势' : '短期震荡'}。建议关注成交量变化和市场情绪。`,
    riskLevel: ['低', '中', '高'][Math.floor(Math.random() * 3)],
    indicators: {
      macd: Math.random() > 0.5 ? '金叉' : '死叉',
      rsi: (Math.random() * 100).toFixed(1),
      volume: (Math.random() * 10000).toFixed(0) + '万'
    }
  };
  
  res.json({ success: true, analysis });
});

// ========== AI 学术助理 ==========
app.get('/api/academic/search', async (req, res) => {
  const { q, page = 1 } = req.query;
  
  // 模拟论文搜索结果
  const papers = [
    { title: `基于深度学习的${q}研究`, authors: '张三, 李四', journal: '计算机学报', year: 2024, citations: 128 },
    { title: `${q}：综述与展望`, authors: '王五等', journal: '人工智能', year: 2023, citations: 256 },
    { title: `大规模${q}模型研究`, authors: '赵六, 钱七', journal: 'Nature', year: 2024, citations: 512 },
    { title: `${q}在实际应用中的挑战`, authors: '孙八', journal: 'Science', year: 2023, citations: 89 },
  ];
  
  res.json({ success: true, papers, total: papers.length });
});

// ========== 较真 AI 查真假 ==========
app.post('/api/fact-check', async (req, res) => {
  const { content } = req.body;
  
  // 模拟事实核查
  const keywords = ['谣言', '假', '骗局', '不实'];
  const isSuspicious = keywords.some(k => content.includes(k));
  
  const result = {
    id: uuidv4(),
    content: content.slice(0, 200),
    verdict: isSuspicious ? '存疑' : '基本属实',
    confidence: isSuspicious ? 0.35 : 0.85,
    sources: [
      { name: '官方辟谣平台', url: '#' },
      { name: '权威媒体报道', url: '#' },
    ],
    explanation: isSuspicious 
      ? '该内容包含可疑表述，建议进一步核实来源。'
      : '该内容暂未发现明显问题，但建议交叉验证。',
    checkedAt: new Date().toISOString()
  };
  
  res.json({ success: true, result });
});

// ========== 任务管理 ==========
app.post('/api/task/create', (req, res) => {
  const { type, name, config } = req.body;
  const task = {
    id: uuidv4(),
    type,
    name,
    config,
    status: 'pending',
    progress: 0,
    result: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.tasks.push(task);
  saveData('tasks');
  
  // 异步执行任务
  executeTask(task.id);
  
  res.json({ success: true, task });
});

app.get('/api/task/list', (req, res) => {
  res.json({ success: true, tasks: db.tasks });
});

app.get('/api/task/:id', (req, res) => {
  const task = db.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
  res.json({ success: true, task });
});

async function executeTask(id) {
  const task = db.tasks.find(t => t.id === id);
  if (!task) return;
  
  task.status = 'running';
  saveData('tasks');
  
  // 根据任务类型执行不同操作
  switch (task.type) {
    case 'download':
      await simulateTaskProgress(id, 5000);
      break;
    case 'scrape':
      await simulateTaskProgress(id, 8000);
      break;
    case 'analysis':
      await simulateTaskProgress(id, 3000);
      break;
    default:
      await simulateTaskProgress(id, 2000);
  }
  
  task.status = 'completed';
  task.progress = 100;
  task.result = { message: '任务执行完成' };
  task.updatedAt = new Date().toISOString();
  saveData('tasks');
}

function simulateTaskProgress(id, duration) {
  return new Promise(resolve => {
    const task = db.tasks.find(t => t.id === id);
    const interval = setInterval(() => {
      task.progress += 10;
      if (task.progress >= 100) {
        clearInterval(interval);
        resolve();
      }
    }, duration / 10);
  });
}

// ========== 通知系统 ==========
app.get('/api/notifications', (req, res) => {
  res.json({ success: true, notifications: db.notifications.slice(0, 20) });
});

app.post('/api/notifications/read/:id', (req, res) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.read = true;
    saveData('notifications');
  }
  res.json({ success: true });
});

// 定时任务
cron.schedule('*/5 * * * *', () => {
  console.log('Running scheduled tasks...');
  
  // 检查订阅更新
  db.subscriptions.forEach(sub => {
    if (sub.active) fetchSubscription(sub.id);
  });
  
  // 更新追踪主题
  db.tracks.forEach(track => {
    if (track.active) searchTrack(track.id);
  });
});

// 启动服务器 - Vercel 不需要监听
if (!isVercel) {
  const server = app.listen(PORT, () => {
    console.log(`AI Agent Center server running on port ${PORT}`);
  });

  // WebSocket 用于实时更新 (仅本地)
  const wss = new WebSocket.Server({ server });
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.on('message', (message) => {
      const data = JSON.parse(message);
      if (data.type === 'subscribe' && data.taskId) {
        const interval = setInterval(() => {
          const task = db.tasks.find(t => t.id === data.taskId);
          if (task) {
            ws.send(JSON.stringify({ type: 'progress', task }));
            if (task.status === 'completed') clearInterval(interval);
          }
        }, 1000);
      }
    });
    ws.on('close', () => console.log('WebSocket client disconnected'));
  });
}

// 前端静态文件服务
app.use(express.static(path.join(__dirname, '../frontend')));

// 所有其他路由返回前端页面
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Vercel 导出
module.exports = app;
