import React, { useState } from 'react';
import { Folder, FolderOpen } from 'lucide-react';
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
}

export const NavSection: React.FC<NavSectionProps> = ({
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
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 属于当前层级精确分类的书签
  const directBookmarks = allBookmarks.filter((b) => {
    const pathStr = b.categoryPath && b.categoryPath.length > 0
      ? b.categoryPath.join(' / ')
      : b.category;
    return pathStr === categoryNode.fullPath;
  });

  const hasChildren = categoryNode.children && categoryNode.children.length > 0;
  if (directBookmarks.length === 0 && !hasChildren) {
    return null;
  }

  // 计算层级缩进
  const indentClass = level > 1 ? 'ml-0 sm:ml-4 pl-3' : '';

  return (
    <section className={`w-full my-5 transition-all duration-200 ${indentClass}`}>
      {/* 多级分类小节头部与面包屑路径展示 */}
      <div className="flex items-center justify-between gap-3 mb-3.5 group/sec">
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="inline-flex items-center gap-2 cursor-pointer select-none py-1 transition-opacity hover:opacity-80"
        >
          {isCollapsed ? (
            <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
          ) : (
            <FolderOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
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
                      ? 'text-white font-bold'
                      : 'text-slate-900 font-bold'
                  }
                >
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* 当前分类直属书签网格 (支持拖拽重排) */}
      {!isCollapsed && directBookmarks.length > 0 && (
        <SortableContext items={directBookmarks.map((b) => b.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 mb-4">
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
            />
          ))}
        </div>
      )}
    </section>
  );
};
