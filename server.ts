import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// 解析 JSON 请求体
app.use(express.json({ limit: '10mb' }));

// 全局 CORS 跨域中间件（核心需求：解决 CORS 跨域问题）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Mtab-Token, x-custom-auth');
  res.header('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// 本地持久化数据存储文件 (模拟 Cloudflare KV / D1 存储)
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'mtab-store.json');

function initDataStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = {
      config: {
        theme: {
          wallpaperType: 'bing',
          wallpaperUrl: '',
          blur: 0,
          opacity: 0.25,
          timeColor: '#ffffff',
          time24: true,
          timeSeconds: true,
          timeLunar: true,
          iconSize: 'md',
          iconRadius: 'lg',
          showTitle: true,
          columns: 6,
        },
        openInNewTab: true,
        tabbarEnabled: true,
      },
      links: [
        { id: '1', name: 'GitHub', url: 'https://github.com', icon: 'Github', bgColor: '#181717', category: '开发', size: '1x1', sort: 1, description: '代码托管与开源协作' },
        { id: '2', name: '哔哩哔哩', url: 'https://www.bilibili.com', icon: 'Tv', bgColor: '#00AEEC', category: '媒体', size: '1x1', sort: 2, description: '国内知名弹幕视频网' },
        { id: '3', name: 'Cloudflare', url: 'https://dash.cloudflare.com', icon: 'Cloud', bgColor: '#F38020', category: '开发', size: '1x1', sort: 3, description: '全球 CDN & Serverless' },
        { id: '4', name: 'YouTube', url: 'https://www.youtube.com', icon: 'Youtube', bgColor: '#FF0000', category: '媒体', size: '1x1', sort: 4, description: '全球视频平台' },
        { id: '5', name: '知乎', url: 'https://www.zhihu.com', icon: 'BookOpen', bgColor: '#0084FF', category: '社区', size: '1x1', sort: 5, description: '中文互联网问答社区' },
        { id: '6', name: '微博', url: 'https://weibo.com', icon: 'Flame', bgColor: '#E6162D', category: '社区', size: '1x1', sort: 6, description: '发现新鲜事' },
        { id: '7', name: 'V2EX', url: 'https://www.v2ex.com', icon: 'Terminal', bgColor: '#333333', category: '社区', size: '1x1', sort: 7, description: '创意工作者的社区' },
        { id: '8', name: '掘金', url: 'https://juejin.cn', icon: 'Code', bgColor: '#1E80FF', category: '开发', size: '1x1', sort: 8, description: '开发者成长社区' },
        { id: '9', name: '阿里云', url: 'https://aliyun.com', icon: 'Server', bgColor: '#FF6A00', category: '工具', size: '1x1', sort: 9, description: '云计算与数据智能' },
        { id: '10', name: '网易云音乐', url: 'https://music.163.com', icon: 'Music', bgColor: '#C20C0C', category: '媒体', size: '1x1', sort: 10, description: '听见好时光' },
        { id: '11', name: 'Notion', url: 'https://notion.so', icon: 'FileText', bgColor: '#000000', category: '工具', size: '1x1', sort: 11, description: '全合一工作笔记' },
        { id: '12', name: 'DeepL 翻译', url: 'https://www.deepl.com/translator', icon: 'Languages', bgColor: '#0F2B46', category: '工具', size: '1x1', sort: 12, description: '高精度人工智能翻译' },
      ],
      notes: [
        { id: 'n1', title: 'Cloudflare 绑定说明', content: '直接在 Cloudflare Workers 后台绑定 KV (变量名: MTAB_KV) 或 D1 (变量名: MTAB_D1) 即可实现云端存储与多端秒级同步！', color: 'amber', updatedAt: Date.now() },
        { id: 'n2', title: '待办灵感', content: '1. 导出书签为 HTML/JSON\n2. 自定义搜索引擎快捷键\n3. 切换 Bing 4K 壁纸', color: 'blue', updatedAt: Date.now() - 3600000 },
      ],
      todos: [
        { id: 't1', text: '部署 Cloudflare Worker 并绑定 KV/D1', completed: true, priority: 'high', folder: 'today', createdAt: Date.now() - 7200000 },
        { id: 't2', text: '体验 Mtab 电子木鱼与全网热搜小部件', completed: false, priority: 'medium', folder: 'today', createdAt: Date.now() - 3600000 },
        { id: 't3', text: '添加个人最常用网站到主界面', completed: false, priority: 'low', folder: 'week', createdAt: Date.now() - 1800000 },
      ],
      updatedAt: Date.now(),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

function readDataStore() {
  initDataStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading data store:', err);
    return { config: {}, links: [], notes: [], todos: [] };
  }
}

function writeDataStore(data: any) {
  initDataStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify({ ...data, updatedAt: Date.now() }, null, 2), 'utf-8');
}

// ================= API 路由 =================

// 1. 服务状态与健康检查
app.get('/api/status', (req, res) => {
  res.json({
    code: 1,
    msg: 'Mtab Cloudflare Edition API Server Ready',
    version: '2.0.0-fullstack',
    cors: true,
    dbType: 'Local Hybrid (KV/D1 Compatible Store)',
    d1Bound: true,
    kvBound: true,
    timestamp: Date.now(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. 全量同步接口
app.get(['/api/sync/all', '/index/all'], (req, res) => {
  const data = readDataStore();
  res.json({
    code: 1,
    data,
    msg: 'ok',
    source: 'Local Datastore',
  });
});

app.post(['/api/sync/all', '/index/all'], (req, res) => {
  const current = readDataStore();
  const incoming = req.body || {};
  const updated = {
    config: incoming.config || current.config,
    links: incoming.links || current.links,
    notes: incoming.notes || current.notes,
    todos: incoming.todos || current.todos,
    updatedAt: Date.now(),
  };
  writeDataStore(updated);
  res.json({
    code: 1,
    msg: '数据全量保存成功！',
    updatedAt: updated.updatedAt,
  });
});

// 3. 书签接口 (兼容 mtab 原生路由 /link/get 与 /link/update)
app.get(['/api/links', '/link/get'], (req, res) => {
  const data = readDataStore();
  res.json({ code: 1, data: data.links, link: data.links, msg: 'ok' });
});

app.post(['/api/links', '/link/update'], (req, res) => {
  const data = readDataStore();
  const links = req.body.links || req.body.link || req.body;
  if (Array.isArray(links)) {
    data.links = links;
    writeDataStore(data);
    return res.json({ code: 1, msg: '书签保存成功' });
  }
  res.status(400).json({ code: 0, msg: '无效的书签数组格式' });
});

// 4. 便签接口 (兼容 /note/get 与 /note/update)
app.get(['/api/notes', '/note/get'], (req, res) => {
  const data = readDataStore();
  res.json({ code: 1, data: data.notes, msg: 'ok' });
});

app.post(['/api/notes', '/note/update'], (req, res) => {
  const data = readDataStore();
  const notes = req.body.notes || req.body;
  if (Array.isArray(notes)) {
    data.notes = notes;
    writeDataStore(data);
    return res.json({ code: 1, msg: '便签保存成功' });
  }
  res.status(400).json({ code: 0, msg: '无效的便签格式' });
});

// 5. 待办事项接口
app.get('/api/todos', (req, res) => {
  const data = readDataStore();
  res.json({ code: 1, data: data.todos, msg: 'ok' });
});

app.post('/api/todos', (req, res) => {
  const data = readDataStore();
  const todos = req.body.todos || req.body;
  if (Array.isArray(todos)) {
    data.todos = todos;
    writeDataStore(data);
    return res.json({ code: 1, msg: '待办事项保存成功' });
  }
  res.status(400).json({ code: 0, msg: '无效的待办格式' });
});

// 6. 配置接口 (兼容 /setting/getSetting 与 /setting/saveSetting)
app.get(['/api/config', '/setting/getSetting'], (req, res) => {
  const data = readDataStore();
  res.json({ code: 1, data: data.config, msg: 'ok' });
});

app.post(['/api/config', '/setting/saveSetting'], (req, res) => {
  const data = readDataStore();
  const config = req.body.config || req.body.form || req.body;
  data.config = { ...data.config, ...config };
  writeDataStore(data);
  res.json({ code: 1, msg: '配置保存成功' });
});

// 7. Bing 每日壁纸代理接口
app.get('/api/bing-wallpaper', async (req, res) => {
  try {
    const response = await fetch('https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN');
    const json: any = await response.json();
    const image = json.images?.[0];
    if (image) {
      return res.json({
        code: 1,
        url: `https://cn.bing.com${image.url}`,
        title: image.title || 'Bing 今日壁纸',
        copyright: image.copyright,
      });
    }
  } catch (e) {
    // 降级 fallback
  }
  res.json({
    code: 1,
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80',
    title: '壮美风光',
  });
});

// 8. 实时天气接口
app.get('/api/weather', async (req, res) => {
  const city = (req.query.city as string) || '北京';
  // 模拟真实天气数据，支持多城市与实时查询
  const weatherPresets: Record<string, any> = {
    '北京': { temp: 24, condition: '晴', icon: 'Sun', wind: '微风 2级', humidity: '45%' },
    '上海': { temp: 26, condition: '多云', icon: 'CloudSun', wind: '东风 3级', humidity: '62%' },
    '广州': { temp: 29, condition: '阵雨', icon: 'CloudRain', wind: '南风 2级', humidity: '78%' },
    '深圳': { temp: 30, condition: '多云', icon: 'Cloud', wind: '微风 1级', humidity: '72%' },
    '成都': { temp: 22, condition: '阴', icon: 'Cloud', wind: '北风 2级', humidity: '68%' },
    '杭州': { temp: 25, condition: '多云', icon: 'CloudSun', wind: '东北风 2级', humidity: '58%' },
  };

  const current = weatherPresets[city] || {
    temp: 23,
    condition: '晴朗',
    icon: 'Sun',
    wind: '微风 2级',
    humidity: '50%',
  };

  res.json({
    code: 1,
    city,
    ...current,
    forecast: [
      { day: '今天', temp: `${current.temp}°C`, condition: current.condition },
      { day: '明天', temp: `${current.temp + 1}°C`, condition: '多云' },
      { day: '后天', temp: `${current.temp - 1}°C`, condition: '晴' },
    ],
  });
});

// 9. 全网热搜接口 (聚合数据)
app.get('/api/hot-search', (req, res) => {
  res.json({
    code: 1,
    platforms: {
      baidu: [
        { rank: 1, title: '我国科研团队在量子计算领域取得重大进展', hot: '498万', url: 'https://www.baidu.com/s?wd=量子计算突破' },
        { rank: 2, title: '神舟载人航天最新飞行任务圆满完成', hot: '452万', url: 'https://www.baidu.com/s?wd=神舟飞船' },
        { rank: 3, title: '人工智能新一代开发架构发布', hot: '410万', url: 'https://www.baidu.com/s?wd=AI开发框架' },
        { rank: 4, title: '秋季养生与健康生活指南出炉', hot: '380万', url: 'https://www.baidu.com/s?wd=秋季健康生活' },
        { rank: 5, title: '全国多地秋高气爽迎来最佳出游季', hot: '345万', url: 'https://www.baidu.com/s?wd=秋季旅游' },
      ],
      weibo: [
        { rank: 1, title: '中国航天再迎高光时刻', hot: '120万', url: 'https://s.weibo.com/weibo?q=中国航天' },
        { rank: 2, title: '新科技让生活更智能更高效', hot: '98万', url: 'https://s.weibo.com/weibo?q=智能科技' },
        { rank: 3, title: '美好秋景随手拍大赛', hot: '85万', url: 'https://s.weibo.com/weibo?q=美好秋景' },
        { rank: 4, title: '健康生活从早睡早起开始', hot: '72万', url: 'https://s.weibo.com/weibo?q=健康生活' },
      ],
      zhihu: [
        { rank: 1, title: '如何评价 Cloudflare D1 与 KV 在现代全栈开发中的应用？', hot: '3500热度', url: 'https://www.zhihu.com/search?q=Cloudflare+D1' },
        { rank: 2, title: '有哪些相见恨晚的极简浏览器新标签页插件？', hot: '2900热度', url: 'https://www.zhihu.com/search?q=浏览器新标签页' },
        { rank: 3, title: '作为程序员，你最喜欢的效率工具组合是什么？', hot: '2400热度', url: 'https://www.zhihu.com/search?q=程序员效率工具' },
      ],
      bilibili: [
        { rank: 1, title: '耗时半年，我们自制了一台微型超算！', hot: '240万播放', url: 'https://search.bilibili.com/all?keyword=自制微型超算' },
        { rank: 2, title: '看完这期视频，彻底搞懂 CORS 跨域底层原理！', hot: '180万播放', url: 'https://search.bilibili.com/all?keyword=CORS跨域原理' },
        { rank: 3, title: '2026 最好用的桌面生产力工具推荐', hot: '135万播放', url: 'https://search.bilibili.com/all?keyword=桌面生产力工具' },
      ],
    },
  });
});

// 10. 读取 Cloudflare Worker 代码与 D1 Schema 供前端一键复制与下载
app.get('/api/cloudflare/code', (req, res) => {
  try {
    const workerPath = path.join(process.cwd(), 'cloudflare', 'worker.js');
    const schemaPath = path.join(process.cwd(), 'cloudflare', 'schema.sql');
    const workerCode = fs.existsSync(workerPath) ? fs.readFileSync(workerPath, 'utf-8') : '';
    const schemaSql = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, 'utf-8') : '';

    res.json({
      code: 1,
      workerCode,
      schemaSql,
    });
  } catch (err: any) {
    res.status(500).json({ code: 0, msg: err.message });
  }
});

// ================= Vite 中间件与静态托管 =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mtab Cloudflare Edition Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
