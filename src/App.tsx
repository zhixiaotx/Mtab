import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  MtabConfig, BookmarkItem, NoteItem, TodoItem, CloudflareConfig,
  CloudflareStatusResponse, WeatherData, ImportMode
} from './types';
import {
  DEFAULT_CONFIG, DEFAULT_BOOKMARKS, DEFAULT_CATEGORIES
} from './data/defaultData';
import { HeaderClock } from './components/HeaderClock';
import { SearchBar } from './components/SearchBar';
import { BookmarkGrid } from './components/BookmarkGrid';
import { AddBookmarkModal } from './components/AddBookmarkModal';
import { CloudflareModal } from './components/CloudflareModal';
import { WallpaperModal } from './components/WallpaperModal';
import { WidgetsDrawer } from './components/WidgetsDrawer';
import { DataManagementModal } from './components/DataManagementModal';
import { DockBar } from './components/DockBar';
import { ArrowUp, Sun, Moon } from 'lucide-react';
import {
  testCloudflareConnection, fetchAllData, pushAllData
} from './utils/api';

export default function App() {
  // ========== 核心状态管理 ==========
  const [config, setConfig] = useState<MtabConfig>(() => {
    try {
      const cached = localStorage.getItem('mtab_config');
      return cached ? JSON.parse(cached) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  // 白天 / 黑夜模式 (默认白天模式)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('mtab_theme_mode');
      if (cached) return cached === 'dark';
      return config.theme.mode === 'dark';
    } catch {
      return false; // 默认白天模式
    }
  });

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const cached = localStorage.getItem('mtab_bookmarks');
      return cached ? JSON.parse(cached) : DEFAULT_BOOKMARKS;
    } catch {
      return DEFAULT_BOOKMARKS;
    }
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const cached = localStorage.getItem('mtab_notes');
      return cached ? JSON.parse(cached) : [
        {
          id: '1',
          title: '欢迎使用 Mtab Cloudflare 版',
          content: '本项目已重构后端为 Cloudflare Worker，直接在 Cloudflare 网页端绑定 KV 或 D1 数据库即可使用！\n\n所有跨域 (CORS) 限制均已解除，已支持27+多引擎搜索与自动获取高清Logo。',
          color: 'amber',
          updatedAt: Date.now(),
        },
      ];
    } catch {
      return [];
    }
  });

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const cached = localStorage.getItem('mtab_todos');
      return cached ? JSON.parse(cached) : [
        { id: '1', text: '在 Cloudflare 控制台创建 Worker', completed: true, priority: 'high', folder: 'today', createdAt: Date.now() - 3600000 },
        { id: '2', text: '在 Worker 设置中绑定 MTAB_KV 或 MTAB_D1', completed: true, priority: 'high', folder: 'today', createdAt: Date.now() - 1800000 },
        { id: '3', text: '一键同步书签与便签到云端', completed: false, priority: 'medium', folder: 'today', createdAt: Date.now() },
      ];
    } catch {
      return [];
    }
  });

  const [cloudflareConfig, setCloudflareConfig] = useState<CloudflareConfig>(() => {
    try {
      const cached = localStorage.getItem('mtab_cf_config');
      return cached ? JSON.parse(cached) : {
        workerUrl: '',
        authToken: '',
        dbMode: 'auto',
        autoSync: false,
        lastSyncTime: null,
      };
    } catch {
      return {
        workerUrl: '',
        authToken: '',
        dbMode: 'auto',
        autoSync: false,
        lastSyncTime: null,
      };
    }
  });

  const [cloudflareStatus, setCloudflareStatus] = useState<CloudflareStatusResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [bingWallpaperUrl, setBingWallpaperUrl] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 弹窗状态
  const [isCloudflareModalOpen, setIsCloudflareModalOpen] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [isWidgetsDrawerOpen, setIsWidgetsDrawerOpen] = useState(false);
  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false);
  const [isDataManagementModalOpen, setIsDataManagementModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkItem | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // 轻量级 Toast 提示
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  // 白天/黑夜切换
  const handleToggleThemeMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('mtab_theme_mode', next ? 'dark' : 'light');
      } catch {}
      setConfig((c) => ({
        ...c,
        theme: {
          ...c.theme,
          mode: next ? 'dark' : 'light',
          timeColor: next ? '#ffffff' : '#0f172a',
        },
      }));
      showToast(next ? '已切换至暗夜模式 🌙' : '已切换至白昼模式 ☀️');
      return next;
    });
  };

  // 监听滚动以控制置顶按钮显隐（不一直常驻显示）
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setShowScrollTop(scrollY > 120);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 一键置顶
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // 提取分类列表 (useMemo 性能优化)
  const categories = useMemo(() => {
    return Array.from(
      new Set(['全部', ...DEFAULT_CATEGORIES, ...bookmarks.map((b) => b.category).filter(Boolean)])
    );
  }, [bookmarks]);

  // 本地缓存持久化
  useEffect(() => {
    try {
      localStorage.setItem('mtab_config', JSON.stringify(config));
    } catch {}
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem('mtab_bookmarks', JSON.stringify(bookmarks));
    } catch {}
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem('mtab_notes', JSON.stringify(notes));
    } catch {}
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem('mtab_todos', JSON.stringify(todos));
    } catch {}
  }, [todos]);

  useEffect(() => {
    try {
      localStorage.setItem('mtab_cf_config', JSON.stringify(cloudflareConfig));
    } catch {}
  }, [cloudflareConfig]);

  // 配置变更保存与通知
  const handleSaveConfig = (newConfig: MtabConfig) => {
    if (newConfig.autoLocalBackup !== config.autoLocalBackup) {
      showToast(
        newConfig.autoLocalBackup
          ? '已开启本地自动备份：书签或便签每次变更将自动保存 JSON 备份文件 💾'
          : '已关闭本地自动备份'
      );
    }
    setConfig(newConfig);
  };

  // 自动备份到本地：当开启 autoLocalBackup 时，每当书签、便签等核心数据发生变更，自动序列化完整 JSON 并下载到本地
  const isInitialMountRef = useRef(true);
  const prevBackupDataHashRef = useRef<string>('');

  useEffect(() => {
    // 构造比对指纹（仅比对实际业务数据，避免时间戳干扰）
    const dataHash = JSON.stringify({
      bookmarks,
      notes,
      todos,
      configTheme: config.theme,
      openInNewTab: config.openInNewTab,
    });

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevBackupDataHashRef.current = dataHash;
      return;
    }

    // 若数据无实质性变更，则跳过
    if (dataHash === prevBackupDataHashRef.current) {
      return;
    }

    prevBackupDataHashRef.current = dataHash;

    // 若未开启自动备份到本地，则不执行下载
    if (!config.autoLocalBackup) {
      return;
    }

    // 防抖 800ms 执行自动下载，避免频繁输入或连续编辑产生多个文件
    const timer = setTimeout(() => {
      try {
        const fullBackupPayload = {
          version: '1.0',
          exportTime: new Date().toISOString(),
          source: 'mtab_auto_backup',
          config,
          links: bookmarks,
          notes,
          todos,
        };

        const jsonStr = JSON.stringify(fullBackupPayload, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        a.href = url;
        a.download = `mtab-backup-auto-${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast(`💾 数据已变更，已自动保存本地备份文件！`);
      } catch (err) {
        console.error('Auto backup failed:', err);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [bookmarks, notes, todos, config]);

  // 初始化加载：测试连接、抓取 Bing 壁纸与天气
  useEffect(() => {
    testCloudflareConnection(cloudflareConfig).then((res) => {
      if (res.status) {
        setCloudflareStatus(res.status);
      }
    });

    // 获取 Bing 每日壁纸
    fetch('/api/bing-wallpaper')
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setBingWallpaperUrl(data.url);
        }
      })
      .catch(() => {});

    // 获取天气
    fetchWeather('北京');
  }, []);

  const fetchWeather = (city: string) => {
    fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.city) setWeatherData(data);
      })
      .catch(() => {});
  };

  // ========== 云端推送与拉取 ==========
  const handlePushData = async () => {
    setIsSyncing(true);
    try {
      const res = await pushAllData(cloudflareConfig, {
        config,
        links: bookmarks,
        notes,
        todos,
      });
      if (res.code === 1) {
        showToast('数据已成功同步至 Cloudflare！');
        setCloudflareConfig((prev) => ({ ...prev, lastSyncTime: Date.now() }));
      } else {
        showToast(`同步返回: ${res.msg}`);
      }
    } catch (e: any) {
      showToast(`同步失败: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullData = async () => {
    setIsSyncing(true);
    try {
      const res = await fetchAllData(cloudflareConfig);
      if (res.code === 1 && res.data) {
        if (res.data.config) setConfig(res.data.config);
        if (res.data.links && Array.isArray(res.data.links)) setBookmarks(res.data.links);
        if (res.data.notes && Array.isArray(res.data.notes)) setNotes(res.data.notes);
        if (res.data.todos && Array.isArray(res.data.todos)) setTodos(res.data.todos);
        showToast('已成功从 Cloudflare 恢复最新数据！');
      } else {
        showToast(`拉取返回: ${res.msg || '无数据'}`);
      }
    } catch (e: any) {
      showToast(`拉取失败: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // 书签操作
  const handleSaveBookmark = (item: BookmarkItem) => {
    const existsIndex = bookmarks.findIndex((b) => b.id === item.id);
    let updated: BookmarkItem[];
    if (existsIndex >= 0) {
      updated = [...bookmarks];
      updated[existsIndex] = item;
      showToast(`已更新快捷方式 "${item.name}"`);
    } else {
      updated = [item, ...bookmarks];
      showToast(`已添加快捷方式 "${item.name}"`);
    }
    setBookmarks(updated);

    if (cloudflareConfig.autoSync) {
      pushAllData(cloudflareConfig, { config, links: updated, notes, todos }).catch(() => {});
    }
  };

  const handleDeleteBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    showToast('快捷方式已删除');

    if (cloudflareConfig.autoSync) {
      pushAllData(cloudflareConfig, { config, links: updated, notes, todos }).catch(() => {});
    }
  };

  // 拖拽手动排序书签并实时保存至 localStorage
  const handleReorderBookmarks = (newBookmarks: BookmarkItem[]) => {
    setBookmarks(newBookmarks);
    try {
      localStorage.setItem('mtab_bookmarks', JSON.stringify(newBookmarks));
    } catch (e) {
      console.error('Failed to save reordered bookmarks to localStorage:', e);
    }
  };

  // 数据导入成功回调 (支持增量合并与完全覆盖、多级分类自动映射)
  const handleImportSuccess = (
    newBookmarks: BookmarkItem[],
    newConfig?: Partial<MtabConfig>,
    newNotes?: NoteItem[],
    newTodos?: TodoItem[],
    mode?: ImportMode
  ) => {
    setBookmarks(newBookmarks);
    setActiveCategory('全部');
    if (newConfig) {
      setConfig((prev) => ({
        ...prev,
        ...newConfig,
        theme: { ...prev.theme, ...(newConfig.theme || {}) },
      }));
    }
    if (newNotes && newNotes.length > 0) setNotes(newNotes);
    if (newTodos && newTodos.length > 0) setTodos(newTodos);

    showToast(
      mode === 'overwrite'
        ? `已完全覆盖导入 ${newBookmarks.length} 个书签与多级分类！`
        : `已增量合并导入，当前共计 ${newBookmarks.length} 个书签！`
    );

    if (cloudflareConfig.workerUrl && cloudflareConfig.autoSync) {
      pushAllData(cloudflareConfig, {
        config: newConfig ? { ...config, ...newConfig } : config,
        links: newBookmarks,
        notes: newNotes || notes,
        todos: newTodos || todos,
      }).catch(() => {});
    }
  };

  // 导出数据
  const handleExportData = () => {
    setIsDataManagementModalOpen(true);
  };

  const handleTriggerImport = () => {
    setIsDataManagementModalOpen(true);
  };

  // 计算当前生效的壁纸图片
  const getBackgroundUrl = () => {
    if (config.theme.wallpaperType === 'bing') {
      return bingWallpaperUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80';
    }
    if (config.theme.wallpaperUrl) {
      return config.theme.wallpaperUrl;
    }
    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80';
  };

  return (
    <div
      className={`relative min-h-screen w-full overflow-x-hidden select-none font-sans flex flex-col justify-between transition-colors duration-500 ${
        isDarkMode ? 'text-white' : 'text-slate-900'
      }`}
      style={{
        ['--glass-blur' as any]: `${config.theme.glassBlur ?? 16}px`,
        ['--glass-opacity' as any]: `${config.theme.glassOpacity ?? 0.65}`,
        ['--glass-bg-dark' as any]: `rgba(15, 23, 42, ${config.theme.glassOpacity ?? 0.75})`,
        ['--glass-bg-light' as any]: `rgba(255, 255, 255, ${config.theme.glassOpacity ?? 0.85})`,
      }}
    >
      {/* 动态壁纸背景容器 */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-700 -z-20 pointer-events-none"
        style={{
          backgroundImage: `url(${getBackgroundUrl()})`,
          filter: `blur(${config.theme.blur || 0}px)`,
          transform: config.theme.blur ? 'scale(1.04)' : 'scale(1)', // 消除模糊边缘白边
        }}
      />

      {/* 遮罩层 (白天模式不改变壁纸与网页原始亮度，黑夜模式支持暗黑柔光遮罩) */}
      <div
        className="fixed inset-0 w-full h-full -z-10 pointer-events-none transition-colors duration-500"
        style={{
          backgroundColor: isDarkMode
            ? `rgba(0, 0, 0, ${config.theme.opacity ?? 0.3})`
            : 'transparent',
        }}
      />

      {/* 全局 Toast 通知 */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-neutral-900/90 text-amber-300 font-medium text-xs sm:text-sm shadow-2xl border border-amber-400/40 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200">
          {toastMessage}
        </div>
      )}

      {/* 主体内容 */}
      <div className="flex-1 flex flex-col items-center justify-start pb-28">
        {/* 顶部时钟、农历与操作栏 */}
        <HeaderClock
          config={config}
          cloudflareConfig={cloudflareConfig}
          cloudflareStatus={cloudflareStatus}
          isSyncing={isSyncing}
          isDarkMode={isDarkMode}
          onToggleThemeMode={handleToggleThemeMode}
          onOpenCloudflareModal={() => setIsCloudflareModalOpen(true)}
          onOpenWallpaperModal={() => setIsWallpaperModalOpen(true)}
          onOpenWidgetsDrawer={() => setIsWidgetsDrawerOpen(true)}
          weatherCity={weatherData?.city}
          weatherTemp={weatherData?.temp}
          weatherCondition={weatherData?.condition}
        />

        {/* 聚合搜索引擎栏 (包含本地检索、27+多引擎切换与分类) */}
        <SearchBar
          openInNewTab={config.openInNewTab}
          bookmarks={bookmarks}
          isDarkMode={isDarkMode}
          onSelectBookmark={(bm) => {
            if (config.openInNewTab) {
              window.open(bm.url, '_blank', 'noopener,noreferrer');
            } else {
              window.location.href = bm.url;
            }
          }}
        />

        {/* 书签网格与分类标签 */}
        <BookmarkGrid
          bookmarks={bookmarks}
          categories={categories}
          config={config}
          activeCategory={activeCategory}
          isDarkMode={isDarkMode}
          onSelectCategory={setActiveCategory}
          onOpenAddModal={() => {
            setEditingBookmark(null);
            setIsAddBookmarkModalOpen(true);
          }}
          onEditBookmark={(b) => {
            setEditingBookmark(b);
            setIsAddBookmarkModalOpen(true);
          }}
          onDeleteBookmark={handleDeleteBookmark}
          onReorderBookmarks={handleReorderBookmarks}
        />
      </div>

      {/* 底部 macOS 悬浮 Dock 工具栏 */}
      <DockBar
        isDarkMode={isDarkMode}
        onToggleThemeMode={handleToggleThemeMode}
        onOpenCloudflare={() => setIsCloudflareModalOpen(true)}
        onOpenDataManagement={() => setIsDataManagementModalOpen(true)}
        onOpenAddBookmark={() => {
          setEditingBookmark(null);
          setIsAddBookmarkModalOpen(true);
        }}
        onOpenWidgets={() => setIsWidgetsDrawerOpen(true)}
        onOpenWallpaper={() => setIsWallpaperModalOpen(true)}
        onExportData={handleExportData}
        onImportData={handleTriggerImport}
      />

      {/* 右下角悬浮操作组：白天/黑夜模式切换与一键置顶功能（统一圆形纯净毛玻璃按钮） */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
        {/* 白天/黑夜切换按钮（统一圆形纯净无描边毛玻璃） */}
        <button
          type="button"
          id="float-btn-toggle-theme"
          onClick={handleToggleThemeMode}
          className={`w-12 h-12 rounded-full flex items-center justify-center site-glass border-0 transition-all duration-200 cursor-pointer shadow-xl hover:scale-110 active:scale-95 ${
            isDarkMode
              ? 'site-glass-dark text-amber-300 shadow-black/40'
              : 'site-glass-light text-indigo-600 shadow-slate-900/15'
          }`}
          title={isDarkMode ? '切换至白昼模式 (白天)' : '切换至暗夜模式 (黑夜)'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* 右下角一键置顶功能（统一圆形纯净无描边毛玻璃，仅向下滚动后显现） */}
        <button
          type="button"
          id="float-btn-scroll-top"
          onClick={handleScrollToTop}
          className={`w-12 h-12 rounded-full flex items-center justify-center site-glass border-0 transition-all duration-200 cursor-pointer shadow-xl hover:scale-110 active:scale-95 ${
            showScrollTop
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-3 pointer-events-none hidden'
          } ${
            isDarkMode
              ? 'site-glass-dark text-white hover:text-amber-300 shadow-black/40'
              : 'site-glass-light text-slate-700 hover:text-amber-600 shadow-slate-900/15'
          }`}
          title="一键平滑置顶"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>

      {/* 模态弹窗组件（全部统一尺寸、圆角、背景与操作栏） */}
      <CloudflareModal
        isOpen={isCloudflareModalOpen}
        onClose={() => setIsCloudflareModalOpen(false)}
        cloudflareConfig={cloudflareConfig}
        onSaveCloudflareConfig={(cfg) => {
          setCloudflareConfig(cfg);
          showToast('Cloudflare 配置已更新');
          testCloudflareConnection(cfg).then((r) => {
            if (r.status) setCloudflareStatus(r.status);
          });
        }}
        onPushData={handlePushData}
        onPullData={handlePullData}
        isSyncing={isSyncing}
        isDarkMode={isDarkMode}
      />

      <WallpaperModal
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        bingWallpaperUrl={bingWallpaperUrl}
        onOpenDataManagement={() => setIsDataManagementModalOpen(true)}
        isDarkMode={isDarkMode}
      />

      <WidgetsDrawer
        isOpen={isWidgetsDrawerOpen}
        onClose={() => setIsWidgetsDrawerOpen(false)}
        notes={notes}
        todos={todos}
        onSaveNotes={setNotes}
        onSaveTodos={setTodos}
        weatherData={weatherData}
        onCityChange={fetchWeather}
        isDarkMode={isDarkMode}
      />

      <AddBookmarkModal
        isOpen={isAddBookmarkModalOpen}
        onClose={() => setIsAddBookmarkModalOpen(false)}
        onSave={handleSaveBookmark}
        editingItem={editingBookmark}
        categories={categories}
        isDarkMode={isDarkMode}
      />

      <DataManagementModal
        isOpen={isDataManagementModalOpen}
        onClose={() => setIsDataManagementModalOpen(false)}
        currentBookmarks={bookmarks}
        currentConfig={config}
        currentNotes={notes}
        currentTodos={todos}
        onImportSuccess={handleImportSuccess}
        onSaveConfig={handleSaveConfig}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
