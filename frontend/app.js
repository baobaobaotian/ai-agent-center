// API 基础地址
const API_BASE = window.location.origin.includes('localhost') 
    ? 'http://localhost:3000/api' 
    : '/api';

// AI 助理数据
const agents = [
    { id: 'download', name: 'AI 下载助理', desc: '智能识别下载链接，一键批量下载资源', icon: '⬇️', category: 'download', color: 'blue', tag: '热门' },
    { id: 'resource', name: 'AI 资源猎手', desc: '全网搜索资源，视频音乐文档一网打尽', icon: '🎯', category: 'download', color: 'green', tag: '推荐' },
    { id: 'subscribe', name: 'AI 订阅助理', desc: '订阅你关心的内容，自动推送最新动态', icon: '📬', category: 'subscribe', color: 'orange', tag: '新功能' },
    { id: 'track', name: 'AI 追踪主题', desc: '追踪热点话题，实时掌握舆论动态', icon: '🔍', category: 'track', color: 'purple', tag: '' },
    { id: 'update', name: 'AI 更新助理', desc: '监控网页变化，第一时间通知你', icon: '🔄', category: 'track', color: 'cyan', tag: '' },
    { id: 'monitor', name: 'AI 盯守网页', desc: '24小时监控指定网页，变更即通知', icon: '👁️', category: 'track', color: 'indigo', tag: '' },
    { id: 'finance', name: 'AI 财经助理', desc: 'AI 分析股市数据，助力投资决策', icon: '📊', category: 'finance', color: 'red', tag: '热门' },
    { id: 'academic', name: 'AI 学术助理', desc: '海量论文检索，科研好帮手', icon: '🎓', category: 'academic', color: 'teal', tag: '' },
    { id: 'factcheck', name: '较真 AI', desc: '实时智能查证，辨别真假信息', icon: '✅', category: 'tool', color: 'pink', tag: '实用' },
    { id: 'gaokao', name: 'AI 高考通', desc: 'AI 填报科学辅助，选校选专业', icon: '📝', category: 'academic', color: 'amber', tag: '' },
];

let currentCategory = 'all';
let currentPage = 'home';

// 初始化
function init() {
    renderAgents();
    bindEvents();
    loadTasks();
}

// 渲染 AI 助理卡片
function renderAgents() {
    const grid = document.getElementById('agentGrid');
    const filtered = currentCategory === 'all' 
        ? agents 
        : agents.filter(a => a.category === currentCategory);
    
    grid.innerHTML = filtered.map(agent => `
        <div class="agent-card" onclick="openAgent('${agent.id}')">
            <div class="agent-icon ${agent.color}">${agent.icon}</div>
            <div class="agent-name">${agent.name}</div>
            <div class="agent-desc">${agent.desc}</div>
            ${agent.tag ? `<span class="agent-tag">${agent.tag}</span>` : ''}
        </div>
    `).join('');
}

// 绑定事件
function bindEvents() {
    // 分类切换
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.cat;
            renderAgents();
        });
    });

    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const keyword = this.value.toLowerCase();
            const grid = document.getElementById('agentGrid');
            
            if (!keyword) {
                renderAgents();
                return;
            }
            
            const filtered = agents.filter(a => 
                a.name.toLowerCase().includes(keyword) || 
                a.desc.toLowerCase().includes(keyword)
            );
            
            grid.innerHTML = filtered.map(agent => `
                <div class="agent-card" onclick="openAgent('${agent.id}')">
                    <div class="agent-icon ${agent.color}">${agent.icon}</div>
                    <div class="agent-name">${agent.name}</div>
                    <div class="agent-desc">${agent.desc}</div>
                    ${agent.tag ? `<span class="agent-tag">${agent.tag}</span>` : ''}
                </div>
            `).join('');
        });
    }
}

// 打开 AI 助理功能
function openAgent(agentId) {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    document.getElementById('modalTitle').textContent = agent.name;
    const modalBody = document.getElementById('modalBody');

    switch (agentId) {
        case 'download':
            modalBody.innerHTML = renderDownloadForm();
            break;
        case 'resource':
            modalBody.innerHTML = renderResourceForm();
            break;
        case 'subscribe':
            modalBody.innerHTML = renderSubscribeForm();
            break;
        case 'track':
            modalBody.innerHTML = renderTrackForm();
            break;
        case 'finance':
            modalBody.innerHTML = renderFinanceForm();
            loadStockData();
            break;
        case 'academic':
            modalBody.innerHTML = renderAcademicForm();
            break;
        case 'factcheck':
            modalBody.innerHTML = renderFactCheckForm();
            break;
        default:
            modalBody.innerHTML = `<div class="loading">该功能即将上线</div>`;
    }

    document.getElementById('agentModal').classList.add('active');
}

// AI 下载助理表单
function renderDownloadForm() {
    return `
        <div class="form-group">
            <label class="form-label">输入网页链接</label>
            <input type="url" class="form-input" id="downloadUrl" placeholder="https://example.com">
        </div>
        <button class="btn-primary" onclick="analyzeDownload()">分析下载链接</button>
        <div id="downloadResult"></div>
    `;
}

async function analyzeDownload() {
    const url = document.getElementById('downloadUrl').value;
    if (!url) return alert('请输入链接');

    const resultDiv = document.getElementById('downloadResult');
    resultDiv.innerHTML = '<div class="loading"><div class="spinner"></div>分析中...</div>';

    try {
        const res = await fetch(`${API_BASE}/download/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        const data = await res.json();

        if (data.success && data.downloads.length > 0) {
            resultDiv.innerHTML = `
                <div class="result-section">
                    <div class="result-title">找到 ${data.downloads.length} 个下载链接</div>
                    ${data.downloads.map(d => `
                        <div class="list-item">
                            <div class="list-icon blue">📥</div>
                            <div class="list-content">
                                <div class="list-title">${d.filename}</div>
                                <div class="list-meta">${d.type.toUpperCase()}</div>
                            </div>
                            <div class="list-action" onclick="startDownload('${d.url}', '${d.filename}')">下载</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            resultDiv.innerHTML = '<div class="result-section">未找到下载链接</div>';
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="result-section">分析失败: ${error.message}</div>`;
    }
}

async function startDownload(url, filename) {
    try {
        const res = await fetch(`${API_BASE}/download/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, filename })
        });
        const data = await res.json();
        
        if (data.success) {
            alert(`开始下载: ${filename}`);
            closeModal();
            switchPage('tasks');
        }
    } catch (error) {
        alert('下载失败: ' + error.message);
    }
}

// AI 资源猎手表单
function renderResourceForm() {
    return `
        <div class="form-group">
            <label class="form-label">搜索资源</label>
            <input type="text" class="form-input" id="resourceQuery" placeholder="输入关键词搜索...">
        </div>
        <div class="form-group">
            <label class="form-label">资源类型</label>
            <select class="form-select" id="resourceType">
                <option value="all">全部</option>
                <option value="video">视频</option>
                <option value="audio">音频</option>
                <option value="doc">文档</option>
                <option value="image">图片</option>
            </select>
        </div>
        <button class="btn-primary" onclick="searchResource()">开始搜索</button>
        <div id="resourceResult"></div>
    `;
}

async function searchResource() {
    const query = document.getElementById('resourceQuery').value;
    if (!query) return alert('请输入搜索关键词');

    const resultDiv = document.getElementById('resourceResult');
    resultDiv.innerHTML = '<div class="loading"><div class="spinner"></div>搜索中...</div>';

    // 模拟搜索结果
    setTimeout(() => {
        resultDiv.innerHTML = `
            <div class="result-section">
                <div class="result-title">搜索结果</div>
                <div class="list-item">
                    <div class="list-icon green">📹</div>
                    <div class="list-content">
                        <div class="list-title">${query} 教程视频</div>
                        <div class="list-meta">MP4 · 256MB</div>
                    </div>
                    <div class="list-action" onclick="startDownload('http://example.com/1.mp4', '教程.mp4')">下载</div>
                </div>
                <div class="list-item">
                    <div class="list-icon orange">📄</div>
                    <div class="list-content">
                        <div class="list-title">${query} 相关资料</div>
                        <div class="list-meta">PDF · 12MB</div>
                    </div>
                    <div class="list-action" onclick="startDownload('http://example.com/1.pdf', '资料.pdf')">下载</div>
                </div>
            </div>
        `;
    }, 1500);
}

// AI 订阅助理表单
function renderSubscribeForm() {
    return `
        <div class="form-group">
            <label class="form-label">订阅名称</label>
            <input type="text" class="form-input" id="subName" placeholder="例如：知乎热榜">
        </div>
        <div class="form-group">
            <label class="form-label">网页链接</label>
            <input type="url" class="form-input" id="subUrl" placeholder="https://www.zhihu.com/hot">
        </div>
        <div class="form-group">
            <label class="form-label">内容选择器 (CSS)</label>
            <input type="text" class="form-input" id="subSelector" placeholder="例如：.HotItem-title" value="h2, .title, [class*='title']">
        </div>
        <div class="form-group">
            <label class="form-label">检查频率</label>
            <select class="form-select" id="subInterval">
                <option value="5m">5分钟</option>
                <option value="15m">15分钟</option>
                <option value="1h" selected>1小时</option>
                <option value="6h">6小时</option>
                <option value="1d">1天</option>
            </select>
        </div>
        <button class="btn-primary" onclick="createSubscription()">创建订阅</button>
        <div id="subList"></div>
    `;
}

async function createSubscription() {
    const name = document.getElementById('subName').value;
    const url = document.getElementById('subUrl').value;
    const selector = document.getElementById('subSelector').value;
    const interval = document.getElementById('subInterval').value;

    if (!name || !url) return alert('请填写完整信息');

    try {
        const res = await fetch(`${API_BASE}/subscribe/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, url, selector, interval })
        });
        const data = await res.json();

        if (data.success) {
            alert('订阅创建成功！');
            loadSubscriptions();
        }
    } catch (error) {
        alert('创建失败: ' + error.message);
    }
}

async function loadSubscriptions() {
    try {
        const res = await fetch(`${API_BASE}/subscribe/list`);
        const data = await res.json();
        
        const listDiv = document.getElementById('subList');
        if (data.subscriptions.length > 0) {
            listDiv.innerHTML = `
                <div class="result-section">
                    <div class="result-title">我的订阅</div>
                    ${data.subscriptions.map(sub => `
                        <div class="list-item">
                            <div class="list-icon orange">📬</div>
                            <div class="list-content">
                                <div class="list-title">${sub.name}</div>
                                <div class="list-meta">${sub.items?.length || 0} 条内容 · ${sub.interval}</div>
                            </div>
                            <div class="list-action" onclick="deleteSubscription('${sub.id}')">删除</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error('加载订阅失败:', error);
    }
}

async function deleteSubscription(id) {
    if (!confirm('确定删除此订阅？')) return;
    
    try {
        await fetch(`${API_BASE}/subscribe/${id}`, { method: 'DELETE' });
        loadSubscriptions();
    } catch (error) {
        alert('删除失败');
    }
}

// AI 追踪主题表单
function renderTrackForm() {
    return `
        <div class="form-group">
            <label class="form-label">追踪关键词</label>
            <input type="text" class="form-input" id="trackKeyword" placeholder="例如：人工智能">
        </div>
        <div class="form-group">
            <label class="form-label">监控平台</label>
            <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px;">
                <label><input type="checkbox" value="weibo" checked> 微博</label>
                <label><input type="checkbox" value="zhihu" checked> 知乎</label>
                <label><input type="checkbox" value="baidu" checked> 百度</label>
            </div>
        </div>
        <button class="btn-primary" onclick="createTrack()">开始追踪</button>
        <div id="trackResult"></div>
    `;
}

async function createTrack() {
    const keyword = document.getElementById('trackKeyword').value;
    const platforms = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);

    if (!keyword) return alert('请输入关键词');

    try {
        const res = await fetch(`${API_BASE}/track/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword, platforms })
        });
        const data = await res.json();

        if (data.success) {
            alert('追踪任务创建成功！');
            showTrackResults(data.track);
        }
    } catch (error) {
        alert('创建失败: ' + error.message);
    }
}

function showTrackResults(track) {
    const resultDiv = document.getElementById('trackResult');
    resultDiv.innerHTML = `
        <div class="result-section">
            <div class="result-title">"${track.keyword}" 追踪结果</div>
            ${track.results?.map(r => `
                <div style="margin-bottom: 16px;">
                    <div style="font-weight: 600; margin-bottom: 8px;">${r.platform}</div>
                    ${r.items?.map(item => `
                        <div class="list-item" style="padding: 8px 0;">
                            <div class="list-content">
                                <div class="list-title">${item.title}</div>
                                <div class="list-meta">热度: ${item.hot}</div>
                            </div>
                        </div>
                    `).join('') || '<div style="color: #999;">暂无数据</div>'}
                </div>
            `).join('') || '<div class="loading">数据采集中...</div>'}
        </div>
    `;
}

// AI 财经助理表单
function renderFinanceForm() {
    return `
        <div class="form-group">
            <label class="form-label">股票代码</label>
            <input type="text" class="form-input" id="stockCode" placeholder="例如：000001">
        </div>
        <button class="btn-primary" onclick="analyzeStock()">AI 分析</button>
        <div id="stockList"></div>
        <div id="stockAnalysis"></div>
    `;
}

async function loadStockData() {
    const listDiv = document.getElementById('stockList');
    listDiv.innerHTML = '<div class="loading"><div class="spinner"></div>加载中...</div>';

    try {
        const res = await fetch(`${API_BASE}/finance/market`);
        const data = await res.json();

        if (data.success) {
            listDiv.innerHTML = `
                <div class="result-section">
                    <div class="result-title">市场行情</div>
                    ${data.stocks.map(s => `
                        <div class="stock-card" onclick="showStockDetail('${s.symbol}')">
                            <div class="stock-info">
                                <div class="stock-name">${s.name}</div>
                                <div class="stock-code">${s.symbol}</div>
                            </div>
                            <div class="stock-price">
                                <div class="price-value ${s.trend}">¥${s.price.toFixed(2)}</div>
                                <div class="price-change ${s.trend}">${s.change > 0 ? '+' : ''}${s.changePercent}%</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        listDiv.innerHTML = '<div class="result-section">加载失败</div>';
    }
}

async function analyzeStock() {
    const code = document.getElementById('stockCode').value;
    if (!code) return alert('请输入股票代码');

    const analysisDiv = document.getElementById('stockAnalysis');
    analysisDiv.innerHTML = '<div class="loading"><div class="spinner"></div>AI 分析中...</div>';

    try {
        const res = await fetch(`${API_BASE}/finance/analysis/${code}`);
        const data = await res.json();

        if (data.success) {
            analysisDiv.innerHTML = `
                <div class="result-section">
                    <div class="result-title">AI 分析报告</div>
                    <div style="padding: 12px; background: ${data.analysis.rating === '买入' ? '#e8f5e9' : '#fff3e0'}; border-radius: 8px; margin-bottom: 12px;">
                        <div style="font-size: 24px; font-weight: bold; color: ${data.analysis.rating === '买入' ? '#52c41a' : '#ff9800'};">${data.analysis.rating}</div>
                        <div style="color: #666; margin-top: 4px;">目标价: ¥${data.analysis.targetPrice}</div>
                    </div>
                    <div style="font-size: 14px; line-height: 1.6; color: #333; margin-bottom: 12px;">${data.analysis.aiInsight}</div>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <div style="padding: 8px 12px; background: #f5f5f5; border-radius: 6px;">
                            <div style="font-size: 12px; color: #999;">风险等级</div>
                            <div style="font-weight: 600;">${data.analysis.riskLevel}</div>
                        </div>
                        <div style="padding: 8px 12px; background: #f5f5f5; border-radius: 6px;">
                            <div style="font-size: 12px; color: #999;">MACD</div>
                            <div style="font-weight: 600;">${data.analysis.indicators.macd}</div>
                        </div>
                        <div style="padding: 8px 12px; background: #f5f5f5; border-radius: 6px;">
                            <div style="font-size: 12px; color: #999;">RSI</div>
                            <div style="font-weight: 600;">${data.analysis.indicators.rsi}</div>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        analysisDiv.innerHTML = '<div class="result-section">分析失败</div>';
    }
}

// AI 学术助理表单
function renderAcademicForm() {
    return `
        <div class="form-group">
            <label class="form-label">搜索论文</label>
            <input type="text" class="form-input" id="paperQuery" placeholder="输入关键词搜索学术论文...">
        </div>
        <button class="btn-primary" onclick="searchPapers()">搜索</button>
        <div id="paperResult"></div>
    `;
}

async function searchPapers() {
    const query = document.getElementById('paperQuery').value;
    if (!query) return alert('请输入搜索关键词');

    const resultDiv = document.getElementById('paperResult');
    resultDiv.innerHTML = '<div class="loading"><div class="spinner"></div>搜索中...</div>';

    try {
        const res = await fetch(`${API_BASE}/academic/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.success) {
            resultDiv.innerHTML = `
                <div class="result-section">
                    <div class="result-title">找到 ${data.total} 篇相关论文</div>
                    ${data.papers.map(p => `
                        <div class="list-item" style="align-items: flex-start;">
                            <div class="list-icon teal">📄</div>
                            <div class="list-content">
                                <div class="list-title">${p.title}</div>
                                <div class="list-meta">${p.authors} · ${p.journal} · ${p.year} · 被引 ${p.citations} 次</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="result-section">搜索失败</div>';
    }
}

// 较真 AI 表单
function renderFactCheckForm() {
    return `
        <div class="form-group">
            <label class="form-label">输入要查证的内容</label>
            <textarea class="form-textarea" id="factContent" placeholder="粘贴你想验证的文本、链接或截图..."></textarea>
        </div>
        <button class="btn-primary" onclick="checkFact()">开始查证</button>
        <div id="factResult"></div>
    `;
}

async function checkFact() {
    const content = document.getElementById('factContent').value;
    if (!content) return alert('请输入要查证的内容');

    const resultDiv = document.getElementById('factResult');
    resultDiv.innerHTML = '<div class="loading"><div class="spinner"></div>AI 分析中...</div>';

    try {
        const res = await fetch(`${API_BASE}/fact-check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        const data = await res.json();

        if (data.success) {
            const r = data.result;
            resultDiv.innerHTML = `
                <div class="result-section">
                    <div style="padding: 16px; background: ${r.verdict === '基本属实' ? '#e8f5e9' : '#ffebee'}; border-radius: 12px; margin-bottom: 16px;">
                        <div style="font-size: 28px; font-weight: bold; color: ${r.verdict === '基本属实' ? '#52c41a' : '#ff4d4f'};">${r.verdict}</div>
                        <div style="color: #666; margin-top: 8px;">可信度: ${(r.confidence * 100).toFixed(0)}%</div>
                    </div>
                    <div style="font-size: 14px; line-height: 1.6; color: #333; margin-bottom: 16px;">${r.explanation}</div>
                    <div class="result-title">参考来源</div>
                    ${r.sources.map(s => `
                        <div class="list-item">
                            <div class="list-icon pink">🔗</div>
                            <div class="list-content">
                                <div class="list-title">${s.name}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="result-section">查证失败</div>';
    }
}

// 任务管理
async function loadTasks() {
    try {
        const res = await fetch(`${API_BASE}/task/list`);
        const data = await res.json();
        
        const listDiv = document.getElementById('tasksList');
        if (data.tasks.length === 0) {
            listDiv.innerHTML = '<div class="loading">暂无任务</div>';
            return;
        }

        listDiv.innerHTML = `
            <div class="result-section">
                <div class="result-title">进行中的任务</div>
                ${data.tasks.map(t => `
                    <div class="list-item">
                        <div class="list-icon ${getTaskColor(t.type)}">${getTaskIcon(t.type)}</div>
                        <div class="list-content">
                            <div class="list-title">${t.name}</div>
                            <div class="list-meta">${t.status === 'running' ? '执行中' : t.status === 'completed' ? '已完成' : '等待中'}</div>
                            ${t.status === 'running' ? `
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${t.progress}%"></div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="list-action">${t.status === 'completed' ? '查看' : ''}</div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('加载任务失败:', error);
    }
}

function getTaskIcon(type) {
    const icons = { download: '⬇️', scrape: '🔍', analysis: '📊', subscribe: '📬' };
    return icons[type] || '📋';
}

function getTaskColor(type) {
    const colors = { download: 'blue', scrape: 'purple', analysis: 'red', subscribe: 'orange' };
    return colors[type] || 'gray';
}

// 页面切换
function switchPage(page) {
    currentPage = page;
    
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    // 显示目标页面
    if (page === 'home') {
        document.getElementById('homePage').classList.add('active');
        document.querySelectorAll('.nav-item')[0].classList.add('active');
        document.getElementById('fabBtn').style.display = 'flex';
    } else if (page === 'tasks') {
        document.getElementById('tasksPage').classList.add('active');
        document.querySelectorAll('.nav-item')[1].classList.add('active');
        document.getElementById('fabBtn').style.display = 'none';
        loadTasks();
    } else if (page === 'discover') {
        alert('发现功能开发中...');
        switchPage('home');
    } else if (page === 'profile') {
        alert('个人中心开发中...');
        switchPage('home');
    }
}

// 模态框控制
function closeModal() {
    document.getElementById('agentModal').classList.remove('active');
}

function showCreateTask() {
    alert('创建任务功能 - 请选择首页的 AI 助理');
}

function showNotifications() {
    alert('通知功能开发中...');
}

// 点击模态框外部关闭
document.getElementById('agentModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// 初始化
init();
