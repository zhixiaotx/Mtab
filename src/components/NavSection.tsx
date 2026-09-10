import React, { useState, useEffect } from 'react';
import { Folder, FolderOpen, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { BookmarkItem, CategoryNode, MtabConfig } from '../types';
import { SortableBookmarkCard } from './SortableBookmarkCard';

interface NavSectionProps {
  categoryNode: CategoryNode;
  allBookmarks: BookmarkItem[];
  isDarkMode?: boolean;
  config: MtabConfig;
  copiedId: string | null;
  onCardClick: (e: React.MouseEvent, item: BookmarkItem) => void;
  onCopyLink: (e: React.MouseEvent, item: BookmarkItem) => void;
  onEditBookmark: (item: BookmarkItem) => void;
  onDeleteBookmark: (id: string) => void;
  level?: number;
  forceCollapsed?: boolean | null;
}

export const NavSection = React.memo<NavSectionProps>(({
  categoryNode,
  allBookmarks,
  isDarkMode = true,
  config,
  copiedId,
  onCardClick,
  onCopyLink,
  onEditBookmark,
  onDeleteBookmark,
  level = 1,
  forceCollapsed = null,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (forceCollapsed !== null) {
      setIsCollapsed(forceCollapsed);
    }
  }, [forceCollapsed]);

  // 属于当前层级精确分类的书签
  const directBookmarks = allBookmarks.filter((b) => {
    const pathStr = b.categoryPath && b.categoryPath.length > 0
      ? b.categoryPath.join(' / ')
      : b.category;
    return pathStr === categoryNode.fullPath;
  });

  const hasChildren = categoryNode.children && categoryNode.children.length > 0;
  
  // 若节点及其所有下级均无任何书签，隐藏该空小节
  if (categoryNode.count === 0 && directBookmarks.length === 0 && !hasChildren) {
    return null;
  }

  // 多级分类左侧微缩缩进样式 (无填充矩形/无竖导轨线)
  const indentClass = level > 1
    ? 'pl-3 sm:pl-4 sm:ml-2 my-3'
    : 'my-5';

  return (
    <section className={`w-full transition-all duration-200 ${indentClass}`}>
      {/* 多级分类小节头部与面包屑路径展示 */}
      <div className="flex items-center justify-between gap-3 mb-3 group/sec">
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="inline-flex items-center gap-2 cursor-pointer select-none py-1 transition-opacity hover:opacity-85"
        >
          <div className="flex items-center gap-1.5">
            {isCollapsed ? (
              <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
            ) : (
              <FolderOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            )}
          </div>

          {/* 层级 Tag 标记 */}
          {level > 1 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                isDarkMode ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-100 text-amber-800'
              }`}
            >
              L{level}
            </span>
          )}

          {/* 完整多级面包屑标题 */}
          <div className="flex items-center flex-wrap gap-1 text-sm sm:text-base font-bold">
            {categoryNode.categoryPath.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <span className={`text-xs mx-0.5 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                    /
                  </span>
                )}
                <span
                  className={
                    idx === categoryNode.categoryPath.length - 1
                      ? isDarkMode
                        ? 'text-amber-300 font-extrabold'
                        : 'text-amber-700 font-extrabold'
                      : isDarkMode
                      ? 'text-white/90 font-bold'
                      : 'text-slate-800 font-bold'
                  }
                >
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* 包含书签数量指示 */}
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              isDarkMode
                ? 'bg-white/10 text-white/80'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {categoryNode.count} 项
          </span>
        </div>
      </div>

      {/* 当前分类直属书签网格 (支持拖拽重排) */}
      {!isCollapsed && directBookmarks.length > 0 && (
        <SortableContext items={directBookmarks.map((b) => b.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 mb-2">
            {directBookmarks.map((item) => (
              <SortableBookmarkCard
                key={item.id}
                item={item}
                config={config}
                isDarkMode={isDarkMode}
                copiedId={copiedId}
                onCardClick={onCardClick}
                onCopyLink={onCopyLink}
                onEditBookmark={onEditBookmark}
                onDeleteBookmark={onDeleteBookmark}
              />
            ))}
          </div>
        </SortableContext>
      )}

      {/* 递归渲染子分类小节 */}
      {!isCollapsed && hasChildren && (
        <div className="space-y-3">
          {categoryNode.children.map((child) => (
            <NavSection
              key={child.id}
              categoryNode={child}
              allBookmarks={allBookmarks}
              isDarkMode={isDarkMode}
              config={config}
              copiedId={copiedId}
              onCardClick={onCardClick}
              onCopyLink={onCopyLink}
              onEditBookmark={onEditBookmark}
              onDeleteBookmark={onDeleteBookmark}
              level={level + 1}
              forceCollapsed={forceCollapsed}
            />
          ))}
        </div>
      )}
    </section>
  );
});

