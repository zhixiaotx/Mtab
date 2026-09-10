import React from 'react';

export type IconSize = 'sm' | 'md' | 'lg';
export type IconRadius = 'md' | 'lg' | 'full';

export type IconSource =
  | 'favicon_im'
  | 'favicon_myhkw'
  | 'favicon_iowen'
  | 'favicon_baidu'
  | 'favicon_afmax'
  | 'favicon_la4'
  | 'favicon_vvhan'
  | 'favicon_xinac'
  | 'favicon_vip'
  | 'favicon_cravatar'
  | 'direct'
  | 'favicon_duckduckgo'
  | 'favicon_extractor'
  | 'favicon_pub'
  | 'google'
  | 'clearbit'
  | 'icons_duckduckgo'
  | 'iconhorse'
  | 'logo_surf'
  | 'iconify'
  | 'custom';

export interface BookmarkItem {
  id: string;
  name: string;
  title?: string;
  url: string;
  icon?: string;
  iconType?: 'lucide' | 'image' | 'text' | 'emoji';
  iconifyIcon?: string;
  customIcon?: string;
  bgColor?: string;
  category: string;
  categoryPath?: string[]; // 多级分类层级路径，例如 ["技术", "前端", "React"]
  size?: '1x1' | '1x2' | '2x2';
  sort?: number;
  description?: string;
  isFolder?: boolean;
  deleted?: boolean;
  children?: BookmarkItem[];
}

// 多级分类节点树
export interface CategoryNode {
  id: string;
  name: string;
  fullPath: string; // 完整路径，例如 "技术/前端/React"
  level: number; // 层级深度，从 1 开始
  categoryPath: string[]; // 分级数组
  children: CategoryNode[]; // 子分类列表
  count: number; // 包含的书签数量
}

export type ImportMode = 'merge' | 'overwrite'; // 增量合并 or 完全覆盖

export interface ImportParseResult {
  bookmarks: BookmarkItem[];
  categories: string[];
  categoryTree: CategoryNode[];
  config?: Partial<MtabConfig>;
  notes?: NoteItem[];
  todos?: TodoItem[];
  totalBookmarks: number;
  totalCategories: number;
  sourceType: 'html_bookmarks' | 'json_config' | 'json_bookmarks';
}

export interface SearchEngine {
  id: string;
  value?: string;
  name: string;
  group?: string;
  url: string;
  icon: React.ReactNode | string;
  placeholder: string;
  shortcut?: string;
  isDefault?: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  color?: 'amber' | 'blue' | 'emerald' | 'purple' | 'rose' | 'slate';
  updatedAt: number;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  folder?: 'today' | 'week' | 'all';
  createdAt: number;
}

export interface MtabThemeConfig {
  mode?: 'light' | 'dark'; // 白天/黑夜模式
  wallpaperType: 'bing' | 'unsplash' | 'preset' | 'custom' | 'solid';
  wallpaperUrl: string;
  blur: number; // 0 - 20px (壁纸背景高斯模糊)
  opacity: number; // 0 - 0.8 (暗黑遮罩透明度)
  glassBlur: number; // 0 - 32px (整站毛玻璃模糊强度)
  glassOpacity: number; // 0.1 - 0.95 (整站毛玻璃底色通透度)
  timeColor: string;
  time24: boolean;
  timeSeconds: boolean;
  timeLunar: boolean;
  iconSize: IconSize;
  iconRadius: IconRadius;
  showTitle: boolean;
  columns: number;
}

export interface MtabConfig {
  theme: MtabThemeConfig;
  openInNewTab: boolean;
  tabbarEnabled: boolean;
  autoLocalBackup?: boolean; // 自动备份到本地 (每当书签或便签变更自动序列化下载到本地JSON文件)
}

export interface CloudflareConfig {
  workerUrl: string; // e.g. https://mtab.username.workers.dev or empty for local
  authToken: string; // X-Mtab-Token
  dbMode: 'auto' | 'kv' | 'd1';
  autoSync: boolean;
  lastSyncTime: number | null;
}

export interface CloudflareStatusResponse {
  code: number;
  msg: string;
  version: string;
  dbType: string;
  d1Bound: boolean;
  kvBound: boolean;
  hasAuth?: boolean;
  cors: boolean;
  timestamp: number;
}

export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  icon: string;
  wind: string;
  humidity: string;
  forecast: Array<{
    day: string;
    temp: string;
    condition: string;
  }>;
}

export interface HotSearchItem {
  rank: number;
  title: string;
  hot: string;
  url: string;
}
