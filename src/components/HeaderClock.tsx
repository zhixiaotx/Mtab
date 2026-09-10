import React, { useState, useEffect } from 'react';
import {
  Cloud, CheckCircle2, AlertCircle, RefreshCw, Palette, LayoutGrid,
  Maximize, Minimize, Sun, Moon
} from 'lucide-react';
import { CloudflareConfig, CloudflareStatusResponse, MtabConfig } from '../types';
import { getLunarInfo } from '../utils/lunar';

interface HeaderClockProps {
  config: MtabConfig;
  cloudflareConfig: CloudflareConfig;
  cloudflareStatus: CloudflareStatusResponse | null;
  isSyncing: boolean;
  isDarkMode?: boolean;
  onToggleThemeMode?: () => void;
  onOpenCloudflareModal: () => void;
  onOpenWallpaperModal: () => void;
  onOpenWidgetsDrawer: () => void;
  weatherCity?: string;
  weatherTemp?: number;
  weatherCondition?: string;
}

export const HeaderClock: React.FC<HeaderClockProps> = ({
  config,
  cloudflareConfig,
  cloudflareStatus,
  isSyncing,
  isDarkMode = true,
  onToggleThemeMode,
  onOpenCloudflareModal,
  onOpenWallpaperModal,
  onOpenWidgetsDrawer,
  weatherCity = '北京',
  weatherTemp = 24,
  weatherCondition = '晴',
}) => {
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const lunar = getLunarInfo(time);

  const hours = config.theme.time24
    ? String(time.getHours()).padStart(2, '0')
    : String(time.getHours() % 12 || 12).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const getDbLabel = () => {
    if (cloudflareConfig.workerUrl) {
      if (cloudflareStatus?.dbType === 'd1') return 'Cloudflare D1';
      if (cloudflareStatus?.dbType === 'kv') return 'Cloudflare KV';
      return 'Cloudflare Workers';
    }
    return '本地持久化';
  };

  const buttonBaseClass = `flex items-center gap-1.5 px-3 py-1.5 rounded-full site-glass border-0 text-xs font-medium shadow-md transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${
    isDarkMode
      ? 'bg-black/40 text-white/90 hover:bg-black/60 shadow-black/30'
      : 'bg-white/60 text-slate-800 hover:bg-white/80 shadow-slate-900/10'
  }`;

  return (
    <header className="w-full pt-8 pb-4 px-6 flex flex-col items-center select-none relative z-10 transition-all">
      {/* 顶部控制栏 */}
      <div className="w-full max-w-7xl flex items-center justify-between mb-8">
        {/* 左侧：Mtab 状态标识与 Cloudflare 绑定模式指示器 */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full site-glass border-0 text-xs font-medium shadow-md ${
              isDarkMode
                ? 'bg-black/40 text-white/90 shadow-black/30'
                : 'bg-white/60 text-slate-800 shadow-slate-900/10'
            }`}
          >
            <span className="font-bold tracking-wider text-amber-500">MTAB</span>
            <span className="opacity-40">|</span>
            <span>Cloudflare 二次开发版</span>
          </div>

          {/* Cloudflare 同步状态 Pill */}
          <button
            id="btn-open-cloudflare-status"
            onClick={onOpenCloudflareModal}
            className={`${buttonBaseClass} group`}
            title="点击管理 Cloudflare KV/D1 数据库绑定与同步"
          >
            <Cloud className={`w-3.5 h-3.5 ${cloudflareConfig.workerUrl ? 'text-amber-500' : 'text-sky-500'}`} />
            <span>{getDbLabel()}</span>
            {isSyncing ? (
              <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
            ) : cloudflareStatus?.cors ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded transition-colors ${
                isDarkMode
                  ? 'bg-white/15 text-white/70 group-hover:text-amber-300'
                  : 'bg-black/5 text-slate-700 group-hover:text-amber-600'
              }`}
            >
              CORS 就绪
            </span>
          </button>
        </div>

        {/* 右侧：快捷工具栏 */}
        <div className="flex items-center gap-2">
          {/* 白天/黑夜切换按钮 */}
          {onToggleThemeMode && (
            <button
              id="btn-header-toggle-theme"
              onClick={onToggleThemeMode}
              className={`${buttonBaseClass} px-2.5`}
              title={isDarkMode ? '切换至白昼模式' : '切换至暗夜模式'}
            >
              {isDarkMode ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span className="hidden sm:inline">{isDarkMode ? '白昼' : '暗夜'}</span>
            </button>
          )}

          {/* 天气小摘要 */}
          <button
            id="btn-weather-pill"
            onClick={onOpenWidgetsDrawer}
            className={`hidden sm:flex ${buttonBaseClass}`}
          >
            <span>{weatherCity}</span>
            <span className="font-semibold text-amber-500">{weatherTemp}°C</span>
            <span>{weatherCondition}</span>
          </button>

          {/* 插件组件库 */}
          <button
            id="btn-open-widgets"
            onClick={onOpenWidgetsDrawer}
            className={`${buttonBaseClass} hover:text-amber-500`}
            title="打开便签、待办、木鱼、全网热搜小组件"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden md:inline">小工具</span>
          </button>

          {/* 壁纸与外观 */}
          <button
            id="btn-open-wallpaper"
            onClick={onOpenWallpaperModal}
            className={`${buttonBaseClass} hover:text-amber-500`}
            title="切换壁纸与主题样式"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden md:inline">外观壁纸</span>
          </button>

          {/* 全屏切换 */}
          <button
            id="btn-toggle-fullscreen"
            onClick={toggleFullscreen}
            className={`p-1.5 rounded-full site-glass border-0 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-md ${
              isDarkMode
                ? 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white shadow-black/30'
                : 'bg-white/60 text-slate-700 hover:bg-white/80 hover:text-slate-950 shadow-slate-900/10'
            }`}
            title={isFullscreen ? '退出全屏' : '全屏沉浸'}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 中心时间与农历日期 */}
      <div className="flex flex-col items-center justify-center text-center">
        {/* 主时钟数字 */}
        <div
          className={`flex items-baseline font-light tracking-tight transition-colors duration-300 ${
            isDarkMode
              ? 'drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]'
              : 'drop-shadow-[0_2px_8px_rgba(255,255,255,0.9)]'
          }`}
          style={{ color: isDarkMode ? (config.theme.timeColor || '#ffffff') : (config.theme.timeColor === '#ffffff' ? '#0f172a' : config.theme.timeColor || '#0f172a') }}
        >
          <span className="text-6xl sm:text-7xl md:text-8xl font-semibold tracking-tight font-mono">
            {hours}:{minutes}
          </span>
          {config.theme.timeSeconds && (
            <span className="text-xl sm:text-2xl font-normal font-mono opacity-80 ml-2">
              :{seconds}
            </span>
          )}
        </div>

        {/* 农历与公历信息 */}
        {config.theme.timeLunar && (
          <div
            className={`mt-2.5 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold transition-colors ${
              isDarkMode
                ? 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'
                : 'text-slate-900 drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)]'
            }`}
          >
            <span>{lunar.solarStr}</span>
            <span className="opacity-50">·</span>
            <span>{lunar.weekStr}</span>
            <span className="opacity-50">·</span>
            <span className={isDarkMode ? 'text-amber-300 font-bold drop-shadow' : 'text-amber-700 font-bold'}>{lunar.monthDayStr}</span>
            <span className="opacity-50 hidden sm:inline">·</span>
            <span className="opacity-80 hidden sm:inline">{lunar.yearStr}</span>
          </div>
        )}
      </div>
    </header>
  );
};
