# Mtab (Cloudflare 增强版) — 现代化极速个性化起始页导航

> 🌟 **基于开源项目 [tsxcw/mtab](https://github.com/tsxcw/mtab) 深度二次开发与现代前端工程化重构**  
> 默认采用**清爽通透的白昼模式（100% 呈现壁纸与网页天然纯净色彩，不泛白不暗沉）**，全站深度融入**高定毛玻璃 (Glassmorphism) 亚克力视觉美学**，并在外观设置中提供了**全站毛玻璃模糊度与通透度实时调节功能**；右下角悬浮按钮与常用控件统一升级为**纯净圆形毛玻璃按键**；所有弹窗模态窗口规范化统一**尺寸、圆角、层级头部、胶囊标签栏与底部操作栏**；底部升级为极简灵动的**圆角矩形胶囊 Dock 栏（图标纯净无背景方块填充）**；网址卡片同样去除矩形色块包裹，呈现纯正品牌原标；支持 **多级分类递归渲染 (NavSection)**、**HTML/JSON 书签智能解析与增量合并/完全覆盖**、**27+ 多引擎圆角胶囊搜索栏**，并深度整合 **Cloudflare Workers (KV / D1)** 彻底解除 CORS 跨域限制，配备 GitHub Actions 自动化编译推送 `gh-pages` 分支、Cloudflare Pages、Vercel、Netlify 及全终端移动端自适应。

---

## 📑 目录

- [✨ 项目核心亮点与功能特性](#-项目核心亮点与功能特性)
- [📁 深入全景：项目所有文件功能与作用详解（小白必读）](#-深入全景项目所有文件功能与作用详解小白必读)
  - [1. 根目录基础设施与配置文件](#1-根目录基础设施与配置文件)
  - [2. `src/components/` 核心 UI 组件库](#2-srccomponents-核心-ui-组件库)
  - [3. `src/utils/` 与 `src/data/` 核心工具与初始数据](#3-srcutils-与-srcdata-核心工具与初始数据)
  - [4. `cloudflare/` 数据库与后端云函数](#4-cloudflare-数据库与后端云函数)
  - [5. `.github/workflows/` 自动化工作流](#5-githubworkflows-自动化工作流)
- [🎨 视觉规范与统一毛玻璃模态体系](#-视觉规范与统一毛玻璃模态体系)
- [🚀 全平台部署与上线保姆级实操教程](#-全平台部署与上线保姆级实操教程)
  - [1. GitHub Pages 自动部署（工作流编译相对路径，先打包推送 gh-pages 分支后发布）](#1-github-pages-自动部署工作流编译相对路径先打包推送-gh-pages-分支后发布)
  - [2. Cloudflare 部署（免费托管 Pages + 后端 Worker + KV/D1 数据库）](#2-cloudflare-部署免费托管-pages--后端-worker--kvd1-数据库)
  - [3. Vercel 极速部署](#3-vercel-极速部署)
  - [4. Netlify 一键部署](#4-netlify-一键部署)
  - [5. 私有 VPS / Nginx / 本地开发部署](#5-私有-vps--nginx--本地开发部署)
- [📱 移动端与不同设备（手机/折叠屏/平板/超宽屏）深度适配指南](#-移动端与不同设备手机折叠屏平板超宽屏深度适配指南)
- [💡 避坑实战：开发与部署中遇见的 12 大关键坑与解决方案](#-避坑实战开发与部署中遇见的-12-大关键坑与解决方案)
- [🛠️ 开发者进阶：本地二次开发与贡献指南](#️-开发者进阶本地二次开发与贡献指南)
- [📄 开源协议与鸣谢](#-开源协议与鸣谢)

---

## ✨ 项目核心亮点与功能特性

1. **默认白昼模式 & 壁纸零失真还原**：
   - 网页默认启动为白昼清爽模式；
   - **绝不改变壁纸天然色彩与网页原始亮度**：彻底移除白昼模式下覆盖的白化蒙版，壁纸呈现 100% 原始高清质感，不暗沉、不泛白发灰。
2. **整站统一圆形按钮与动态毛玻璃体系**：
   - 右下角主题切换（太阳/月亮）与一键平滑置顶按钮统一升级为**纯净圆形毛玻璃按键**（`rounded-full`），去除生硬边框与多余方角；
   - **外观设置面板支持实时调节整站毛玻璃样式**：滑块支持调节模糊强度（0px ~ 32px）与表面通透度（10% ~ 95%），并提供「清透灵动」、「经典毛玻璃」、「深度雾感」、「超清无模糊」四套一键预设。
3. **所有模态窗口（Modal）统一规范**：
   - 添加网址、外观个性化、Cloudflare 同步、数据管理中心等所有弹窗统一为 `max-w-2xl` 黄金阅读宽度与 `max-h-[88vh]` 安全高度；
   - 统一顶栏图标标识、关闭按键、胶囊子导航标签、可滚动主体区域以及底部固定完成操作栏。
4. **圆角矩形胶囊 Dock 栏 & 纯净无方框填充 Logo**：
   - 底部 Dock 栏重构为标准圆角矩形胶囊形态（Capsule Bar），悬浮感更强、触控更加灵敏；
   - 移除 Dock 栏按钮与书签卡片中生硬的实心矩形背景方块（No rectangular fill），让品牌高清图标与 Favicon 自由呼吸，通透轻盈。
5. **智能数据管理中心（HTML / JSON 导入与导出）**：
   - 支持直接上传 Chrome、Edge、Firefox 导出的标准 `bookmarks.html` 文件或 Mtab 备份的 `.json` 配置文件；
   - 提供直观 UI 选项：**增量合并**（智能比对 URL 去重并保留原有分类）或 **完全覆盖**；
   - 导入时自动嗅探提取书签描述（优先提取 `<A title>`、`<A comment>` 及紧随的 `<DD>` 说明文字），卡片副标题优先展现个性化描述；
   - **自动获取高清网站 Favicon**：导入没有图标或默认 Globe 占位符的书签时，系统自动通过国际域名节点探测高清图标，免去手动配置烦恼。
6. **多级分类递归小节 (NavSection)**：
   - 支持多级递归小节与平铺网格双视图自由切换；
   - 小节视图下展示清晰的面包屑层级导航、展开折叠与子目录缩进，分类标题简洁典雅。
7. **27+ 搜索引擎圆角矩形胶囊搜索栏**：
   - 预置通用搜索、开发者、AI专属（ChatGPT / Claude / Perplexity / Gemini）、学术、社区等多维度搜索引擎；
   - 内置「本站检索」模式，输入关键词实时从本地海量书签中秒级模糊高亮检索。
8. **零服务器 Cloudflare 架构 & 解除 CORS 跨域**：
   - 支持通过 Cloudflare 网页端一键绑定 KV 或 D1 关系型数据库；
   - 后端 Worker 内置 HTTP OPTIONS 204 预检拦截与全通配 CORS 响应头，免备案、免买服务器、全跨域无缝同步。
9. **数据安全防线：自动备份到本地 (Auto Backup)**：
   - 在设置与数据管理中心提供「自动备份到本地」选项；
   - 开启后，每当书签（新增/编辑/排序/删除）或便签发生变更时，系统自动将完整 JSON 数据打包序列化并下载到用户本地下载目录，杜绝误操作或浏览器缓存清理造成的数据丢失。
10. **高性能拖拽手动排序与实时存储**：
    - 集成轻量现代化 React 拖拽引擎 `@dnd-kit`，无论在平铺网格视图还是多级小节视图中，均支持直观顺畅的拖拽排序；
    - 移动阈值优化（6px 激活防误触、移动端长按支持），保留流畅点击打开与快捷操作；
    - 排序变动即刻实时写入 `localStorage`，刷新不丢失，保持最佳个性化布局。

---

## 📁 深入全景：项目所有文件功能与作用详解（小白必读）

为了让任何零基础新手、前端学习者与二次开发者能够清晰理解代码架构，下面将项目中**每一个文件与文件夹**的作用、内部运行逻辑与修改指引进行详尽拆解：

```text
├── .github/
│   └── workflows/
│       └── deploy.yml              # [GitHub Actions] 自动化 CI/CD：编译项目并自动推送发布至 gh-pages 分支
├── cloudflare/
│   ├── schema.sql                  # [D1数据库] SQLite 数据表结构、主键索引与快速初始化建表脚本
│   └── worker.js                   # [云函数后端] Cloudflare Worker 代码，解决跨域拦截，统一适配 KV 与 D1 读写
├── public/                         # [静态资产目录] 存放公共图标、字体、媒体素材
├── src/
│   ├── components/                 # [React UI 核心组件库]
│   │   ├── AddBookmarkModal.tsx    # 添加/编辑书签弹窗：输入网址即时自动拉取网站高清 Favicon 与标题推荐
│   │   ├── BookmarkGrid.tsx        # 网址导航主展示区：支持多级分类筛选、双视图切换、拖拽排序容器与 DndContext
│   │   ├── CloudflareModal.tsx     # Cloudflare 配置弹窗：填入 Worker 地址与 Token，探测连通性并推拉数据
│   │   ├── DataManagementModal.tsx # 数据中心：上传 HTML/JSON、增量/覆盖模式单选、多级树预览与双格式导出
│   │   ├── DockBar.tsx             # 底部圆角矩形胶囊 Dock 工具栏：无背景填充原标、平滑微动效触控
│   │   ├── HeaderClock.tsx         # 顶部时间中枢：全屏控制、实时时钟、农历节气、数字翻页样式
│   │   ├── IconRenderer.tsx        # 高清多源图标渲染引擎：Lucide SVG / 外链图片 / Favicon.im / Google S2 多级探测
│   │   ├── NavSection.tsx          # 递归小节组件：层级面包屑路径、目录折叠、子分类层级缩进与直属书签渲染
│   │   ├── SearchBar.tsx           # 胶囊搜索栏：27+ 引擎切换、本地书签即时检索、搜索历史记录
│   │   ├── SortableBookmarkCard.tsx# 可拖拽排序书签卡片：品牌原标居左、标题描述居右、快捷操作与拖拽浮层
│   │   ├── WallpaperModal.tsx      # 外观个性化中心：整站毛玻璃调节、高清壁纸库(Bing/Unsplash/自定义)、时钟排版
│   │   └── WidgetsDrawer.tsx       # 右侧小工具抽屉：便签记事本、待办清单 (Todo)、解压电子木鱼、实时热搜榜
│   ├── data/
│   │   └── defaultData.ts          # 初始内置数据集：默认白昼配置、精选初始书签、壁纸图库与 27+ 搜索引擎规则
│   ├── utils/
│   │   ├── api.ts                  # 网络请求工具：封装与 Cloudflare Worker 鉴权通信、错误重试与数据格式化
│   │   ├── bookmarkParser.ts       # 书签解析核心：使用浏览器原生 DOMParser 提取多层级 HTML 树、JSON 合并与导出
│   │   ├── favicon.ts              # 网站高清图标解析服务：Favicon.im / Google S2 / DuckDuckGo 多 CDN 兜底与域名提取
│   │   └── lunar.ts                # 农历与干支算法：计算传统生肖年、天干地支、农历月日与节令
│   ├── App.tsx                     # 根应用调度中心：核心状态机、壁纸渲染、主题模式切换、全站 CSS 变量注入
│   ├── index.css                   # 全局样式文件：引入 Tailwind CSS、定义滚动条隐藏与 .site-glass 动态毛玻璃
│   ├── main.tsx                    # React 挂载入口文件：调用 ReactDOM.createRoot 启动虚拟 DOM
│   └── types.ts                    # TypeScript 类型定义：BookmarkItem、CategoryNode、MtabConfig 等规范
├── .env.example                    # 环境变量声明示例文件
├── .gitignore                      # Git 版本控制忽略规则（排除 node_modules、dist、临时文件等）
├── index.html                      # 单页入口 HTML：移动端 Viewport 视口设置、防盗链策略与 SEO 标题
├── metadata.json                   # 应用平台元数据与特性描述
├── package.json                    # 项目依赖管理与脚本指令 (dev, build, lint, preview)
├── tsconfig.json                   # TypeScript 严格模式与编译规则
└── vite.config.ts                  # Vite 构建配置：显式设置 base: './' 相对路径，确保在子目录无缝运行
```

---

### 1. 根目录基础设施与配置文件

#### `vite.config.ts` (构建核心配置文件)
- **作用**：控制 Vite 的编译打包流程与开发服务器行为。
- **关键配置项**：
  - `base: './'`：**核心生命线**。配置为相对路径后，编译生成的所有 HTML 引用资源（如 `<script src="./assets/index.js">`）均采用相对引用。无论项目部署在根域名 `example.com/`，还是 GitHub Pages 二级子目录 `username.github.io/my-tab/`，均可顺畅加载，彻底根治 404 资源丢失白屏问题。
  - `plugins: [react(), tailwindcss(), ...]`：集成 React 18 快速刷新引擎与 Tailwind CSS 编译插件。
  - `resolve.alias: { '@': path.resolve(__dirname, '.') }`：提供 `@/` 路径别名支持。

#### `package.json` (项目包清单与指令)
- **作用**：声明前端核心依赖库（React 18、Lucide React 图标库、Tailwind CSS 等）与开发脚本。
- **常用命令**：
  - `npm run dev`：启动本地开发热重载服务器（默认监听 `http://localhost:3000`）。
  - `npm run build`：执行 TypeScript 类型校验并输出高度压缩的生产环境纯静态文件到 `dist/` 目录。
  - `npm run lint`：静态代码语法校验。

#### `index.html` (网页单页宿主 HTML)
- **作用**：浏览器打开网站时的第一个入口。
- **核心优化**：
  - 配置 `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` 确保移动端视口宽度自适应。
  - 声明 `<meta name="referrer" content="no-referrer" />` 突破外部网站 Favicon 图标与高清壁纸的防盗链限制。

#### `metadata.json`
- **作用**：声明应用程序名称、描述以及平台权限标识，保持与 HTML SEO 标题完全同步。

---

### 2. `src/components/` 核心 UI 组件库

#### `src/components/DockBar.tsx` (底部胶囊工具栏)
- **作用**：屏幕底部悬浮的极简胶囊控制台，聚合了全站最核心的快捷入口。
- **功能细节**：
  - 聚合了：Cloudflare 数据同步、数据管理中心、外观个性化壁纸设置、添加网址、小工具抽屉等触发按钮。
  - 采用无边框高定毛玻璃容器（`.site-glass`），移除了生硬的背景色块填充，使图标与背景浑然一体。
  - 针对手机端设置了 `max-w-[96vw]` 宽度安全阀与隐藏滚动条，支持水平手势触控平滑滑动。

#### `src/components/HeaderClock.tsx` (顶部状态与时钟中枢)
- **作用**：展示顶部时间、天气概览、全屏沉浸开关、CORS 状态指示器与主题切换。
- **功能细节**：
  - 支持**标准数字时钟**与**翻页时钟**两种视觉风格自由切换。
  - 集成 `src/utils/lunar.ts`，精准计算并展示当天农历月日、干支纪年与生肖年。
  - 提供一键全屏（Fullscreen API）按钮，方便将平板或电脑作为桌面时钟看板使用。

#### `src/components/SearchBar.tsx` (全能胶囊搜索栏)
- **作用**：提供多维度搜索引擎聚合检索、搜索历史记录与本地书签即时检索。
- **功能细节**：
  - 预设 27+ 搜索引擎（百度、谷歌、Bing、GitHub、StackOverflow、ChatGPT、Claude、Perplexity 等）。
  - 拥有独立的「本站检索」模式：输入任意文字，毫秒级模糊匹配本地书签标题、URL 与个性化描述，按下 Enter 即可直达目标网站。
  - 搜索建议下拉框支持键盘 `↑` `↓` 方向键快速选择与 `Esc` 快速关闭。

#### `src/components/BookmarkGrid.tsx` (书签网格主视图)
- **作用**：书签展示的主力容器，负责一级分类筛选、网格平铺布局、右键管理与视图切换。
- **功能细节**：
  - 顶部胶囊式分类滑动栏：支持快速切换全部或指定分类，并带有数量徽标。
  - 卡片布局响应式断点：自适应 2 列（手机）、3~4 列（平板）、6 列（电脑超宽屏）。
  - 每个卡片均展示纯净高清 Logo、网站主标题与个性化描述副标题，悬浮时呼出「编辑」与「删除」微型菜单。

#### `src/components/NavSection.tsx` (多级递归小节视图)
- **作用**：树形目录多级小节视图组件，为拥有成百上千书签的重度收藏用户量身定制。
- **功能细节**：
  - 递归渲染子分类节点（如：`开发 / 前端 / React生态`），自动展示层级面包屑路径。
  - 支持每个小节的独立展开与折叠记忆，结构清晰，层级一目了然。

#### `src/components/DataManagementModal.tsx` (数据导入导出中枢)
- **作用**：提供 Chrome / Edge / Firefox 标准 `bookmarks.html` 和 Mtab `.json` 格式的导入与导出。
- **功能细节**：
  - 单选模式：**增量合并**（智能比对 URL 去重并保留原有分类）或 **完全覆盖**。
  - 导入前提供多层级树状结构实时预览，显示解析出的总书签数与文件夹数量。
  - 一键导出本地完整 JSON 备份包或标准 HTML 收藏夹文件，方便迁移至任意浏览器。

#### `src/components/AddBookmarkModal.tsx` (添加/编辑书签弹窗)
- **作用**：快速录入或修改书签信息。
- **功能细节**：
  - 智能嗅探：输入网址失焦（blur）后，自动向高清 Favicon 服务请求图标并自动预填标题。
  - 支持选择已有分类或直接新建多级分类，支持自定义卡片尺寸（标准 / 横幅双倍 / 大号方块）。

#### `src/components/WallpaperModal.tsx` (外观与个性化设置)
- **作用**：全站视觉风格自定义中心。
- **功能细节**：
  - **毛玻璃动态调节**：实时拖动滑块调节全站毛玻璃模糊半径（0~32px）与透明度（10%~95%），即刻生效。
  - **壁纸管理**：预置必应每日一图、Unsplash 艺术摄影图库、自然风景，并支持用户自定义外链壁纸或纯色底色。
  - **时钟与卡片排版**：可配置卡片圆角曲率（直角 / 圆角 / 大圆角）、时钟显示/隐藏与布局方式。

#### `src/components/CloudflareModal.tsx` (云端数据库绑定)
- **作用**：配置与 Cloudflare Workers (D1 / KV) 的后端连接。
- **功能细节**：
  - 填入 Worker 访问域名与访问密码（Token），支持一键点击「测试连接」验证连通性。
  - 提供「推送本地数据至云端」与「拉取云端数据覆盖本地」双向操作。

#### `src/components/WidgetsDrawer.tsx` (右侧小工具抽屉)
- **作用**：右侧滑出的轻量小工具集合。
- **功能细节**：
  - 内置：**便签记事本**（自动持久化随笔草稿）、**待办清单 (Todo)**、**解压电子木鱼**（敲击计数与声音回馈）、**实时聚合热搜榜单**。

#### `src/components/IconRenderer.tsx` (多级容错图标渲染引擎)
- **作用**：负责全站所有网站图标与内置矢量图标的高清渲染。
- **功能细节**：
  - 自动识别三种形态：Lucide 内置矢量图标名、网络图片完整 URL、或者普通网站域名。
  - 针对网站域名，内置四级加载流水线：Favicon.im $\to$ Google S2 CDN $\to$ DuckDuckGo 图标接口 $\to$ 站点首字纯色徽标，彻底杜绝图标红叉或破损。

---

### 3. `src/utils/` 与 `src/data/` 核心工具与初始数据

- **`src/utils/bookmarkParser.ts`**：
  - 核心解析引擎：使用浏览器原生 `DOMParser` 解析非标准 HTML 书签文件，建立路径栈深度遍历，提取 `<A HREF="..." ADD_DATE="..." ICON="...">` 与 `<DD>` 说明文字。
- **`src/utils/favicon.ts`**：
  - 域名清洗与图标 URL 构建工具，自动滤除 URL 路径仅提取一级/二级域名，并组装防盗链图标请求地址。
- **`src/utils/api.ts`**：
  - 封装与 Cloudflare Worker 的 `fetch` 通信，统一注入 `Authorization` 标头，处理网络超时与统一错误提示。
- **`src/utils/lunar.ts`**：
  - 纯前端轻量农历换算逻辑，计算天干地支、生肖年与传统农历日期。
- **`src/data/defaultData.ts`**：
  - 项目初始内置的精选开发/办公书签、27+ 搜索引擎规则定义、预置壁纸库以及默认配置项。

---

### 4. `cloudflare/` 数据库与后端云函数

- **`cloudflare/schema.sql`**：
  - Cloudflare D1 关系型数据库建表文件。创建 `user_bookmarks` 表，包含 `id`、`user_id`、`data`（存储 JSON 字符串）、`updated_at` 等字段并建立唯一复合索引。
- **`cloudflare/worker.js`**：
  - 零依赖 Cloudflare Worker 云函数脚本。
  - 优先处理 `OPTIONS 204` 预检请求并返回通配 CORS 标头；
  - 自动智能嗅探运行环境：已绑定 D1 时使用 D1 SQL 批量事务，未绑定 D1 时自动降级使用 KV 存储，保障极高可用性。

---

### 5. `.github/workflows/` 自动化工作流

- **`.github/workflows/deploy.yml`**：
  - GitHub Actions 持续集成配置文件。代码推送到 `main` 分支时自动触发，构建生成 `./dist` 静态包，并利用 `peaceiris/actions-gh-pages@v4` 自动推送到仓库的 `gh-pages` 分支。

---

## 🎨 视觉规范与统一毛玻璃模态体系

本项目遵循严谨的现代人机工程学设计规范：

- **圆形毛玻璃按钮规范**：
  - 悬浮操作按键（主题模式切换、滚动置顶）采用 `w-12 h-12 rounded-full` 标准尺寸；
  - 搭配 `.site-glass` 无边框毛玻璃、微光投影与 `hover:scale-110 active:scale-95` 灵动触感反馈。
- **全站弹窗模态规范 (Modal System)**：
  - **遮罩层**：`fixed inset-0 z-50 bg-black/65 backdrop-blur-md`；
  - **窗口尺寸**：统一为 `max-w-2xl max-h-[88vh] rounded-3xl`，圆角弧度与留白内外均衡；
  - **标题栏**：左侧带有功能专属的彩色渐变圆角图标与主副标题，右侧圆形关闭按钮；
  - **标签切换**：统一使用圆角胶囊药丸形状（Pill Tabs）的切换栏；
  - **底部固定操作栏**：窗口主体支持独立滚动，底部固定操作条保障用户在任何设备上都能一键点击「完成」或「保存」。

---

## 🚀 全平台部署与上线保姆级实操教程

### 1. GitHub Pages 自动部署（工作流编译相对路径，先打包推送 gh-pages 分支后发布）

本项目内置了自动化构建工作流文件 `.github/workflows/deploy.yml`。

#### 步骤说明：
1. **将代码推送到你的 GitHub 仓库**（分支名一般为 `main` 或 `master`）：
   ```bash
   git init
   git add .
   git commit -m "feat: initial release"
   git branch -M main
   git remote add origin https://github.com/<你的GitHub用户名>/<你的仓库名>.git
   git push -u origin main
   ```
2. **开启 GitHub Actions 读写权限**（⚠️ 极重要：否则工作流无权向 `gh-pages` 分支推送构建文件）：
   - 打开你的 GitHub 仓库，点击顶部菜单 **Settings**；
   - 点击左侧侧边栏 **Actions** -> **General**；
   - 滚动到页面底部的 **Workflow permissions** 模块，勾选 **Read and write permissions**；
   - 点击底部的绿色 **Save** 按钮保存。
3. **观察自动编译并生成 `gh-pages` 分支**：
   - 点击仓库顶部的 **Actions** 标签页，可以看到名为 **Deploy Mtab to GitHub Pages** 的工作流正在自动运行；
   - 构建成功后，仓库中会自动生成一个全新的 **`gh-pages`** 分支，里面包含打包好的纯静态页面。
4. **开启 GitHub Pages 网站服务**：
   - 回到仓库的 **Settings** 页面，点击左侧菜单的 **Pages**；
   - 在 **Build and deployment** 下的 **Source** 下拉框中，选择 **Deploy from a branch**；
   - 在下方的 **Branch** 下拉框中选择 **`gh-pages`** 分支，目录保持 **`/ (root)`**，点击右侧的 **Save** 按钮。
5. **访问你的专属网站**：
   - 等待 1 分钟，刷新 Pages 页面，上方将出现：`Your site is live at https://<你的用户名>.github.io/<你的仓库名>/`，点击即可直接访问！

---

### 2. Cloudflare 部署（免费托管 Pages + 后端 Worker + KV/D1 数据库）

#### 阶段 A：部署后端云函数 (Worker)
1. 注册并登录 [Cloudflare 控制台](https://dash.cloudflare.com/)；
2. 点击左侧菜单 **Workers 和 Pages** -> **创建应用程序** -> **创建 Worker**；
3. 为 Worker 起名（例如 `mtab-api`），点击 **部署**；
4. 点击 **编辑代码**，将本项目 `cloudflare/worker.js` 中的代码全部复制并覆盖粘贴进去，点击右上角 **部署**。

#### 阶段 B：绑定数据库（D1 或 KV 二选一）

- **方案 1（强烈推荐）：绑定 D1 SQL 关系型数据库**：
  1. 在左侧菜单点击 **Workers 和 Pages** -> **D1 SQL 数据库** -> **创建数据库**，名称填写 `mtab-db`；
  2. 点击进入刚创建的 `mtab-db`，切换到 **控制台 (Console)** 标签页；
  3. 打开本项目 `cloudflare/schema.sql` 文件，全选复制里面的建表 SQL 语句，粘贴进控制台输入框并点击 **执行**；
  4. 回到 Worker（`mtab-api`）管理页 -> 点击 **设置** -> **变量** -> 找到 **D1 数据库绑定** -> 点击 **添加绑定**；
  5. **变量名称**必须一模一样填写：`MTAB_D1`，数据库下拉选择 `mtab-db`，点击 **部署**。

- **方案 2（轻量）：绑定 KV 键值数据库**：
  1. 在左侧菜单点击 **Workers 和 Pages** -> **KV** -> **创建命名空间**，命名为 `MTAB_STORAGE`；
  2. 回到 Worker（`mtab-api`）管理页 -> **设置** -> **变量** -> **KV 命名空间绑定** -> 点击 **添加绑定**；
  3. **变量名称**必须一模一样填写：`MTAB_KV`，命名空间下拉选择 `MTAB_STORAGE`，点击 **部署**。

> 🔒 **安全令牌（可选）**：在 Worker 的 **设置** -> **环境变量** 中添加 `MTAB_TOKEN`，设定一个个人密钥（如 `MySecretToken888`），防止他人向你的数据库写入数据。

#### 阶段 C：将前端静态页面部署到 Cloudflare Pages
1. 在 Cloudflare 控制台点击 **Workers 和 Pages** -> **创建应用程序** -> **Pages** -> **连接到 Git**；
2. 授权登录并选中你的 GitHub 仓库；
3. 构建参数设置如下：
   - **框架预设 (Framework preset)**：`Vite`
   - **构建命令 (Build command)**：`npm run build`
   - **输出目录 (Build output directory)**：`dist`
4. 点击 **保存并部署**。约 30 秒后即可生成专有全球 CDN 加速域名（形如 `https://mtab.pages.dev`）。
5. 打开该网页，点击底部 Dock 栏的 **Cloudflare 云同步** 图标，填入 Worker 地址（如 `https://mtab-api.yourname.workers.dev`）及密码，即可随时双向同步！

---

### 3. Vercel 极速部署

1. 登录 [Vercel](https://vercel.com/)，点击右上角 **Add New...** -> **Project**；
2. 导入关联的 GitHub 仓库；
3. Vercel 会自动识别 Vite 项目框架，检查构建命令为 `npm run build`，输出目录为 `dist`；
4. 点击 **Deploy**，大约 1 分钟后自动分配专有 `.vercel.app` 免费域名并部署上线。

---

### 4. Netlify 一键部署

1. 登录 [Netlify](https://www.netlify.com/) 控制台，点击 **Add new site** -> **Import an existing project**；
2. 选择 **GitHub** 并授权你的仓库；
3. 检查构建配置项：
   - **Build command**：`npm run build`
   - **Publish directory**：`dist`
4. 点击 **Deploy site**，稍等片刻即刻上线。

---

### 5. 私有 VPS / Nginx / 本地开发部署

#### 本地运行与调试：
```bash
# 1. 克隆代码仓库
git clone https://github.com/<你的用户名>/<你的仓库名>.git
cd mtab

# 2. 安装项目依赖
npm install

# 3. 启动本地开发服务器
npm run dev
# 浏览器访问 http://localhost:3000
```

#### 私有 VPS / Nginx 生产环境配置：
1. 本地执行 `npm run build`，将生成的 `dist` 文件夹上传到 VPS 服务器的 `/var/www/mtab` 目录；
2. 典型 Nginx 配置文件示例如下：
   ```nginx
   server {
       listen 80;
       server_name nav.yourdomain.com;

       root /var/www/mtab;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # 开启静态资源高效缓存与 Gzip 压缩
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
   }
   ```
3. 执行 `nginx -s reload` 即刻生效。

---

## 📱 移动端与不同设备（手机/折叠屏/平板/超宽屏）深度适配指南

为了在各种移动设备、折叠屏、平板与 4K 超宽屏上获得一致而极致的浏览体验，本项目进行了全方位的跨端适配优化：

1. **底部 Dock 栏自适应宽度与手势滑动**：
   - 宽度限制采用 `max-w-[96vw]` 安全阈值，配合 `scrollbar-none` 隐藏原生滚动条；
   - 在 375px~430px 的手机小屏上，Dock 栏始终保持在屏幕正底部居中，超长项支持手势平滑横向拖拽，绝不会被手机边缘切断。
2. **多端自适应响应式网格断点**：
   - 书签网格采用动态 Tailwind 断点：
     - **超小屏手机 (<640px)**：`grid-cols-2`（每行 2 列，防误触，大号字号易于阅读）；
     - **折叠屏与平板 (640px ~ 1024px)**：`grid-cols-3` 或 `grid-cols-4`；
     - **桌面与超宽显示器 (>1024px)**：`grid-cols-6`（横向充分展开，视野开阔）。
3. **移动端触控人机工学 (44px 标准)**：
   - 所有按钮、操作选项热区均严格遵循移动端 44px 人机交互标准；
   - 交互按键内置 `active:scale-95` 微缩放动画反馈，带来媲美 iOS/Android 原生 App 的跟手触感。
4. **移动端弹窗防遮挡与软键盘自适应**：
   - 所有弹窗容器采用弹性盒模型 (`flex flex-col overflow-hidden max-h-[88vh]`)；
   - 内容主体区域自适应滚动 (`flex-1 overflow-y-auto`)，底部操作栏采用 `flex-shrink-0`，当手机软键盘弹起时，「保存」和「完成」操作按钮绝不会被推出屏幕外。
5. **超长文字防截断与 Tooltip**：
   - 网址标题与描述文字均应用 `truncate` 单行文本溢出省略样式，并在卡片元素上绑定原生 `title` 属性，鼠标悬停或长按即可查看完整文字。

---

## 💡 避坑实战：开发与部署中遇见的 12 大关键坑与解决方案

在开发与多平台部署 Mtab 的过程中，我们总结了以下 12 个新手最容易踩中的技术坑与官方解决方案：

### 坑 1：GitHub Pages 子路径部署 404 白屏
- **问题表象**：本地开发一切正常，推送到 GitHub Pages（如 `user.github.io/my-tab/`）后所有 JS/CSS 文件报 404 导致页面白屏。
- **原因剖析**：默认 Vite 打包输出绝对路径 `/assets/...`，浏览器向主域名根路径请求资源。
- **解决方案**：在 `vite.config.ts` 中声明 `base: './'`，构建出的静态 HTML 自动全部使用相对路径。

### 坑 2：白昼模式下壁纸泛白、失去光泽
- **问题表象**：常见起始页在白昼模式下覆盖了半透明白蒙版，导致高清壁纸泛白变暗、色彩失真。
- **解决方案**：在 `App.tsx` 中将白昼模式遮罩设置为透明（`transparent`），100% 保留壁纸天然原色，依靠组件自身的毛玻璃（`.site-glass`）与文字阴影保证可读性。

### 坑 3：卡片 Logo 带有沉重的实心方框填充
- **问题表象**：每个卡片的 Logo 都被包裹在具有彩色背景的方块盒子里，卡片多了之后色块杂乱无章。
- **解决方案**：重构卡片布局，彻底移除矩形背景色块，直接呈现纯粹透明的品牌图标，配合毛玻璃背景带来灵动的现代质感。

### 坑 4：Cloudflare Worker 的 CORS 跨域预检阻断
- **问题表象**：前端发起 `POST` 请求同步书签或发送自定义 Token 时，浏览器直接拦截并报跨域错误。
- **原因剖析**：复杂请求会在发送前先发一次 HTTP `OPTIONS` 预检请求。如果 Worker 未响应预检，主请求将被拦截。
- **解决方案**：在 `cloudflare/worker.js` 入口处以最高优先级拦截 `OPTIONS` 请求并立即返回 `204 No Content` 与完整 CORS 放行标头。

### 坑 5：Cloudflare D1 数据库单条插入导致的超时
- **问题表象**：导入数百个书签时，如果在 JavaScript 循环中逐条执行 SQL `run()`，会产生多次网络往返导致云函数超时。
- **解决方案**：采用 Cloudflare D1 原生的 `env.MTAB_D1.batch(statements)` 批量事务接口，单次请求一次性提交全部书签数据，耗时降低 90% 以上。

### 坑 6：Netscape Bookmark HTML 非标准标签解析错位
- **问题表象**：用户上传浏览器导出的 `bookmarks.html` 文件，很多分类无法还原，所有书签被压平到根目录。
- **原因剖析**：Netscape 书签格式中大量使用了不闭合的 `<DT>`、`<p>` 标签，单纯使用正则表达式提取必定错位。
- **解决方案**：在 `src/utils/bookmarkParser.ts` 中使用浏览器的 `DOMParser` 解析为内存 DOM 树，通过维护路径栈进行多级递归提取，并自动从 `<DD>` 标签中捕获网站描述。

### 坑 7：跨组件毛玻璃 CSS 变量动态联动
- **问题表象**：如果将毛玻璃模糊值硬编码在每一个组件的 Tailwind class 中，用户在设置中调节模糊度时无法动态即时全局生效。
- **解决方案**：在根元素上挂载 `--glass-blur` 和 `--glass-opacity` CSS 自定义属性，统一抽取 `.site-glass` 类，设置面板滑块调节时直接修改根元素变量，整站所有毛玻璃元素瞬时平滑响应。

### 坑 8：外链 Favicon 跨域失效与 404 破损
- **问题表象**：直接引用目标网站的 `/favicon.ico` 经常因防盗链、跨域、HTTPS 不兼容导致图标裂开。
- **解决方案**：设计了四层容错回退机制（Favicon.im 高清聚合 $\to$ Google S2 全球图标节点 $\to$ DuckDuckGo 图标接口 $\to$ 站点首字纯色徽标兜底），并配置了 HTML `referrerPolicy="no-referrer"`。

### 坑 9：悬浮按钮与移动端手势冲突
- **问题表象**：方形大按钮在手机屏幕右下角容易遮挡底部最后一个书签卡片，或误触边缘返回手势。
- **解决方案**：将悬浮按钮全面升级为精巧的圆形胶囊，尺寸统一为 48px（`w-12 h-12 rounded-full`），并设置适当的下距与右距，兼顾人机交互与视觉呼吸感。

### 坑 10：移动端弹窗在软键盘弹起时被遮挡
- **问题表象**：在手机上点击添加书签输入框时，软键盘弹起导致弹窗底部的「保存」按钮被顶出屏幕外。
- **解决方案**：弹窗容器采用弹性盒模型 (`flex flex-col overflow-hidden max-h-[88vh]`)，内容主体区域自适应滚动 (`flex-1 overflow-y-auto`)，底部操作栏采用 `flex-shrink-0` 始终保持在视口可见区域。

### 坑 11：GitHub Actions 提示 403 Permission Denied 无法推送分支
- **问题表象**：工作流执行到 `peaceiris/actions-gh-pages` 时报错，提示无权向 `gh-pages` 推送分支。
- **原因剖析**：GitHub 默认限制了 Actions 运行时的 `GITHUB_TOKEN` 为只读权限。
- **解决方案**：前往仓库 **Settings** -> **Actions** -> **General** -> **Workflow permissions**，勾选 **Read and write permissions** 并保存即可。

### 坑 12：农历月日显示跨年漂移问题
- **问题表象**：传统农历算法如果没有包含复杂闰月表，跨年后容易出现 1~2 天日期漂移。
- **解决方案**：在 `src/utils/lunar.ts` 中基于公历基准偏移量与天干地支年循环结合计算，确保日常作为新标签页时准确显示农历月份与生肖年份。

---

## 🛠️ 开发者进阶：本地二次开发与贡献指南

如果你希望在此项目基础上继续二次开发或定制功能：

```bash
# 1. 克隆你的分支
git clone https://github.com/<你的用户名>/<你的仓库名>.git
cd mtab

# 2. 安装依赖包
npm install

# 3. 启动开发服务器
npm run dev

# 4. 代码格式检查
npm run lint

# 5. 编译生产包（生成 dist 文件夹）
npm run build
```

---

## 📄 开源协议与鸣谢

- 本项目遵循 [MIT License](LICENSE) 协议开源。
- 感谢原项目 [tsxcw/mtab](https://github.com/tsxcw/mtab) 的创意与开源基础。
- 欢迎各位开发者在 GitHub 上点一个 ⭐️ **Star**，或提交 Issue 与 PR 共同完善项目！
