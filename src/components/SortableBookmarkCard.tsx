import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, Check, Pencil, Trash2, GripVertical } from 'lucide-react';
import { BookmarkItem, MtabConfig } from '../types';
import { IconRenderer } from './IconRenderer';

interface SortableBookmarkCardProps {
  item: BookmarkItem;
  config: MtabConfig;
  isDarkMode?: boolean;
  copiedId: string | null;
  onCardClick: (e: React.MouseEvent, item: BookmarkItem) => void;
  onCopyLink: (e: React.MouseEvent, item: BookmarkItem) => void;
  onEditBookmark: (item: BookmarkItem) => void;
  onDeleteBookmark: (id: string) => void;
  isOverlay?: boolean;
}

export const SortableBookmarkCard: React.FC<SortableBookmarkCardProps> = ({
  item,
  config,
  isDarkMode = true,
  copiedId,
  onCardClick,
  onCopyLink,
  onEditBookmark,
  onDeleteBookmark,
  isOverlay = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: isOverlay });

  const isBanner = item.size === '1x2';
  const isLarge = item.size === '2x2';

  const getRadiusClass = () => {
    switch (config.theme?.iconRadius) {
      case 'md': return 'rounded-xl';
      case 'full': return 'rounded-full';
      default: return 'rounded-2xl';
    }
  };

  const style: React.CSSProperties = isOverlay
    ? {
        cursor: 'grabbing',
        transform: 'scale(1.04)',
        boxShadow: isDarkMode
          ? '0 20px 30px -10px rgba(0, 0, 0, 0.7), 0 0 15px rgba(251, 191, 36, 0.3)'
          : '0 20px 30px -10px rgba(15, 23, 42, 0.25), 0 0 15px rgba(245, 158, 11, 0.3)',
      }
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
      };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (!isDragging && !isOverlay) {
          onCardClick(e, item);
        }
      }}
      className={`group relative flex items-center gap-3 p-3.5 site-glass border-0 transition-all duration-200 cursor-pointer select-none ${
        isOverlay ? 'ring-2 ring-amber-400 z-50' : 'hover:-translate-y-0.5 hover:scale-[1.02] shadow-lg hover:shadow-2xl'
      } ${getRadiusClass()} ${
        isDarkMode
          ? 'bg-black/40 hover:bg-black/55 text-white shadow-black/30'
          : 'bg-white/60 hover:bg-white/80 text-slate-800 shadow-slate-900/10'
      } ${isBanner ? 'col-span-2 sm:col-span-2' : isLarge ? 'col-span-2 row-span-2' : ''}`}
    >
      {/* 拖拽把手微提示 (悬停时微现) */}
      <div
        className={`absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none hidden sm:block ${
          isDarkMode ? 'text-white/40' : 'text-slate-400'
        }`}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Logo 图标 (居左，无矩形填充，纯净品牌原标) */}
      <div
        className="w-10 h-10 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 drop-shadow-sm"
        style={{ color: item.bgColor || (isDarkMode ? '#fbbf24' : '#2563eb') }}
      >
        <IconRenderer name={item.icon} url={item.url} size={26} fallbackText={item.name} />
      </div>

      {/* 网址名称与描述 (Logo 右边) */}
      <div className="flex-1 min-w-0 overflow-hidden text-left pr-2">
        <div
          className={`text-sm font-semibold truncate transition-colors ${
            isDarkMode ? 'text-white group-hover:text-amber-300' : 'text-slate-900 group-hover:text-amber-600'
          }`}
          title={item.name}
        >
          {item.name}
        </div>
        <div
          className={`text-[11px] truncate mt-0.5 transition-colors ${
            isDarkMode ? 'text-white/60 group-hover:text-white/80' : 'text-slate-500 group-hover:text-slate-700'
          }`}
          title={item.description || item.url}
        >
          {item.description ? item.description : item.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
        </div>
      </div>

      {/* 悬停快捷操作按钮组 (复制/编辑/删除) */}
      {!isOverlay && (
        <div
          className={`absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity site-glass px-1.5 py-0.5 rounded-lg border-0 z-10 shadow-lg ${
            isDarkMode
              ? 'bg-black/80 text-white/70 shadow-black/40'
              : 'bg-white/90 text-slate-600 shadow-slate-900/15'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => onCopyLink(e, item)}
            className="p-1 hover:text-amber-500 transition-colors cursor-pointer"
            title={copiedId === item.id ? '已复制链接' : '复制网址'}
          >
            {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditBookmark(item);
            }}
            className="p-1 hover:text-amber-500 transition-colors cursor-pointer"
            title="编辑"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`确定删除快捷方式 "${item.name}" 吗？`)) {
                onDeleteBookmark(item.id);
              }
            }}
            className="p-1 hover:text-rose-500 transition-colors cursor-pointer"
            title="删除"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
