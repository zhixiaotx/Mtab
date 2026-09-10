import React, { useState, useMemo } from 'react';
import {
  Plus, ChevronRight, FolderTree, LayoutGrid
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { BookmarkItem, MtabConfig, CategoryNode } from '../types';
import { NavSection } from './NavSection';
import { SortableBookmarkCard } from './SortableBookmarkCard';
import { buildCategoryTree } from '../utils/bookmarkParser';

interface BookmarkGridProps {
  bookmarks: BookmarkItem[];
  categories: string[];
  config: MtabConfig;
  activeCategory: string;
  isDarkMode?: boolean;
  onSelectCategory: (category: string) => void;
  onOpenAddModal: () => void;
  onEditBookmark: (bookmark: BookmarkItem) => void;
  onDeleteBookmark: (id: string) => void;
  onReorderBookmarks: (newBookmarks: BookmarkItem[]) => void;
}

export const BookmarkGrid: React.FC<BookmarkGridProps> = ({
  bookmarks,
  categories,
  config,
  activeCategory,
  isDarkMode = true,
  onSelectCategory,
  onOpenAddModal,
  onEditBookmark,
  onDeleteBookmark,
  onReorderBookmarks,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'section' | 'grid'>('section'); // 默认多级小节视图
  const [activeDragItem, setActiveDragItem] = useState<BookmarkItem | null>(null);

  // 配置拖拽传感器，设置移动激活阈值，防止误触发影响正常点击/编辑
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6, // 鼠标轻移 6px 后激活拖拽，正常点击不受任何影响
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 移动端长按 200ms 激活拖拽
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 构建多级分类树
  const categoryTree = useMemo(() => buildCategoryTree(bookmarks), [bookmarks]);

  // 根据分类过滤平铺书签
  const filteredBookmarks = useMemo(() => {
    if (activeCategory === '全部') return bookmarks;
    return bookmarks.filter((b) => {
      const bPath = b.categoryPath ? b.categoryPath.join(' / ') : b.category;
      return bPath === activeCategory || bPath.startsWith(activeCategory + ' / ');
    });
  }, [bookmarks, activeCategory]);

  // 获取当前选中分类下的子分类节点（用于二级快捷筛选胶囊）
  const activeSubCategories = useMemo(() => {
    if (activeCategory === '全部') return [];
    function findNode(nodes: CategoryNode[]): CategoryNode | null {
      for (const n of nodes) {
        if (n.fullPath === activeCategory) return n;
        const sub = findNode(n.children);
        if (sub) return sub;
      }
      return null;
    }
    const found = findNode(categoryTree);
    return found ? found.children : [];
  }, [activeCategory, categoryTree]);

  // 复制链接
  const handleCopyLink = (e: React.MouseEvent, item: BookmarkItem) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(item.url).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // 点击卡片跳转
  const handleCardClick = (e: React.MouseEvent, item: BookmarkItem) => {
    if (config.openInNewTab) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = item.url;
    }
  };

  // 根据配置计算尺寸样式
  const getRadiusClass = () => {
    switch (config.theme?.iconRadius) {
      case 'md': return 'rounded-xl';
      case 'full': return 'rounded-full';
      default: return 'rounded-2xl';
    }
  };

  // 当前待递归渲染的小节列表
  const sectionsToRender = useMemo(() => {
    if (activeCategory === '全部') return categoryTree;
    function findSubTree(nodes: CategoryNode[]): CategoryNode[] {
      for (const n of nodes) {
        if (n.fullPath === activeCategory) return [n];
        const res = findSubTree(n.children);
        if (res.length > 0) return res;
      }
      return [];
    }
    const sub = findSubTree(categoryTree);
    return sub.length > 0 ? sub : categoryTree;
  }, [activeCategory, categoryTree]);

  // 拖拽开始事件
  const handleDragStart = (event: DragStartEvent) => {
    const item = bookmarks.find((b) => b.id === event.active.id);
    if (item) {
      setActiveDragItem(item);
    }
  };

  // 拖拽结束：根据拖拽源和目标位置重新排序并实时保存
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    const oldIndex = bookmarks.findIndex((b) => b.id === activeId);
    const newIndex = bookmarks.findIndex((b) => b.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const updatedBookmarks = arrayMove(bookmarks, oldIndex, newIndex);
      onReorderBookmarks(updatedBookmarks);
    }
  };

  return (
    <div className="w-full max-w-7xl px-4 sm:px-6 my-2 relative z-10">
      {/* 顶部一级分类标签导航栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        {/* 一级分类滑动条 */}
        <div className="overflow-x-auto pb-1 scrollbar-none flex-1">
          <div
            className={`inline-flex items-center gap-1.5 p-1 rounded-2xl site-glass border-0 shadow-lg ${
              isDarkMode ? 'bg-black/40 shadow-black/30' : 'bg-white/60 shadow-slate-900/10'
            }`}
          >
            {/* 全部选项 */}
            <button
              type="button"
              onClick={() => onSelectCategory('全部')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === '全部'
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow-md'
                  : isDarkMode
                  ? 'text-white/75 hover:text-white hover:bg-white/10'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-black/5'
              }`}
            >
              <span>全部</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === '全部'
                    ? 'bg-neutral-950/20 text-neutral-900'
                    : isDarkMode
                    ? 'bg-white/10 text-white/60'
                    : 'bg-black/5 text-slate-600'
                }`}
              >
                {bookmarks.length}
              </span>
            </button>

            {/* 顶层树分类节点标签 */}
            {categoryTree.map((catNode) => {
              const isActive = activeCategory === catNode.fullPath || activeCategory.startsWith(catNode.fullPath + ' / ');
              return (
                <button
                  key={catNode.id}
                  type="button"
                  onClick={() => onSelectCategory(catNode.fullPath)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-400 text-neutral-950 font-bold shadow-md'
                      : isDarkMode
                      ? 'text-white/75 hover:text-white hover:bg-white/10'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-black/5'
                  }`}
                >
                  <span>{catNode.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-neutral-950/20 text-neutral-900'
                        : isDarkMode
                        ? 'bg-white/10 text-white/60'
                        : 'bg-black/5 text-slate-600'
                    }`}
                  >
                    {catNode.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 右侧视图切换与添加书签操作 */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
          {/* 模式切换：多级小节 (NavSection) / 紧凑平铺 (Grid) */}
          <div
            className={`flex items-center p-1 rounded-xl site-glass border-0 text-xs shadow-md ${
              isDarkMode ? 'bg-black/40 text-white/70 shadow-black/30' : 'bg-white/60 text-slate-700 shadow-slate-900/10'
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode('section')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'section'
                  ? 'bg-amber-400 text-neutral-950 font-semibold'
                  : 'hover:text-amber-400'
              }`}
              title="多级分类递归小节展示"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">多级小节</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-400 text-neutral-950 font-semibold'
                  : 'hover:text-amber-400'
              }`}
              title="扁平网格视图"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">平铺网格</span>
            </button>
          </div>

          {/* 添加书签快捷入口 */}
          <button
            id="btn-add-bookmark"
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>添加网站</span>
          </button>
        </div>
      </div>

      {/* 二级子分类筛选横栏 (当选中分类存在子分类时展示) */}
      {activeSubCategories.length > 0 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none animate-in fade-in duration-200">
          <span className={`text-xs flex items-center gap-1 pl-1 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
            <span>子分类</span>
            <ChevronRight className="w-3 h-3" />
          </span>
          {activeSubCategories.map((subNode) => (
            <button
              key={subNode.id}
              type="button"
              onClick={() => onSelectCategory(subNode.fullPath)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap border ${
                activeCategory === subNode.fullPath
                  ? 'bg-amber-400/90 text-neutral-950 font-bold border-amber-400'
                  : isDarkMode
                  ? 'bg-black/20 text-white/70 border-white/10 hover:bg-white/10'
                  : 'bg-white/60 text-slate-700 border-slate-200 hover:bg-white'
              }`}
            >
              <span>{subNode.name}</span>
              <span className="text-[10px] opacity-70">({subNode.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* 拖拽排序上下文包裹容器 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* 视图展现 1: 多级分类递归渲染 (NavSection 结构) */}
        {viewMode === 'section' ? (
          <div className="w-full">
            {sectionsToRender.map((node) => (
              <NavSection
                key={node.id}
                categoryNode={node}
                allBookmarks={bookmarks}
                isDarkMode={isDarkMode}
                config={config}
                copiedId={copiedId}
                onCardClick={handleCardClick}
                onCopyLink={handleCopyLink}
                onEditBookmark={onEditBookmark}
                onDeleteBookmark={onDeleteBookmark}
              />
            ))}

            {/* 若当前分类下暂无书签，展示添加引导 */}
            {filteredBookmarks.length === 0 && (
              <div
                onClick={onOpenAddModal}
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl cursor-pointer my-6 transition-all ${
                  isDarkMode
                    ? 'border-white/15 hover:border-amber-400 text-white/50 hover:text-amber-300 bg-black/20'
                    : 'border-slate-200 hover:border-amber-500 text-slate-400 hover:text-amber-600 bg-white/40'
                }`}
              >
                <Plus className="w-8 h-8 mb-2 stroke-[1.5]" />
                <div className="text-sm font-semibold">该分类下暂无快捷导航</div>
                <div className="text-xs opacity-60 mt-1">点击此处快速添加该分类书签</div>
              </div>
            )}
          </div>
        ) : (
          /* 视图展现 2: 扁平网格卡片容器 (支持拖拽排序) */
          <SortableContext items={filteredBookmarks.map((b) => b.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 my-3">
              {filteredBookmarks.map((item) => (
                <SortableBookmarkCard
                  key={item.id}
                  item={item}
                  config={config}
                  isDarkMode={isDarkMode}
                  copiedId={copiedId}
                  onCardClick={handleCardClick}
                  onCopyLink={handleCopyLink}
                  onEditBookmark={onEditBookmark}
                  onDeleteBookmark={onDeleteBookmark}
                />
              ))}

              {/* 占位空添加卡片 */}
              <div
                onClick={onOpenAddModal}
                className={`flex items-center justify-center gap-2 p-3.5 border-2 border-dashed backdrop-blur-md transition-all duration-200 cursor-pointer min-h-[68px] ${getRadiusClass()} ${
                  isDarkMode
                    ? 'border-white/20 hover:border-amber-400/70 hover:bg-black/25 text-white/60 hover:text-amber-300'
                    : 'border-slate-300 hover:border-amber-500 hover:bg-white/60 text-slate-500 hover:text-amber-600'
                }`}
              >
                <Plus className="w-5 h-5 stroke-[2]" />
                <span className="text-xs font-medium">添加网站</span>
              </div>
            </div>
          </SortableContext>
        )}

        {/* 拖拽浮层预览卡片 */}
        <DragOverlay>
          {activeDragItem ? (
            <SortableBookmarkCard
              item={activeDragItem}
              config={config}
              isDarkMode={isDarkMode}
              copiedId={copiedId}
              onCardClick={() => {}}
              onCopyLink={() => {}}
              onEditBookmark={() => {}}
              onDeleteBookmark={() => {}}
              isOverlay={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
