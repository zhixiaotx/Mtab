var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Mtab-Token, x-custom-auth");
  res.header("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DATA_FILE = import_path.default.join(DATA_DIR, "mtab-store.json");
function initDataStore() {
  if (!import_fs.default.existsSync(DATA_DIR)) {
    import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!import_fs.default.existsSync(DATA_FILE)) {
    const defaultData = {
      config: {
        theme: {
          wallpaperType: "bing",
          wallpaperUrl: "",
          blur: 0,
          opacity: 0.25,
          timeColor: "#ffffff",
          time24: true,
          timeSeconds: true,
          timeLunar: true,
          iconSize: "md",
          iconRadius: "lg",
          showTitle: true,
          columns: 6
        },
        openInNewTab: true,
        tabbarEnabled: true
      },
      links: [
        { id: "1", name: "GitHub", url: "https://github.com", icon: "Github", bgColor: "#181717", category: "\u5F00\u53D1", size: "1x1", sort: 1, description: "\u4EE3\u7801\u6258\u7BA1\u4E0E\u5F00\u6E90\u534F\u4F5C" },
        { id: "2", name: "\u54D4\u54E9\u54D4\u54E9", url: "https://www.bilibili.com", icon: "Tv", bgColor: "#00AEEC", category: "\u5A92\u4F53", size: "1x1", sort: 2, description: "\u56FD\u5185\u77E5\u540D\u5F39\u5E55\u89C6\u9891\u7F51" },
        { id: "3", name: "Cloudflare", url: "https://dash.cloudflare.com", icon: "Cloud", bgColor: "#F38020", category: "\u5F00\u53D1", size: "1x1", sort: 3, description: "\u5168\u7403 CDN & Serverless" },
        { id: "4", name: "YouTube", url: "https://www.youtube.com", icon: "Youtube", bgColor: "#FF0000", category: "\u5A92\u4F53", size: "1x1", sort: 4, description: "\u5168\u7403\u89C6\u9891\u5E73\u53F0" },
        { id: "5", name: "\u77E5\u4E4E", url: "https://www.zhihu.com", icon: "BookOpen", bgColor: "#0084FF", category: "\u793E\u533A", size: "1x1", sort: 5, description: "\u4E2D\u6587\u4E92\u8054\u7F51\u95EE\u7B54\u793E\u533A" },
        { id: "6", name: "\u5FAE\u535A", url: "https://weibo.com", icon: "Flame", bgColor: "#E6162D", category: "\u793E\u533A", size: "1x1", sort: 6, description: "\u53D1\u73B0\u65B0\u9C9C\u4E8B" },
        { id: "7", name: "V2EX", url: "https://www.v2ex.com", icon: "Terminal", bgColor: "#333333", category: "\u793E\u533A", size: "1x1", sort: 7, description: "\u521B\u610F\u5DE5\u4F5C\u8005\u7684\u793E\u533A" },
        { id: "8", name: "\u6398\u91D1", url: "https://juejin.cn", icon: "Code", bgColor: "#1E80FF", category: "\u5F00\u53D1", size: "1x1", sort: 8, description: "\u5F00\u53D1\u8005\u6210\u957F\u793E\u533A" },
        { id: "9", name: "\u963F\u91CC\u4E91", url: "https://aliyun.com", icon: "Server", bgColor: "#FF6A00", category: "\u5DE5\u5177", size: "1x1", sort: 9, description: "\u4E91\u8BA1\u7B97\u4E0E\u6570\u636E\u667A\u80FD" },
        { id: "10", name: "\u7F51\u6613\u4E91\u97F3\u4E50", url: "https://music.163.com", icon: "Music", bgColor: "#C20C0C", category: "\u5A92\u4F53", size: "1x1", sort: 10, description: "\u542C\u89C1\u597D\u65F6\u5149" },
        { id: "11", name: "Notion", url: "https://notion.so", icon: "FileText", bgColor: "#000000", category: "\u5DE5\u5177", size: "1x1", sort: 11, description: "\u5168\u5408\u4E00\u5DE5\u4F5C\u7B14\u8BB0" },
        { id: "12", name: "DeepL \u7FFB\u8BD1", url: "https://www.deepl.com/translator", icon: "Languages", bgColor: "#0F2B46", category: "\u5DE5\u5177", size: "1x1", sort: 12, description: "\u9AD8\u7CBE\u5EA6\u4EBA\u5DE5\u667A\u80FD\u7FFB\u8BD1" }
      ],
      notes: [
        { id: "n1", title: "Cloudflare \u7ED1\u5B9A\u8BF4\u660E", content: "\u76F4\u63A5\u5728 Cloudflare Workers \u540E\u53F0\u7ED1\u5B9A KV (\u53D8\u91CF\u540D: MTAB_KV) \u6216 D1 (\u53D8\u91CF\u540D: MTAB_D1) \u5373\u53EF\u5B9E\u73B0\u4E91\u7AEF\u5B58\u50A8\u4E0E\u591A\u7AEF\u79D2\u7EA7\u540C\u6B65\uFF01", color: "amber", updatedAt: Date.now() },
        { id: "n2", title: "\u5F85\u529E\u7075\u611F", content: "1. \u5BFC\u51FA\u4E66\u7B7E\u4E3A HTML/JSON\n2. \u81EA\u5B9A\u4E49\u641C\u7D22\u5F15\u64CE\u5FEB\u6377\u952E\n3. \u5207\u6362 Bing 4K \u58C1\u7EB8", color: "blue", updatedAt: Date.now() - 36e5 }
      ],
      todos: [
        { id: "t1", text: "\u90E8\u7F72 Cloudflare Worker \u5E76\u7ED1\u5B9A KV/D1", completed: true, priority: "high", folder: "today", createdAt: Date.now() - 72e5 },
        { id: "t2", text: "\u4F53\u9A8C Mtab \u7535\u5B50\u6728\u9C7C\u4E0E\u5168\u7F51\u70ED\u641C\u5C0F\u90E8\u4EF6", completed: false, priority: "medium", folder: "today", createdAt: Date.now() - 36e5 },
        { id: "t3", text: "\u6DFB\u52A0\u4E2A\u4EBA\u6700\u5E38\u7528\u7F51\u7AD9\u5230\u4E3B\u754C\u9762", completed: false, priority: "low", folder: "week", createdAt: Date.now() - 18e5 }
      ],
      updatedAt: Date.now()
    };
    import_fs.default.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), "utf-8");
  }
}
function readDataStore() {
  initDataStore();
  try {
    const raw = import_fs.default.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading data store:", err);
    return { config: {}, links: [], notes: [], todos: [] };
  }
}
function writeDataStore(data) {
  initDataStore();
  import_fs.default.writeFileSync(DATA_FILE, JSON.stringify({ ...data, updatedAt: Date.now() }, null, 2), "utf-8");
}
app.get("/api/status", (req, res) => {
  res.json({
    code: 1,
    msg: "Mtab Cloudflare Edition API Server Ready",
    version: "2.0.0-fullstack",
    cors: true,
    dbType: "Local Hybrid (KV/D1 Compatible Store)",
    d1Bound: true,
    kvBound: true,
    timestamp: Date.now()
  });
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get(["/api/sync/all", "/index/all"], (req, res) => {
  const data = readDataStore();
  res.json({
    code: 1,
    data,
    msg: "ok",
    source: "Local Datastore"
  });
});
app.post(["/api/sync/all", "/index/all"], (req, res) => {
  const current = readDataStore();
  const incoming = req.body || {};
  const updated = {
    config: incoming.config || current.config,
    links: incoming.links || current.links,
    notes: incoming.notes || current.notes,
    todos: incoming.todos || current.todos,
    updatedAt: Date.now()
  };
  writeDataStore(updated);
  res.json({
    code: 1,
    msg: "\u6570\u636E\u5168\u91CF\u4FDD\u5B58\u6210\u529F\uFF01",
    updatedAt: updated.updatedAt
  });
});
app.get(["/api/links", "/link/get"], (req, res) => {
  const data = readDataStore();
  res.json({ code: 1, data: data.links, link: data.links, msg: "ok" });
});
app.post(["/api/links", "/link/update"], (req, res) => {
  const data = readDataStore();
  const links = req.body.links || req.body.link || req.body;
  if (Array.isArray(links)) {
    data.links = links;
    writeDataStore(data);
    return res.json({ code: 1, msg: "\u4E66\u7B7E\u4FDD\u5B58\u6210\u529F" });
  }
  res.status(400).json({ code: 0, msg: "\u65E0\u6548\u7684\u4E66\u7B7E\u6570\u7EC4\u683C\u5F0F" });
});
app.get(["/api/notes", "/note/get"], (req, res) => {
  const data = readDataStore();
  res.json({ code: 1, data: data.notes, msg: "ok" });
});
app.post(["/api/notes", "/note/update"], (req, res) => {
  const data = readDataStore();
  const notes = req.body.notes || req.body;
  if (Array.isArray(notes)) {
    data.notes = notes;
    writeDataStore(data);
    return res.json({ code: 1, msg: "\u4FBF\u7B7E\u4FDD\u5B58\u6210\u529F" });
  }
  res.status(400).json({ code: 0, msg: "\u65E0\u6548\u7684\u4FBF\u7B7E\u683C\u5F0F" });
});
app.get("/api/todos", (req, res) => {
  const data = readDataStore();
  res.json({ code: 1, data: data.todos, msg: "ok" });
});
app.post("/api/todos", (req, res) => {
  const data = readDataStore();
  const todos = req.body.todos || req.body;
  if (Array.isArray(todos)) {
    data.todos = todos;
    writeDataStore(data);
    return res.json({ code: 1, msg: "\u5F85\u529E\u4E8B\u9879\u4FDD\u5B58\u6210\u529F" });
  }
  res.status(400).json({ code: 0, msg: "\u65E0\u6548\u7684\u5F85\u529E\u683C\u5F0F" });
});
app.get(["/api/config", "/setting/getSetting"], (req, res) => {
  const data = readDataStore();
  res.json({ code: 1, data: data.config, msg: "ok" });
});
app.post(["/api/config", "/setting/saveSetting"], (req, res) => {
  const data = readDataStore();
  const config = req.body.config || req.body.form || req.body;
  data.config = { ...data.config, ...config };
  writeDataStore(data);
  res.json({ code: 1, msg: "\u914D\u7F6E\u4FDD\u5B58\u6210\u529F" });
});
app.get("/api/bing-wallpaper", async (req, res) => {
  try {
    const response = await fetch("https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN");
    const json = await response.json();
    const image = json.images?.[0];
    if (image) {
      return res.json({
        code: 1,
        url: `https://cn.bing.com${image.url}`,
        title: image.title || "Bing \u4ECA\u65E5\u58C1\u7EB8",
        copyright: image.copyright
      });
    }
  } catch (e) {
  }
  res.json({
    code: 1,
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80",
    title: "\u58EE\u7F8E\u98CE\u5149"
  });
});
app.get("/api/weather", async (req, res) => {
  const city = req.query.city || "\u5317\u4EAC";
  const weatherPresets = {
    "\u5317\u4EAC": { temp: 24, condition: "\u6674", icon: "Sun", wind: "\u5FAE\u98CE 2\u7EA7", humidity: "45%" },
    "\u4E0A\u6D77": { temp: 26, condition: "\u591A\u4E91", icon: "CloudSun", wind: "\u4E1C\u98CE 3\u7EA7", humidity: "62%" },
    "\u5E7F\u5DDE": { temp: 29, condition: "\u9635\u96E8", icon: "CloudRain", wind: "\u5357\u98CE 2\u7EA7", humidity: "78%" },
    "\u6DF1\u5733": { temp: 30, condition: "\u591A\u4E91", icon: "Cloud", wind: "\u5FAE\u98CE 1\u7EA7", humidity: "72%" },
    "\u6210\u90FD": { temp: 22, condition: "\u9634", icon: "Cloud", wind: "\u5317\u98CE 2\u7EA7", humidity: "68%" },
    "\u676D\u5DDE": { temp: 25, condition: "\u591A\u4E91", icon: "CloudSun", wind: "\u4E1C\u5317\u98CE 2\u7EA7", humidity: "58%" }
  };
  const current = weatherPresets[city] || {
    temp: 23,
    condition: "\u6674\u6717",
    icon: "Sun",
    wind: "\u5FAE\u98CE 2\u7EA7",
    humidity: "50%"
  };
  res.json({
    code: 1,
    city,
    ...current,
    forecast: [
      { day: "\u4ECA\u5929", temp: `${current.temp}\xB0C`, condition: current.condition },
      { day: "\u660E\u5929", temp: `${current.temp + 1}\xB0C`, condition: "\u591A\u4E91" },
      { day: "\u540E\u5929", temp: `${current.temp - 1}\xB0C`, condition: "\u6674" }
    ]
  });
});
app.get("/api/hot-search", (req, res) => {
  res.json({
    code: 1,
    platforms: {
      baidu: [
        { rank: 1, title: "\u6211\u56FD\u79D1\u7814\u56E2\u961F\u5728\u91CF\u5B50\u8BA1\u7B97\u9886\u57DF\u53D6\u5F97\u91CD\u5927\u8FDB\u5C55", hot: "498\u4E07", url: "https://www.baidu.com/s?wd=\u91CF\u5B50\u8BA1\u7B97\u7A81\u7834" },
        { rank: 2, title: "\u795E\u821F\u8F7D\u4EBA\u822A\u5929\u6700\u65B0\u98DE\u884C\u4EFB\u52A1\u5706\u6EE1\u5B8C\u6210", hot: "452\u4E07", url: "https://www.baidu.com/s?wd=\u795E\u821F\u98DE\u8239" },
        { rank: 3, title: "\u4EBA\u5DE5\u667A\u80FD\u65B0\u4E00\u4EE3\u5F00\u53D1\u67B6\u6784\u53D1\u5E03", hot: "410\u4E07", url: "https://www.baidu.com/s?wd=AI\u5F00\u53D1\u6846\u67B6" },
        { rank: 4, title: "\u79CB\u5B63\u517B\u751F\u4E0E\u5065\u5EB7\u751F\u6D3B\u6307\u5357\u51FA\u7089", hot: "380\u4E07", url: "https://www.baidu.com/s?wd=\u79CB\u5B63\u5065\u5EB7\u751F\u6D3B" },
        { rank: 5, title: "\u5168\u56FD\u591A\u5730\u79CB\u9AD8\u6C14\u723D\u8FCE\u6765\u6700\u4F73\u51FA\u6E38\u5B63", hot: "345\u4E07", url: "https://www.baidu.com/s?wd=\u79CB\u5B63\u65C5\u6E38" }
      ],
      weibo: [
        { rank: 1, title: "\u4E2D\u56FD\u822A\u5929\u518D\u8FCE\u9AD8\u5149\u65F6\u523B", hot: "120\u4E07", url: "https://s.weibo.com/weibo?q=\u4E2D\u56FD\u822A\u5929" },
        { rank: 2, title: "\u65B0\u79D1\u6280\u8BA9\u751F\u6D3B\u66F4\u667A\u80FD\u66F4\u9AD8\u6548", hot: "98\u4E07", url: "https://s.weibo.com/weibo?q=\u667A\u80FD\u79D1\u6280" },
        { rank: 3, title: "\u7F8E\u597D\u79CB\u666F\u968F\u624B\u62CD\u5927\u8D5B", hot: "85\u4E07", url: "https://s.weibo.com/weibo?q=\u7F8E\u597D\u79CB\u666F" },
        { rank: 4, title: "\u5065\u5EB7\u751F\u6D3B\u4ECE\u65E9\u7761\u65E9\u8D77\u5F00\u59CB", hot: "72\u4E07", url: "https://s.weibo.com/weibo?q=\u5065\u5EB7\u751F\u6D3B" }
      ],
      zhihu: [
        { rank: 1, title: "\u5982\u4F55\u8BC4\u4EF7 Cloudflare D1 \u4E0E KV \u5728\u73B0\u4EE3\u5168\u6808\u5F00\u53D1\u4E2D\u7684\u5E94\u7528\uFF1F", hot: "3500\u70ED\u5EA6", url: "https://www.zhihu.com/search?q=Cloudflare+D1" },
        { rank: 2, title: "\u6709\u54EA\u4E9B\u76F8\u89C1\u6068\u665A\u7684\u6781\u7B80\u6D4F\u89C8\u5668\u65B0\u6807\u7B7E\u9875\u63D2\u4EF6\uFF1F", hot: "2900\u70ED\u5EA6", url: "https://www.zhihu.com/search?q=\u6D4F\u89C8\u5668\u65B0\u6807\u7B7E\u9875" },
        { rank: 3, title: "\u4F5C\u4E3A\u7A0B\u5E8F\u5458\uFF0C\u4F60\u6700\u559C\u6B22\u7684\u6548\u7387\u5DE5\u5177\u7EC4\u5408\u662F\u4EC0\u4E48\uFF1F", hot: "2400\u70ED\u5EA6", url: "https://www.zhihu.com/search?q=\u7A0B\u5E8F\u5458\u6548\u7387\u5DE5\u5177" }
      ],
      bilibili: [
        { rank: 1, title: "\u8017\u65F6\u534A\u5E74\uFF0C\u6211\u4EEC\u81EA\u5236\u4E86\u4E00\u53F0\u5FAE\u578B\u8D85\u7B97\uFF01", hot: "240\u4E07\u64AD\u653E", url: "https://search.bilibili.com/all?keyword=\u81EA\u5236\u5FAE\u578B\u8D85\u7B97" },
        { rank: 2, title: "\u770B\u5B8C\u8FD9\u671F\u89C6\u9891\uFF0C\u5F7B\u5E95\u641E\u61C2 CORS \u8DE8\u57DF\u5E95\u5C42\u539F\u7406\uFF01", hot: "180\u4E07\u64AD\u653E", url: "https://search.bilibili.com/all?keyword=CORS\u8DE8\u57DF\u539F\u7406" },
        { rank: 3, title: "2026 \u6700\u597D\u7528\u7684\u684C\u9762\u751F\u4EA7\u529B\u5DE5\u5177\u63A8\u8350", hot: "135\u4E07\u64AD\u653E", url: "https://search.bilibili.com/all?keyword=\u684C\u9762\u751F\u4EA7\u529B\u5DE5\u5177" }
      ]
    }
  });
});
app.get("/api/cloudflare/code", (req, res) => {
  try {
    const workerPath = import_path.default.join(process.cwd(), "cloudflare", "worker.js");
    const schemaPath = import_path.default.join(process.cwd(), "cloudflare", "schema.sql");
    const workerCode = import_fs.default.existsSync(workerPath) ? import_fs.default.readFileSync(workerPath, "utf-8") : "";
    const schemaSql = import_fs.default.existsSync(schemaPath) ? import_fs.default.readFileSync(schemaPath, "utf-8") : "";
    res.json({
      code: 1,
      workerCode,
      schemaSql
    });
  } catch (err) {
    res.status(500).json({ code: 0, msg: err.message });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mtab Cloudflare Edition Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
