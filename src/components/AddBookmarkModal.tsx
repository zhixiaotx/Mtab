import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Globe, Sparkles, Download, RefreshCw, Wand2 } from 'lucide-react';
import { BookmarkItem, IconSource } from '../types';
import { IconRenderer } from './IconRenderer';
import {
  suggestSiteName,
  getFaviconUrl,
  getFaviconSources,
  getHostname,
  getColorForString,
  iconSources,
} from '../utils/favicon';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookmark: BookmarkItem) => void;
  editingItem?: BookmarkItem | null;
  categories: string[];
  isDarkMode?: boolean;
}

const PRESET_ICONS = [
  'Globe', 'Github', 'Code', 'Cloud', 'Terminal', 'Server', 'FileText', 'Tv',
  'Music', 'Youtube', 'BookOpen', 'Flame', 'Compass', 'Layers', 'Folder', 'Cpu',
  'Database', 'Mail', 'Send', 'Heart', 'Shield', 'Zap', 'Star', 'Sparkles'
];

const PRESET_COLORS = [
  '#181717', '#2563EB', '#059669', '#DC2626', '#D97706', '#7C3AED',
  '#DB2777', '#0891B2', '#475569', '#F38020', '#00AEEC', '#0084FF'
];

export const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  categories,
  isDarkMode = true,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('常用');
  const [icon, setIcon] = useState('Globe');
  const [selectedSource, setSelectedSource] = useState<IconSource>('favicon_im');
  const [bgColor, setBgColor] = useState('#2563EB');
  const [size, setSize] = useState<'1x1' | '1x2' | '2x2'>('1x1');
  const [description, setDescription] = useState('');
  const [isFetchingLogo, setIsFetchingLogo] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setUrl(editingItem.url);
      setCategory(editingItem.category || '常用');
      setIcon(editingItem.icon || 'Globe');
      setBgColor(editingItem.bgColor || '#2563EB');
      setSize(editingItem.size || '1x1');
      setDescription(editingItem.description || '');
    } else {
      setName('');
      setUrl('');
      setCategory(categories[1] || '常用');
      setIcon('Globe');
      setBgColor('#2563EB');
      setSize('1x1');
      setDescription('');
    }
  }, [editingItem, isOpen, categories]);

  if (!isOpen) return null;

  // 当 URL 输入或失焦时，自动识别站点名称并获取高清 Logo
  const handleUrlBlur = () => {
    if (!url.trim()) return;
    const domain = getHostname(url);
    if (domain) {
      if (!name) {
        const suggested = suggestSiteName(url);
        if (suggested) setName(suggested);
      }
      // 如果当前是默认 Globe，自动设置为在线 Favicon
      if (!icon || icon === 'Globe') {
        const autoIcon = getFaviconUrl(url, selectedSource);
        setIcon(autoIcon);
      }
    }
  };

  // 一键智能自动获取高清 Logo 与识别名称
  const handleAutoFetchLogo = () => {
    if (!url.trim()) return;
    setIsFetchingLogo(true);
    const suggested = suggestSiteName(url);
    if (suggested && !name) {
      setName(suggested);
    }
    const autoIcon = getFaviconUrl(url, selectedSource);
    setIcon(autoIcon);
    setTimeout(() => {
      setIsFetchingLogo(false);
    }, 400);
  };

  // 切换抓取图标源
  const handleSelectSource = (src: IconSource) => {
    setSelectedSource(src);
    if (url.trim()) {
      const newIcon = getFaviconUrl(url, src);
      setIcon(newIcon);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    const item: BookmarkItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      name: name.trim(),
      url: finalUrl,
      category: category.trim() || '常用',
      icon: icon.trim() || 'Globe',
      bgColor,
      size,
      description: description.trim(),
      sort: editingItem?.sort ?? 999,
    };

    onSave(item);
    onClose();
  };

  const domain = getHostname(url);
  const sourceOptions = domain ? getFaviconSources(domain).slice(0, 6) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl max-h-[88vh] rounded-3xl site-glass border-0 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 dark:text-slate-200 text-slate-800 ${
          isDarkMode
            ? 'bg-neutral-900/90 shadow-black/60'
            : 'bg-white/90 shadow-slate-900/20'
        }`}
      >
        {/* 统一顶部标题栏 */}
        <div
          className={`flex items-center justify-between p-5 sm:p-6 pb-4 border-b flex-shrink-0 site-glass ${
            isDarkMode ? 'border-white/10 bg-black/30' : 'border-slate-200/80 bg-white/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {editingItem ? '编辑快捷方式' : '添加快捷方式'}
              </h3>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                支持自动提取网站 Logo、20+ 图标源切换、自定义色彩与卡片尺寸
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

        {/* 表单容器 */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* 统一滚动内容区 */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* 实时卡片预览 */}
            <div
              className={`p-3.5 rounded-2xl flex items-center justify-between border ${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <span className={`text-xs font-medium ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                卡片效果实时预览:
              </span>
              <div
                className={`flex items-center gap-3 p-3 rounded-2xl shadow-md transition-all ${
                  size === '1x2' ? 'w-56' : size === '2x2' ? 'w-40 h-40 flex-col justify-center' : 'w-44'
                }`}
                style={{ backgroundColor: `${bgColor}26` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-inner flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: bgColor }}
                >
                  <IconRenderer name={icon} url={url} size={20} fallbackText={name} />
                </div>
                <div className="overflow-hidden text-left flex-1 min-w-0">
                  <div
                    className={`text-sm font-semibold truncate ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {name || '网站名称'}
                  </div>
                  <div
                    className={`text-[11px] truncate mt-0.5 ${
                      isDarkMode ? 'text-white/60' : 'text-slate-500'
                    }`}
                  >
                    {description || domain || '快捷导航'}
                  </div>
                </div>
              </div>
            </div>

            {/* 网址输入 & 自动抓取按钮 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-xs font-medium ${isDarkMode ? 'text-white/70' : 'text-slate-700'}`}>
                  网址 URL *
                </label>
                {url && (
                  <button
                    type="button"
                    onClick={handleAutoFetchLogo}
                    disabled={isFetchingLogo}
                    className="flex items-center gap-1 text-[11px] text-amber-500 hover:text-amber-400 font-medium cursor-pointer transition-colors"
                  >
                    <Wand2 className={`w-3 h-3 ${isFetchingLogo ? 'animate-spin' : ''}`} />
                    <span>自动提取名称与高清Logo</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="例如: https://github.com"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all ${
                  isDarkMode
                    ? 'bg-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400/50'
                    : 'bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/50'
                }`}
              />
            </div>

            {/* 网站名称 */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-white/70' : 'text-slate-700'}`}>
                网站名称 *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如: GitHub"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all ${
                  isDarkMode
                    ? 'bg-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400/50'
                    : 'bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/50'
                }`}
              />
            </div>

            {/* 自动获取 Logo 源快速选择 */}
            {domain && (
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-white/70' : 'text-slate-700'}`}>
                  自动图标源 (点击即用)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { value: 'favicon_im', label: 'Favicon.im' },
                    { value: 'favicon_myhkw', label: 'MyHKW高速' },
                    { value: 'google', label: 'Google S2' },
                    { value: 'favicon_duckduckgo', label: 'DuckDuckGo' },
                    { value: 'clearbit', label: 'Clearbit' },
                    { value: 'favicon_baidu', label: '百度' },
                  ].map((s) => {
                    const testUrl = getFaviconUrl(url, s.value as IconSource);
                    const isSelected = icon === testUrl;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => handleSelectSource(s.value as IconSource)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                            : isDarkMode
                            ? 'bg-white/5 hover:bg-white/10 text-white/70'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <img
                          src={testUrl}
                          alt=""
                          className="w-5 h-5 object-contain mb-1 rounded"
                          onError={(e) => {
                            (e.target as HTMLElement).style.opacity = '0.3';
                          }}
                        />
                        <span className="text-[10px] truncate w-full">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 分类与卡片尺寸 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-white/70' : 'text-slate-700'}`}>
                  所属分类
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="例如: 常用、开发、工具"
                  list="category-suggestions"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all ${
                    isDarkMode
                      ? 'bg-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400/50'
                      : 'bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/50'
                  }`}
                />
                <datalist id="category-suggestions">
                  {categories.filter((c) => c !== '全部').map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-white/70' : 'text-slate-700'}`}>
                  卡片尺寸
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1x1', '1x2', '2x2'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`py-2.5 text-xs rounded-xl font-medium cursor-pointer transition-all ${
                        size === s
                          ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                          : isDarkMode
                          ? 'bg-white/10 text-white/80 hover:bg-white/15'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 主题底色快速选择 */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-white/70' : 'text-slate-700'}`}>
                卡片主题色
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBgColor(c)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                      bgColor === c ? 'scale-125 ring-2 ring-amber-400' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {bgColor === c && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-7 h-7 rounded-full bg-transparent border-0 cursor-pointer p-0"
                  title="自定义颜色"
                />
              </div>
            </div>

            {/* 预设图标选择 */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-white/70' : 'text-slate-700'}`}>
                图标或自定义图片链接
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="图标名、图片链接或 Emoji"
                className={`w-full mb-2 px-3.5 py-2 rounded-xl text-xs outline-none transition-all ${
                  isDarkMode
                    ? 'bg-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400/50'
                    : 'bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/50'
                }`}
              />
              <div
                className={`flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-2xl ${
                  isDarkMode ? 'bg-black/30' : 'bg-slate-100'
                }`}
              >
                {PRESET_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`p-2 rounded-xl cursor-pointer transition-all ${
                      icon === ic
                        ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                        : isDarkMode
                        ? 'bg-white/5 text-white/70 hover:bg-white/15'
                        : 'bg-white text-slate-700 hover:bg-slate-200'
                    }`}
                    title={ic}
                  >
                    <IconRenderer name={ic} size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* 简短描述 */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-white/70' : 'text-slate-700'}`}>
                功能说明 / 标签备注 (可选)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简短提示语..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all ${
                  isDarkMode
                    ? 'bg-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400/50'
                    : 'bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/50'
                }`}
              />
            </div>
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
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                isDarkMode ? 'bg-white/10 hover:bg-white/15 text-white/80' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-sm font-semibold transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
            >
              {editingItem ? '保存修改' : '确认添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
