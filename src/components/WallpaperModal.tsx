import React, { useState } from 'react';
import { X, Image, Sliders, Clock, Layout, Check, Sparkles, Database } from 'lucide-react';
import { MtabConfig } from '../types';
import { PRESET_WALLPAPERS } from '../data/defaultData';

interface WallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MtabConfig;
  onSaveConfig: (newConfig: MtabConfig) => void;
  bingWallpaperUrl?: string;
  onOpenDataManagement?: () => void;
  isDarkMode?: boolean;
}

export const WallpaperModal: React.FC<WallpaperModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  bingWallpaperUrl,
  onOpenDataManagement,
  isDarkMode = true,
}) => {
  const [activeTab, setActiveTab] = useState<'wallpaper' | 'visual' | 'clock'>('wallpaper');
  const [customUrl, setCustomUrl] = useState('');

  if (!isOpen) return null;

  const updateTheme = (partialTheme: Partial<MtabConfig['theme']>) => {
    onSaveConfig({
      ...config,
      theme: {
        ...config.theme,
        ...partialTheme,
      },
    });
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    updateTheme({
      wallpaperType: 'custom',
      wallpaperUrl: customUrl.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl max-h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 dark:text-slate-200 text-slate-800 ${
          isDarkMode
            ? 'bg-neutral-900/95 backdrop-blur-2xl shadow-black/60'
            : 'bg-white/95 backdrop-blur-2xl shadow-slate-900/20'
        }`}
      >
        {/* 统一顶部标题栏 */}
        <div
          className={`flex items-center justify-between p-5 sm:p-6 pb-4 border-b flex-shrink-0 ${
            isDarkMode ? 'border-white/10 bg-black/20' : 'border-slate-200/80 bg-slate-50/70'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                壁纸与个性化设置
              </h3>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                定制专属壁纸、高斯模糊、遮罩通透度及桌面时钟风格
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="关闭窗口"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 统一标签栏 */}
        <div
          className={`px-4 sm:px-6 py-2.5 border-b flex-shrink-0 ${
            isDarkMode ? 'border-white/10 bg-black/10' : 'border-slate-200/80 bg-slate-100/50'
          }`}
        >
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('wallpaper')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                activeTab === 'wallpaper'
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                  : isDarkMode
                  ? 'text-slate-300 hover:text-white hover:bg-white/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Image className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">壁纸图库</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('visual')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                activeTab === 'visual'
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                  : isDarkMode
                  ? 'text-slate-300 hover:text-white hover:bg-white/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sliders className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">模糊与遮罩</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('clock')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                activeTab === 'clock'
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                  : isDarkMode
                  ? 'text-slate-300 hover:text-white hover:bg-white/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">时钟与系统</span>
            </button>

            {onOpenDataManagement && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDataManagement();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 whitespace-nowrap shadow-sm active:scale-95 sm:ml-auto"
                title="前往数据管理中心（HTML / JSON 书签导入与导出）"
              >
                <Database className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">数据管理中心</span>
              </button>
            )}
          </div>
        </div>

        {/* 统一可滚动内容主体 */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
        {/* 1. 壁纸选择 */}
        {activeTab === 'wallpaper' && (
          <div className="space-y-4">
            {/* Bing 每日壁纸推荐卡片 */}
            <div
              onClick={() => updateTheme({ wallpaperType: 'bing', wallpaperUrl: bingWallpaperUrl || '' })}
              className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between group ${
                config.theme.wallpaperType === 'bing'
                  ? 'bg-amber-400/15 ring-2 ring-amber-400'
                  : isDarkMode
                  ? 'bg-white/5 hover:bg-white/10'
                  : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-12 rounded-xl overflow-hidden bg-cover bg-center shadow-inner flex-shrink-0"
                  style={{
                    backgroundImage: `url(${bingWallpaperUrl || 'https://cn.bing.com/th?id=OHR.BingWallpaper_ZH-CN.jpg'})`,
                  }}
                />
                <div>
                  <div className="font-semibold text-sm flex items-center gap-2">
                    <span>微软 Bing 每日 4K 高清壁纸</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 font-bold">
                      推荐
                    </span>
                  </div>
                  <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                    每日自动从 Bing 抓取官方高清风景美图
                  </div>
                </div>
              </div>
              {config.theme.wallpaperType === 'bing' && (
                <div className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-sm">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </div>

            {/* 精选预设壁纸 */}
            <div>
              <label className={`block text-xs font-semibold mb-2 ${isDarkMode ? 'text-white/70' : 'text-slate-700'}`}>
                精选主题壁纸
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_WALLPAPERS.map((wp) => (
                  <div
                    key={wp.id}
                    onClick={() => updateTheme({ wallpaperType: 'preset', wallpaperUrl: wp.url })}
                    className={`relative h-24 rounded-2xl overflow-hidden cursor-pointer group transition-all ${
                      config.theme.wallpaperUrl === wp.url ? 'ring-2 ring-amber-400 shadow-md' : 'hover:opacity-90'
                    }`}
                  >
                    <img
                      src={wp.url}
                      alt={wp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-xs font-medium text-white">{wp.name}</span>
                    </div>
                    {config.theme.wallpaperUrl === wp.url && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 自定义图片 URL */}
            <div className="pt-2">
              <label className={`block text-xs font-semibold mb-2 ${isDarkMode ? 'text-white/70' : 'text-slate-700'}`}>
                自定义壁纸图片 URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="输入任何以 https:// 开头的网络图片直链..."
                  className={`flex-1 px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all ${
                    isDarkMode
                      ? 'bg-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400/50'
                      : 'bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md active:scale-95"
                >
                  应用
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. 模糊与遮罩调整 */}
        {activeTab === 'visual' && (
          <div className="space-y-4">
            {/* 整站毛玻璃效果调节 */}
            <div
              className={`p-4 rounded-2xl space-y-4 ${
                isDarkMode ? 'bg-white/5' : 'bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    整站毛玻璃样式调节
                  </h4>
                  <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                    实时调节全站搜索栏、导航卡片、Dock胶囊栏及抽屉的磨砂通透感
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-500 font-semibold">
                  {config.theme.glassBlur ?? 16} px
                </span>
              </div>

              {/* 毛玻璃模糊强度滑块 */}
              <div>
                <div className={`flex items-center justify-between mb-1.5 text-xs ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
                  <span>毛玻璃模糊强度 (Backdrop Blur)</span>
                  <span className="text-amber-500 font-mono font-medium">{config.theme.glassBlur ?? 16} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="32"
                  step="1"
                  value={config.theme.glassBlur ?? 16}
                  onChange={(e) => updateTheme({ glassBlur: parseInt(e.target.value, 10) })}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className={`flex justify-between text-[11px] mt-1 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                  <span>完全通透 (0px)</span>
                  <span>轻透柔光 (8px)</span>
                  <span>经典磨砂 (16px)</span>
                  <span>深度雾面 (32px)</span>
                </div>
              </div>

              {/* 毛玻璃底色通透度滑块 */}
              <div>
                <div className={`flex items-center justify-between mb-1.5 text-xs ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
                  <span>毛玻璃表面底色通透度</span>
                  <span className="text-amber-500 font-mono font-medium">{Math.round((config.theme.glassOpacity ?? 0.65) * 100)} %</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={config.theme.glassOpacity ?? 0.65}
                  onChange={(e) => updateTheme({ glassOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className={`flex justify-between text-[11px] mt-1 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                  <span>晶莹透视 (10%)</span>
                  <span>舒适平衡 (65%)</span>
                  <span>纯净厚实 (95%)</span>
                </div>
              </div>

              {/* 快捷风格预设按钮 */}
              <div>
                <label className={`block text-[11px] mb-2 ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>
                  常用毛玻璃风格一键切换：
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: '清透灵动', blur: 8, opacity: 0.45 },
                    { label: '经典毛玻璃', blur: 16, opacity: 0.65 },
                    { label: '深度雾感', blur: 24, opacity: 0.85 },
                    { label: '超清无模糊', blur: 0, opacity: 0.9 },
                  ].map((preset) => {
                    const isSelected =
                      (config.theme.glassBlur ?? 16) === preset.blur &&
                      Math.abs((config.theme.glassOpacity ?? 0.65) - preset.opacity) < 0.05;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => updateTheme({ glassBlur: preset.blur, glassOpacity: preset.opacity })}
                        className={`px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                            : isDarkMode
                            ? 'bg-white/5 text-white/80 hover:bg-white/10'
                            : 'bg-white text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 背景模糊 */}
            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-xs font-semibold ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
                  壁纸背景高斯模糊
                </label>
                <span className="text-xs text-amber-500 font-mono font-medium">{config.theme.blur} px</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={config.theme.blur}
                onChange={(e) => updateTheme({ blur: parseInt(e.target.value, 10) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className={`flex justify-between text-[11px] mt-1 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                <span>高清锐利 (0px)</span>
                <span>轻度柔和 (10px)</span>
                <span>极简磨砂 (25px)</span>
              </div>
            </div>

            {/* 遮罩深度 */}
            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-xs font-semibold ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
                  暗色遮罩透明度
                </label>
                <span className="text-xs text-amber-500 font-mono font-medium">{Math.round(config.theme.opacity * 100)} %</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={config.theme.opacity}
                onChange={(e) => updateTheme({ opacity: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className={`flex justify-between text-[11px] mt-1 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                <span>完全通透 (0%)</span>
                <span>平衡 (30%)</span>
                <span>沉浸深色 (80%)</span>
              </div>
            </div>

            {/* 字体颜色 */}
            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
              <label className={`block text-xs font-semibold mb-2 ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
                时钟与字样主色调
              </label>
              <div className="flex items-center gap-3">
                {['#ffffff', '#fef08a', '#93c5fd', '#a7f3d0', '#fbcfe8'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateTheme({ timeColor: color })}
                    className={`w-8 h-8 rounded-full transition-transform cursor-pointer ${
                      config.theme.timeColor === color ? 'ring-2 ring-amber-400 scale-125' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. 时钟与布局设置 */}
        {activeTab === 'clock' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 24小时制 */}
              <div
                onClick={() => updateTheme({ time24: !config.theme.time24 })}
                className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                  isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">24 小时制显示</div>
                  <div className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                    关闭时切换为 12 小时制
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${config.theme.time24 ? 'bg-amber-400' : isDarkMode ? 'bg-white/20' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-neutral-950 transition-transform ${config.theme.time24 ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* 秒数显示 */}
              <div
                onClick={() => updateTheme({ timeSeconds: !config.theme.timeSeconds })}
                className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                  isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">显示精准秒钟</div>
                  <div className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                    在时钟右侧实时跳动
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${config.theme.timeSeconds ? 'bg-amber-400' : isDarkMode ? 'bg-white/20' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-neutral-950 transition-transform ${config.theme.timeSeconds ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* 农历与生肖 */}
              <div
                onClick={() => updateTheme({ timeLunar: !config.theme.timeLunar })}
                className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                  isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">农历与干支年显示</div>
                  <div className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                    显示中国传统农历月日
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${config.theme.timeLunar ? 'bg-amber-400' : isDarkMode ? 'bg-white/20' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-neutral-950 transition-transform ${config.theme.timeLunar ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* 新标签页打开链接 */}
              <div
                onClick={() => onSaveConfig({ ...config, openInNewTab: !config.openInNewTab })}
                className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                  isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">新标签页打开网址</div>
                  <div className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                    点击书签与搜索是否新开窗口
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${config.openInNewTab ? 'bg-amber-400' : isDarkMode ? 'bg-white/20' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-neutral-950 transition-transform ${config.openInNewTab ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* 自动备份到本地 */}
              <div
                onClick={() => onSaveConfig({ ...config, autoLocalBackup: !config.autoLocalBackup })}
                className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-colors sm:col-span-2 ${
                  isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <div className="pr-3">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <span>自动备份到本地 (Auto Backup)</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        config.autoLocalBackup
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isDarkMode
                          ? 'bg-white/10 text-white/50'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {config.autoLocalBackup ? '已启用 (变更即备份)' : '已关闭'}
                    </span>
                  </div>
                  <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                    每当书签、分类或便签发生变更时，自动将完整 JSON 数据序列化并下载到本地文件，防止意外数据丢失
                  </div>
                </div>
                <div
                  className={`w-10 h-6 rounded-full p-1 transition-colors flex-shrink-0 ${
                    config.autoLocalBackup ? 'bg-amber-400' : isDarkMode ? 'bg-white/20' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-neutral-950 transition-transform ${
                      config.autoLocalBackup ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* 卡片圆角 */}
            <div className="pt-2">
              <label className={`block text-xs font-semibold mb-2 ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
                卡片圆角样式
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'md', label: '轻微圆角' },
                  { id: 'lg', label: '标准圆角' },
                  { id: 'full', label: '胶囊椭圆' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateTheme({ iconRadius: item.id as any })}
                    className={`py-2.5 text-xs rounded-xl font-medium cursor-pointer transition-all ${
                      config.theme.iconRadius === item.id
                        ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                        : isDarkMode
                        ? 'bg-white/5 text-white/80 hover:bg-white/10'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>

        {/* 统一模态底部固定操作栏 */}
        <div
          className={`flex items-center justify-end gap-3 p-4 sm:p-5 border-t flex-shrink-0 ${
            isDarkMode ? 'border-white/10 bg-black/20' : 'border-slate-200/80 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-sm font-semibold transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
