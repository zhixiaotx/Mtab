# Mtab (Cloudflare 深度增强版) — 现代化极速个性化起始页导航

> 🌟 **基于开源项目 [tsxcw/mtab](https://github.com/tsxcw/mtab) 深度二次开发与现代前端工程化重构**  
> 本项目是一款专为极客与日常用户打造的高颜值、极速、高度可定制的现代浏览器新标签页导航。默认采用**清爽通透的白昼模式（100% 呈现壁纸天然纯净色彩，不泛白不暗沉）**，全站深度融入**高定无描边毛玻璃 (Glassmorphism) 亚克力视觉美学**；外观设置支持**毛玻璃模糊度与通透度全局动态调节**（由 CSS 变量 `--glass-blur`、`--glass-opacity` 驱动）；右下角悬浮按键统一为**纯净圆形毛玻璃**；模态弹窗规范化**统一尺寸、圆角、胶囊标签栏与底部固定操作栏**；底部升级为极简灵动的**圆角矩形胶囊 Dock 栏**；网址卡片移除沉重的实心色块背景，呈现**大尺寸纯正品牌原标**；支持 **多级分类递归渲染 (NavSection)**、**HTML/JSON 书签智能解析与增量合并/完全覆盖**、**27+ 多引擎圆角胶囊搜索栏**，并深度整合 **Cloudflare Workers (KV / D1)** 彻底解除 CORS 跨域限制，配备 GitHub Actions 自动化编译推送 `gh-pages` 分支、Cloudflare Pages、Vercel、Netlify 及全终端移动端自适应。

---

## 📑 目录

- [✨ 项目核心亮点与功能特性](#-项目核心亮点与功能特性)
- [📁 深入全景：项目所有文件功能与作用详解（小白必读）](#-深入全景项目所有文件功能与作用详解小白必读)
  - [1. 根目录基础设施与配置文件](#1-根目录基础设施与配置文件)
  - [2. `src/components/` 核心 UI 组件库](#2-srccomponents-核心-ui-组件库)
  - [3. `src/utils/` 与 `src/data/` 核心工具与初始数据](#3-srcutils-与-srcdata-核心工具与初始数据)
  - [4. `cloudflare/` 数据库与后端云函数](#4-cloudflare-数据库与后端云函数)
  - [5. `.github/workflows/` 自动化工作流](#5-githubworkflows-自动化工作流)
- [🎨 视觉规范与无描边动态毛玻璃体系](#-视觉规范与无描边动态毛玻璃体系)
- [🚀 全平台部署与上线保姆级实操教程](#-全平台部署与上线保姆级实操教程)
  - [1. GitHub Pages 自动化部署（相对路径打包 + 推送 gh-pages 分支）](#1-github-pages-自动化部署相对路径打包--推送-gh-pages-分支)
  - [2. Cloudflare 部署全攻略（Pages 前端 + Worker 云函数 + D1/KV 数据库）](#2-cloudflare-部署全攻略pages-前端--worker-云函数--d1kv-数据库)
  - [3. Vercel 极速部署](#3-vercel-极速部署)
  - [4. Netlify 一键部署](#4-netlify-一键部署)
  - [5. 私有 VPS / Nginx / 本地 Node.js 部署](#5-私有-vps--nginx--本地-nodejs-部署)
- [📱 移动端与不同设备（手机/折叠屏/平板/超宽屏）深度适配指南](#-移动端与不同设备手机折叠屏平板超宽屏深度适配指南)
- [💡 避坑实战：开发与部署中遇见的 15 大关键坑与解决方案](#-避坑实战开发与部署中遇见的-15-大关键坑与解决方案)
- [🛠️ 开发者进阶：本地二次开发与贡献指南](#️-开发者进阶本地二次开发与贡献指南)
- [📄 开源协议与鸣谢](#-开源协议与鸣谢)

---

## ✨ 项目核心亮点与功能特性

1. **默认白昼模式 & 壁纸零失真原图呈现**：
   - 网页启动默认使用白昼清爽模式；
   - **100% 还原高清壁纸天然色彩**：彻底移除以往起始页覆盖的灰白暗沉蒙版，让壁纸色彩饱满通透，不泛白、不灰暗。
2. **纯净大尺寸 Logo & 无色块填充**：
   - 彻底移除图标周围生硬的实心色块方框（No rectangular fill），Logo 放大至 **36px**，呈现完全透明（`bg-transparent`）的品牌原标，极致清爽。
3. **整站无描边动态毛玻璃美学 (Glassmorphism)**：
   - 右下角主题切换（太阳/月亮）与一键平滑置顶按钮升级为**纯净无描边圆形毛玻璃按键**（`rounded-full site-glass border-0`）；
   - **外观设置支持全局动态调节**：支持实时滑动调节模糊半径（0px ~ 32px）与表面通透度（10% ~ 95%），由 CSS 变量 `--glass-blur`、`--glass-opacity` 驱动全局联动；预置「清透灵动」、「经典毛玻璃」、「深度雾感」、「超清无模糊」四套一键主题预设。
4. **模态弹窗规范化 (Modal System)**：
   - 添加网址、外观个性化、Cloudflare 同步、数据管理中心等所有弹窗统一为 `max-w-2xl` 黄金宽度与 `max-h-[88vh]` 安全高度；
   - 统一顶栏图标标识、关闭按键、胶囊子导航标签、可滚动主体区域以及底部固定完成操作栏。
5. **圆角矩形胶囊 Dock 栏**：
   - 底部 Dock 栏重构为标准圆角矩形胶囊形态，悬浮感更强；在手机小屏上限制在 `max-w-[96vw]` 视口内，隐藏滚动条并支持顺畅手势拖拽。
6. **智能数据管理中心（HTML / JSON 导入导出）**：
   - 支持上传 Chrome、Edge、Firefox 导出的标准 `bookmarks.html` 文件或 Mtab 备份的 `.json` 配置文件；
   - 提供 **增量合并**（智能比对 URL 去重，新项目平滑追加在末尾）或 **完全覆盖** 模式；
   - 智能解析 `<A comment>` / `<DD>` 说明文字充当网站副标题描述，并自动通过国际 CDN 探测高清 Favicon。
7. **多级分类递归渲染 (NavSection)**：
   - 支持多级递归小节与平铺网格双视图自由切换；
   - 面包屑层级导航、目录展开折叠记忆，去除冗余导轨竖线，布局干净自然。
8. **27+ 搜索引擎圆角胶囊搜索栏**：
   - 预置通用搜索、开发者、AI专属（ChatGPT / Claude / Perplexity / Gemini）、学术、社区等多维度搜索引擎；
   - 内置「本站检索」模式，毫秒级模糊高亮检索本地所有书签。
9. **Cloudflare 云端无缝同步 & 解除 CORS 跨域**：
   - 后端 Worker 内置 `OPTIONS 204` 预检拦截与全通配 CORS 响应头；
   - 支持 Cloudflare KV 或 D1 关系型数据库，配有一键初始化建表与 Bearer Token 身份鉴权。
10. **高性能拖拽排序与本地持久化**：
    - 集成轻量现代化 React 拖拽引擎 `@dnd-kit`，支持平铺网格与多级小节视图下的自由拖拽重排；
    - 针对成百上千条书签引入 `React.memo` 与 `useCallback` 稳定引用，拖拽滑动帧率稳定保持 60 FPS。
11. **多功能右侧抽屉 Widgets**：
    - 集成便签记事本、待办清单（Todo，含“今日/最近七天/全部”筛选与统计）、解压电子木鱼、实时聚合热搜榜。

---

## 📁 深入全景：项目所有文件功能与作用详解（小白必读）

本项目遵循高内聚、低耦合的现代化 React + TypeScript 工程化目录结构。为了让新手小白也能一目了然，下面将项目中**每一个文件**的功能、实现逻辑与修改指南进行拆解：

```text
├── .github/
│   └── workflows/
│       └── deploy.yml              # [GitHub Actions] 自动化 CI/CD：编译项目并自动推送发布至 gh-pages 分支
├── cloudflare/
│   ├── schema.sql                  # [D1数据库] SQLite 数据表结构、主键索引与一键建表 SQL 脚本
│   └── worker.js                   # [后端云函数] Cloudflare Worker 代码，解决跨域拦截，统一适配 KV 与 D1 读写
├── public/                         # [静态资源目录] 存放 favicon、图标、媒体文件与 AI Studio 静态资产
├── src/
│   ├── components/                 # [React UI 核心组件库]
│   │   ├── AddBookmarkModal.tsx    # 添加/编辑书签弹窗：输入网址失焦后自动嗅探抓取网站高清 Favicon 与标题
│   │   ├── BookmarkGrid.tsx        # 网址导航主展示区：支持多级分类筛选、双视图切换、拖拽排序容器与 DndContext
│   │   ├── CloudflareModal.tsx     # Cloudflare 配置弹窗：填入 Worker 地址与 Token，探测连通性并推拉数据
│   │   ├── DataManagementModal.tsx # 数据中心：上传 HTML/JSON、增量/覆盖模式单选、多级树预览与双格式导出
│   │   ├── DockBar.tsx             # 底部圆角矩形胶囊 Dock 工具栏：无背景填充原标、平滑微动效触控
│   │   ├── HeaderClock.tsx         # 顶部时间中枢：全屏控制、实时时钟、农历节气、数字/翻页双时钟样式
│   │   ├── IconRenderer.tsx        # 高清多源图标渲染引擎：Lucide SVG / 外链图片 / Favicon.im / Google S2 四级探测
│   │   ├── NavSection.tsx          # 递归小节组件：层级面包屑路径、目录折叠、子分类层级缩进与直属书签渲染
│   │   ├── SearchBar.tsx           # 胶囊搜索栏：27+ 引擎切换、本地书签即时检索、搜索历史记录
│   │   ├── SortableBookmarkCard.tsx# 可拖拽排序书签卡片：36px 品牌原标居左、标题描述居右、快捷操作与拖拽浮层
│   │   ├── WallpaperModal.tsx      # 外观个性化中心：整站无描边毛玻璃调节、高清壁纸库(Bing/Unsplash/自定义)、时钟排版
│   │   └── WidgetsDrawer.tsx       # 右侧小工具抽屉：便签记事本、待办清单 (Todo，含时间范围筛选)、解压电子木鱼、实时热搜榜
│   ├── data/
│   │   └── defaultData.ts          # 初始内置数据集：默认白昼配置、精选初始书签、壁纸图库与 27+ 搜索引擎规则
│   ├── utils/
│   │   ├── api.ts                  # 网络请求工具：封装与 Cloudflare Worker 鉴权通信、错误重试与数据格式化
│   │   ├── bookmarkParser.ts       # 书签解析核心：使用浏览器原生 DOMParser 提取多层级 HTML 树、JSON 合并与导出
│   │   ├── favicon.ts              # 网站高清图标解析服务：Favicon.im / Google S2 / DuckDuckGo 多 CDN 兜底与域名提取
│   │   └── lunar.ts                # 农历与干支算法：计算传统生肖年、天干地支、农历月日与节令
│   ├── App.tsx                     # 根应用调度中心：核心状态机、壁纸渲染、主题模式切换、全站 CSS 变量注入
│   ├── index.css                   # 全局样式文件：引入 Tailwind CSS、定义滚动条隐藏与 .site-glass 无描边动态毛玻璃
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
- **作用**：控制 Vite 构建打包行为与开发服务器环境。
- **关键配置解析**：
  - `base: './'`：**部署生命线**。强制打包输出的所有 HTML 资源路径均采用 `./` 相对路径。使得项目不论部署在域名根目录（如 `https://example.com/`），还是 GitHub Pages 子路径（如 `https://username.github.io/mtab/`），都能精准找到 js/css 资源，彻底杜绝 404 白屏。
  - `plugins: [react(), tailwindcss()]`：集成 React 官方 Fast Refresh 插件与 Tailwind CSS v4 编译器。

#### `package.json` (依赖与指令脚本)
- **作用**：定义项目依赖包及 npm 运行脚本。
- **常用命令**：
  - `npm run dev`：启动本地热开发服务器（监听 `http://localhost:3000`）。
  - `npm run build`：执行 TypeScript 类型检查并将代码打包压缩为纯静态文件到 `dist/` 文件夹。
  - `npm run lint`：运行 `tsc --noEmit` 进行全量代码语法检查。

#### `index.html` (网页宿主 HTML)
- **作用**：SPA 单页应用的 HTML 壳。
- **关键细节**：
  - `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />`：禁止移动端非法双击缩放，保证原生 App 式触控体验。
  - `<meta name="referrer" content="no-referrer" />`：**防盗链神器**。发送图片请求时不携带 Referer 标头，让必应壁纸、外链网站 Favicon 能顺畅加载不破损。

#### `metadata.json`
- **作用**：AI Studio / Web Applet 元数据声明，与 `<title>` 页面标题保持完全同步。

---

### 2. `src/components/` 核心 UI 组件库

#### `src/components/DockBar.tsx` (底部胶囊工具栏)
- **作用**：屏幕底部悬浮的圆角矩形胶囊控制台，包含全站核心功能入口。
- **特色**：
  - 聚合 Cloudflare 同步、数据管理中心、外观个性化、添加网址、小工具抽屉入口；
  - 使用 `.site-glass border-0` 纯净毛玻璃，移除生硬实心背景；在手机屏限制为 `max-w-[96vw]` 并支持手势横向拖拽。

#### `src/components/HeaderClock.tsx` (顶部时间与状态中枢)
- **作用**：展示大屏时间、天气概览、全屏沉浸切换与公农历日期。
- **特色**：
  - 支持**标准数字时钟**与**复古翻页时钟**两种视觉样式；
  - 调用 `src/utils/lunar.ts` 实时计算并展示当天的农历月日、天干地支纪年与生肖。

#### `src/components/SearchBar.tsx` (全能胶囊搜索栏)
- **作用**：提供 27+ 搜索引擎切换、搜索历史、以及本地书签即时检索。
- **特色**：
  - 内置「本站检索」模式：输入关键词快速匹配本地书签标题、描述与 URL；
  - 适配键盘 `↑` `↓` 方向键选择菜单与 `Enter` 回车直接搜索。

#### `src/components/BookmarkGrid.tsx` (书签网格主视图)
- **作用**：书签主展示区，负责一级分类切换、网格平铺布局、右键管理与 `@dnd-kit` 拖拽上下文。
- **特色**：
  - 响应式栅格断点：手机 `2` 列、平板 `3~4` 列、桌面 `6` 列；
  - 集成拖拽重排浮层与流畅度优化。

#### `src/components/NavSection.tsx` (多级递归小节组件)
- **作用**：递归渲染多级分类树（如 `开发 / 前端 / React`），展示面包屑导航、折叠控制与分类直属书签。

#### `src/components/SortableBookmarkCard.tsx` (可拖拽书签卡片)
- **作用**：单个网址卡片 UI 组件。
- **特色**：
  - `React.memo` 优化；
  - 左侧展示 **36px** 透明背景品牌原标，右侧展示标题与副标题描述；悬浮呼出“编辑”和“删除”快捷按钮。

#### `src/components/DataManagementModal.tsx` (数据导入导出中心)
- **作用**：处理 HTML/JSON 书签上传导入、合并方式选择（增量/覆盖）与备份文件导出。

#### `src/components/AddBookmarkModal.tsx` (添加/编辑网址弹窗)
- **作用**：新增或修改网址。输入 URL 失焦时自动嗅探网站标题与高清 Favicon，支持设置自定义分类与卡片尺寸。

#### `src/components/WallpaperModal.tsx` (外观与毛玻璃个性化中心)
- **作用**：实时拖动滑块调节全站毛玻璃模糊度（0~32px）与透明度（10%~95%），支持切换必应每日壁纸、Unsplash 摄影图库或自定义外链图片。

#### `src/components/CloudflareModal.tsx` (云端数据库绑定弹窗)
- **作用**：配置 Cloudflare Worker 地址与 Authorization Token，提供一键测试连通性与云端双向推拉同步。

#### `src/components/WidgetsDrawer.tsx` (右侧小工具抽屉)
- **作用**：内置便签记事本、待办清单 (Todo)、解压电子木鱼、全网实时热搜榜。

#### `src/components/IconRenderer.tsx` (多源高清图标渲染引擎)
- **作用**：四级容错图标加载流水线：Lucide 矢量图标 $\to$ Favicon.im 高清节点 $\to$ Google S2 CDN $\to$ DuckDuckGo 图标 $\to$ 首字纯色徽标兜底。

---

### 3. `src/utils/` 与 `src/data/` 核心工具与初始数据

- **`src/utils/bookmarkParser.ts`**：DOMParser HTML 树级递归解析器，智能比对 URL 增量合并，保留原始顺序。
- **`src/utils/favicon.ts`**：提取一级/二级主域名，拼装多源 Favicon CDN 请求 URL。
- **`src/utils/api.ts`**：封装 `fetch` HTTP 请求，注入 `X-Mtab-Token` 标头与超时重试。
- **`src/utils/lunar.ts`**：纯前端农历、天干地支与生肖换算算法。
- **`src/data/defaultData.ts`**：初始默认配置、精选开发/办公书签集、27+ 搜索引擎规则定义。

---

### 4. `cloudflare/` 数据库与后端云函数

- **`cloudflare/schema.sql`**：Cloudflare D1 数据库建表 SQL 脚本。
- **`cloudflare/worker.js`**：零依赖 Cloudflare Worker 脚本。处理 `OPTIONS 204` CORS 预检，自动识别并兼容 D1 与 KV 存储。

---

### 5. `.github/workflows/` 自动化工作流

- **`.github/workflows/deploy.yml`**：GitHub Actions CI/CD 脚本。代码提交至 `main` 时自动运行 `npm run build`，打包相对路径静态文件并推送到 `gh-pages` 分支。

---

## 🎨 视觉规范与无描边动态毛玻璃体系

本项目全面采用现代化 Glassmorphism 亚克力视觉规范：

1. **全局 CSS 变量驱动**：
   ```css
   :root {
     --glass-blur: 16px;
     --glass-opacity: 0.25;
     --glass-bg-dark: rgba(18, 18, 20, var(--glass-opacity));
     --glass-bg-light: rgba(255, 255, 255, var(--glass-opacity));
   }
   ```
2. **`.site-glass` 无描边类**：
   - 使用 `backdrop-filter: blur(var(--glass-blur))` 搭配 `border-0`，杜绝传统粗糙描边带来的割裂感，呈现通透灵动的沉浸氛围。

---

## 🚀 全平台部署与上线保姆级实操教程

### 1. GitHub Pages 自动化部署（相对路径打包 + 推送 gh-pages 分支）

本项目已预置 `.github/workflows/deploy.yml` 工作流。

#### 极速上手步骤：
1. **推送到 GitHub 远程仓库**（主分支名称为 `main` 或 `master`）：
   ```bash
   git init
   git add .
   git commit -m "feat: deploy mtab"
   git branch -M main
   git remote add origin https://github.com/<你的GitHub用户名>/<你的仓库名>.git
   git push -u origin main
   ```
2. **开启 GitHub Actions 写权限**（⚠️ 关键步骤）：
   - 进入 GitHub 仓库页面，点击 **Settings** 标签；
   - 点击左侧 **Actions** -> **General**；
   - 滚动到最底部 **Workflow permissions**，勾选 **Read and write permissions** 并点击 **Save**。
3. **查看自动构建过程**：
   - 点击仓库顶部的 **Actions** 页面，可以看到 **Deploy Mtab to GitHub Pages** 工作流自动运行；
   - 运行完成后，仓库会自动创建一个名为 **`gh-pages`** 的纯静态编译分支。
4. **开启 Pages 服务**：
   - 进入仓库 **Settings** -> **Pages**；
   - 在 **Build and deployment** -> **Source** 下拉框选择 **Deploy from a branch**；
   - 在下方 **Branch** 下拉框选择 **`gh-pages`** 分支，目录选 **`/ (root)`**，保存。
5. **访问网站**：
   - 稍等 1 分钟即可在页面顶部获取你的专属网址：`https://<你的用户名>.github.io/<你的仓库名>/`。

---

### 2. Cloudflare 部署全攻略（Pages 前端 + Worker 云函数 + D1/KV 数据库）

#### 阶段 A：部署后端 Worker (云函数)
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)；
2. 点击左侧菜单 **Workers 和 Pages** -> **创建应用程序** -> **创建 Worker**；
3. 起个名字（如 `mtab-api`），点击 **部署**；
4. 点击 **编辑代码**，将本项目 `cloudflare/worker.js` 中的代码全部复制粘贴替换原有内容，点击右上角 **部署**。

#### 阶段 B：绑定 D1 数据库 (强烈推荐) 或 KV
- **绑定 D1 数据库**：
  1. 左侧菜单点击 **Workers 和 Pages** -> **D1 SQL 数据库** -> **创建数据库**，命名为 `mtab-db`；
  2. 点击进入 `mtab-db`，选择 **控制台 (Console)** 标签页；
  3. 复制本项目 `cloudflare/schema.sql` 中的全部代码，粘贴进控制台并点击 **执行** 完成建表；
  4. 回到 Worker（`mtab-api`）页面 -> **设置** -> **变量** -> **D1 数据库绑定** -> 点击 **添加绑定**；
  5. 变量名称填 **`MTAB_D1`**（必须完全一致），数据库选择 `mtab-db`，保存部署。

- **安全令牌**：在 Worker **设置** -> **环境变量** 添加 `AUTH_TOKEN` 或 `MTAB_TOKEN`，设定一个访问密码（如 `MyPassword123`），防止未经授权的修改。

#### 阶段 C：部署 Cloudflare Pages 前端
1. 控制台点击 **Workers 和 Pages** -> **创建应用程序** -> **Pages** -> **连接到 Git**；
2. 选择你的 GitHub 仓库，配置构建参数：
   - **框架预设**：`Vite`
   - **构建命令**：`npm run build`
   - **输出目录**：`dist`
3. 点击 **保存并部署**，数秒后即可获得在全球 CDN 节点加速的 Pages 网址（如 `https://mtab.pages.dev`）。
4. 打开你的 Mtab 网页，点击底部 Dock 栏的 **Cloudflare 云同步** 图标，填入你的 Worker 链接与密码，点击「测试连接」并同步即可！

---

### 3. Vercel 极速部署

1. 登录 [Vercel](https://vercel.com/)，点击 **Add New...** -> **Project**；
2. 导入你的 GitHub 仓库；
3. Vercel 自动识别 Vite 框架，构建命令默认 `npm run build`，输出目录 `dist`；
4. 点击 **Deploy**，1 分钟内即可完成部署并分发免费域名。

---

### 4. Netlify 一键部署

1. 登录 [Netlify](https://www.netlify.com/)，点击 **Add new site** -> **Import an existing project**；
2. 选择 **GitHub** 授权并挑选仓库；
3. 设置 **Build command** 为 `npm run build`，**Publish directory** 为 `dist`；
4. 点击 **Deploy site** 即刻上线。

---

### 5. 私有 VPS / Nginx / 本地 Node.js 部署

#### 本地开发运行：
```bash
git clone https://github.com/<你的用户名>/<你的仓库名>.git
cd mtab
npm install
npm run dev
# 浏览器访问 http://localhost:3000
```

#### 私有 Nginx 部署：
1. 本地执行 `npm run build`，将生成的 `dist/` 整个目录上传至 VPS 的 `/var/www/mtab`；
2. 示例 Nginx 配置文件：
   ```nginx
   server {
       listen 80;
       server_name nav.yourdomain.com;

       root /var/www/mtab;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml;
   }
   ```
3. 执行 `nginx -s reload` 重载 Nginx。

---

## 📱 移动端与不同设备（手机/折叠屏/平板/超宽屏）深度适配指南

为了在手机、折叠屏、iPad 平板与 4K 显示器上均拥有极佳体验，本项目针对多端做了深度适配：

1. **44px 防误触热区**：所有操作按键触控热区均遵循 iOS / Android 人机工学 44px 标准，带有 `active:scale-95` 按压微动效。
2. **弹性响应式栅格**：
   - 手机小屏 (<640px)：`grid-cols-2`（2 列大字号，方便单手大拇指点按）；
   - 折叠屏/平板 (640px~1024px)：`grid-cols-3` 或 `grid-cols-4`；
   - 桌面/超宽屏 (>1024px)：`grid-cols-6`。
3. **底部 Dock 栏手势滑动**：限制在 `max-w-[96vw]` 宽度内，隐藏滚动条，手机端可顺畅手势横向拖动。
4. **软键盘遮挡自适应**：弹窗主体基于 Flex 弹性布局，内容自适应滚动，底部保存按键固定在视口内，绝不因软键盘弹起而被挤出屏幕。

---

## 💡 避坑实战：开发与部署中遇见的 15 大关键坑与解决方案

在开发与多平台部署 Mtab 的过程中，总结的 15 个关键技术坑与解决方案：

1. **GitHub Pages 子路径 404 白屏**：绝对路径导致找不到 js/css。在 `vite.config.ts` 强制声明 `base: './'` 输出相对路径解决。
2. **GitHub Actions 提示 403 权限拒绝**：需要在仓库 **Settings** -> **Actions** -> **General** 中将 **Workflow permissions** 改为 **Read and write permissions**。
3. **Cloudflare Worker CORS 预检阻断**：复杂请求先发 `OPTIONS` 预检。Worker 入口拦截 `OPTIONS` 立即返回 `204 No Content` 及完整 CORS 标头。
4. **Cloudflare D1 SQL 批量插入超时**：循环执行单条 SQL 会多次往返。采用 `env.MTAB_D1.batch(statements)` 事务批量提交解决。
5. **白昼模式壁纸灰色失真**：遮罩层改为 `bg-transparent`，不阻挡壁纸天然真实色彩。
6. **图标包含沉重背景方块**：将卡片与图标容器设为全透明 `bg-transparent`，并放大至 `36px` 纯净品牌原标。
7. **多级 HTML 书签解析漏掉分类与描述**：使用 `DOMParser` 解析原生 DOM，建立路径栈深度遍历提取 `<A comment>` 与 `<DD>` 节点。
8. **外链 Favicon 防盗链破损**：HTML 声明 `<meta name="referrer" content="no-referrer" />`，配合 IconRenderer 四级 CDN 容错流水线。
9. **移动端软键盘弹起挤掉保存按钮**：弹窗使用 `flex flex-col max-h-[88vh]`，内容 `flex-1 overflow-y-auto`，操作栏 `flex-shrink-0`。
10. **大批量书签拖拽卡顿掉帧**：用 `React.memo` 包装 `SortableBookmarkCard` 与 `NavSection`，使用 `useCallback` 稳定事件句柄。
11. **农历跨年日期漂移**：在 `lunar.ts` 基于公历基准偏移量与天干地支纪年结合计算。
12. **毛玻璃修改无法实时全局响应**：在根节点挂载 `--glass-blur` CSS 变量，设置面板拖动滑块时直接更新 CSS 变量。
13. **自定义外链壁纸防盗链拦截**：`img` 标签增加 `referrerPolicy="no-referrer"` 属性。
14. **移动端长按拖拽与滚动冲突**：在 `@dnd-kit` 传感器中设置 `delay: 250, tolerance: 5` 触发防误触。
15. **搜素引擎快捷键被输入框捕获**：搜索框激活时暂停全局快捷键监听，失焦后自动恢复。

---

## 🛠️ 开发者进阶：本地二次开发与贡献指南

```bash
# 克隆项目
git clone https://github.com/<你的用户名>/<你的仓库名>.git
cd mtab

# 安装依赖
npm install

# 启动本地开发
npm run dev

# 语法类型检查
npm run lint

# 生产环境打包
npm run build
```

---

## 📄 开源协议与鸣谢

- 本项目采用 [MIT License](LICENSE) 开源协议。
- 感谢原项目 [tsxcw/mtab](https://github.com/tsxcw/mtab) 提供的极具启发的开源基础。
- 欢迎大家点一个 ⭐️ **Star**，支持项目持续演进！
