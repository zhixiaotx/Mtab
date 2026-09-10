import React from 'react';
import {
  Cloud, Plus, LayoutGrid, Palette, Download, Upload, Database
} from 'lucide-react';

interface DockBarProps {
  isDarkMode?: boolean;
  onToggleThemeMode?: () => void;
  onOpenCloudflare: () => void;
  onOpenAddBookmark: () => void;
  onOpenWidgets: () => void;
  onOpenWallpaper: () => void;
  onOpenDataManagement?: () => void;
  onExportData?: () => void;
  onImportData?: () => void;
}

export const DockBar: React.FC<DockBarProps> = ({
  isDarkMode = true,
  onToggleThemeMode,
  onOpenCloudflare,
  onOpenAddBookmark,
  onOpenWidgets,
  onOpenWallpaper,
  onOpenDataManagement,
  onExportData,
  onImportData,
}) => {
  const btnBase = `group relative p-2 sm:p-2.5 rounded-full transition-all cursor-pointer hover:scale-115 active:scale-95 flex-shrink-0 ${
    isDarkMode
      ? 'text-white/80 hover:text-amber-300 hover:bg-white/15'
      : 'text-slate-700 hover:text-amber-600 hover:bg-black/5'
  }`;

  const tooltipBase = 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-black/90 text-[11px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50 hidden sm:block';

  return (
    <nav aria-label="快捷工具栏" className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 select-none max-w-[96vw]">
      {/* 圆角矩形胶囊 Dock 栏 (毛玻璃质感，无矩形填充图标) */}
      <div
        className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full site-glass transition-all duration-200 overflow-x-auto scrollbar-none ${
          isDarkMode
            ? 'bg-neutral-950/75 border border-white/10 text-white shadow-2xl shadow-black/40'
            : 'bg-white/90 border border-slate-200/80 text-slate-800 shadow-xl shadow-slate-900/15'
        }`}
      >
        {/* Cloudflare 数据库与同步 */}
        <button
          id="dock-btn-cloudflare"
          onClick={onOpenCloudflare}
          className={btnBase}
          title="Cloudflare KV/D1 数据库与跨域设置"
        >
          <Cloud className="w-5 h-5" />
          <span className={tooltipBase}>
            Cloudflare 绑定
          </span>
        </button>

        {/* 数据管理中心 (HTML/JSON解析导入/导出/多级分类) */}
        {onOpenDataManagement && (
          <button
            id="dock-btn-data-management"
            onClick={onOpenDataManagement}
            className={btnBase}
            title="数据管理中心 (支持HTML书签与JSON导入、多级分类解析)"
          >
            <Database className="w-5 h-5" />
            <span className={tooltipBase}>
              数据管理与解析
            </span>
          </button>
        )}

        {/* 添加书签捷径 */}
        <button
          id="dock-btn-add"
          onClick={onOpenAddBookmark}
          className={btnBase}
          title="添加新书签"
        >
          <Plus className="w-5 h-5" />
          <span className={tooltipBase}>
            添加网站
          </span>
        </button>

        {/* 实用小工具 */}
        <button
          id="dock-btn-widgets"
          onClick={onOpenWidgets}
          className={btnBase}
          title="打开小工具抽屉 (待办、便签、木鱼、热搜)"
        >
          <LayoutGrid className="w-5 h-5" />
          <span className={tooltipBase}>
            组件抽屉
          </span>
        </button>

        {/* 外观与壁纸 */}
        <button
          id="dock-btn-wallpaper"
          onClick={onOpenWallpaper}
          className={btnBase}
          title="个性化壁纸与主题"
        >
          <Palette className="w-5 h-5" />
          <span className={tooltipBase}>
            外观壁纸
          </span>
        </button>

        <div className={`w-[1px] h-6 mx-1 ${isDarkMode ? 'bg-white/15' : 'bg-slate-300'}`} />

        {/* 导出备份 */}
        <button
          id="dock-btn-export"
          onClick={onOpenDataManagement || onExportData}
          className={`group relative p-2 sm:p-2.5 rounded-full transition-all cursor-pointer hover:scale-115 active:scale-95 flex-shrink-0 ${
            isDarkMode
              ? 'text-white/80 hover:text-white hover:bg-white/15'
              : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
          }`}
          title="数据导入与导出备份中心"
        >
          <Download className="w-5 h-5" />
          <span className={tooltipBase}>
            导出备份
          </span>
        </button>

        {/* 导入备份 */}
        <button
          id="dock-btn-import"
          onClick={onOpenDataManagement || onImportData}
          className={`group relative p-2 sm:p-2.5 rounded-full transition-all cursor-pointer hover:scale-115 active:scale-95 flex-shrink-0 ${
            isDarkMode
              ? 'text-white/80 hover:text-white hover:bg-white/15'
              : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
          }`}
          title="导入 HTML 书签或 JSON 配置文件"
        >
          <Upload className="w-5 h-5" />
          <span className={tooltipBase}>
            导入书签/配置
          </span>
        </button>
      </div>
    </nav>
  );
};
