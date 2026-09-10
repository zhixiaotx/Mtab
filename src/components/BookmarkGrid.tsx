import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  Plus, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, FolderTree, LayoutGrid, Search, X, Filter, Layers
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

  // 一级/父级分类展开与检索状态
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState<boolean>(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>('');
  const [showCategorySearch, setShowCategorySearch] = useState<boolean>(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // 多级子分类展平、深层嵌套与检索状态
  const [showAllLevelsSubCategories, setShowAllLevelsSubCategories] = useState<boolean>(false);
  const [isSubCategoriesExpanded, setIsSubCategoriesExpanded] = useState<boolean>(false);
  const [subCategorySearchQuery, setSubCategorySearchQuery] = useState<string>('');
  const [showSubCategorySearch, setShowSubCategorySearch] = useState<boolean>(false);
  const subCategoryScrollRef = useRef<HTMLDivElement>(null);

  // 多级小节全局展开/折叠控制
  const [globalSectionsCollapsed, setGlobalSectionsCollapsed] = useState<boolean | null>(null);

  // 配置拖拽传感器，设置移动激活阈值
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 构建多级分类树
  const categoryTree = useMemo(() => buildCategoryTree(bookmarks), [bookmarks]);

  // 根据分类搜索关键词筛选一级分类
  const filteredCategoryTree = useMemo(() => {
    if (!categorySearchQuery.trim()) return categoryTree;
    const q = categorySearchQuery.toLowerCase().trim();
    return categoryTree.filter((cat) => cat.name.toLowerCase().includes(q) || cat.fullPath.toLowerCase().includes(q));
  }, [categoryTree, categorySearchQuery]);

  // 面包屑多级路径生成
  const breadcrumbs = useMemo(() => {
    if (activeCategory === '全部') {
      return [{ name: '全部', fullPath: '全部' }];
    }
    const parts = activeCategory.split(' / ');
    const list: { name: string; fullPath: string }[] = [{ name: '全部', fullPath: '全部' }];
    let cur = '';
    parts.forEach((p) => {
      cur = cur ? `${cur} / ${p}` : p;
      list.push({ name: p, fullPath: cur });
    });
    return list;
  }, [activeCategory]);

  // 1. 获取直属子分类节点 (Direct Children)
  const directSubCategories = useMemo(() => {
    if (activeCategory === '全部') {
      // 当在"全部"模式时，汇总所有根分类下的子节点（Level 2）
      const list: CategoryNode[] = [];
      categoryTree.forEach((root) => {
        if (root.children && root.children.length > 0) {
          list.push(...root.children);
        }
      });
      return list;
    }

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

  // 2. 递归获取所有后代多级子分类节点 (All Descendant Levels: Level 2, Level 3, Level 4...)
  const allDescendantSubCategories = useMemo(() => {
    function collectAll(nodes: CategoryNode[]): CategoryNode[] {
      let res: CategoryNode[] = [];
      for (const node of nodes) {
        res.push(node);
        if (node.children && node.children.length > 0) {
          res.push(...collectAll(node.children));
        }
      }
      return res;
    }

    if (activeCategory === '全部') {
      let all: CategoryNode[] = [];
      categoryTree.forEach((root) => {
        if (root.children && root.children.length > 0) {
          all.push(...collectAll(root.children));
        }
      });
      return all;
    }

    function findNode(nodes: CategoryNode[]): CategoryNode | null {
      for (const n of nodes) {
        if (n.fullPath === activeCategory) return n;
        const sub = findNode(n.children);
        if (sub) return sub;
      }
      return null;
    }

    const found = findNode(categoryTree);
    return found && found.children ? collectAll(found.children) : [];
  }, [activeCategory, categoryTree]);

  // 综合计算当前展示的子分类列表 (受极细多级与搜索筛选控制)
  const displaySubCategories = useMemo(() => {
    const rawList = showAllLevelsSubCategories ? allDescendantSubCategories : directSubCategories;
    if (!subCategorySearchQuery.trim()) return rawList;
    const q = subCategorySearchQuery.toLowerCase().trim();
    return rawList.filter((s) => s.name.toLowerCase().includes(q) || s.fullPath.toLowerCase().includes(q));
  }, [showAllLevelsSubCategories, allDescendantSubCategories, directSubCategories, subCategorySearchQuery]);

  // 根据分类过滤平铺书签
  const filteredBookmarks = useMemo(() => {
    if (activeCategory === '全部') return bookmarks;
    return bookmarks.filter((b) => {
      const bPath = b.categoryPath ? b.categoryPath.join(' / ') : b.category;
      return bPath === activeCategory || bPath.startsWith(activeCategory + ' / ');
    });
  }, [bookmarks, activeCategory]);

  // 一级分类横栏左右滚动控制
  const handleScrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 260;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // 子分类横栏左右滚动控制
  const handleScrollSubCategories = (direction: 'left' | 'right') => {
    if (subCategoryScrollRef.current) {
      const scrollAmount = 260;
      subCategoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // 滚轮横向滚动支持
  const handleWheelScroll = (e: React.WheelEvent, target: 'category' | 'sub') => {
    const ref = target === 'category' ? categoryScrollRef : subCategoryScrollRef;
    const isExpanded = target === 'category' ? isCategoriesExpanded : isSubCategoriesExpanded;
    if (!isExpanded && ref.current) {
      if (e.deltaY !== 0) {
        ref.current.scrollLeft += e.deltaY;
      }
    }
  };

  // 复制链接 (Memoized)
  const handleCopyLink = useCallback((e: React.MouseEvent, item: BookmarkItem) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(item.url).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  // 点击卡片跳转 (Memoized)
  const handleCardClick = useCallback((e: React.MouseEvent, item: BookmarkItem) => {
    if (config.openInNewTab) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = item.url;
    }
  }, [config.openInNewTab]);

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

  // 拖拽开始与结束
  const handleDragStart = (event: DragStartEvent) => {
    const item = bookmarks.find((b) => b.id === event.active.id);
    if (item) setActiveDragItem(item);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);
    if (!over || active.id === over.id) return;

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
      {/* 1. 顶部一级分类标签导航栏 */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          {/* 左侧：一级分类标签滚动/展开区域 */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {!isCategoriesExpanded && (
              <button
                type="button"
                onClick={() => handleScrollCategories('left')}
                className={`p-1.5 rounded-xl site-glass border-0 transition-opacity cursor-pointer hidden sm:flex items-center justify-center flex-shrink-0 ${
                  isDarkMode ? 'site-glass-dark text-white/70 hover:text-white' : 'site-glass-light text-slate-700 hover:text-slate-950'
                }`}
                title="向左滚动"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <div
              ref={categoryScrollRef}
              onWheel={(e) => handleWheelScroll(e, 'category')}
              className={`flex-1 transition-all duration-300 ${
                isCategoriesExpanded ? 'overflow-visible' : 'overflow-x-auto scrollbar-none py-1'
              }`}
            >
              <div
                className={`p-1 rounded-2xl site-glass border-0 shadow-lg transition-all ${
                  isDarkMode ? 'site-glass-dark shadow-black/40' : 'site-glass-light shadow-slate-900/10'
                } ${
                  isCategoriesExpanded
                    ? 'flex flex-wrap items-center gap-1.5'
                    : 'inline-flex items-center gap-1.5 whitespace-nowrap'
                }`}
              >
                {/* 全部 */}
                <button
                  type="button"
                  onClick={() => onSelectCategory('全部')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    activeCategory === '全部'
                      ? 'bg-amber-400 text-neutral-950 font-bold shadow-md'
                      : isDarkMode
                      ? 'text-white/85 hover:text-white hover:bg-white/15'
                      : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  <span>全部</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      activeCategory === '全部'
                        ? 'bg-neutral-950/20 text-neutral-900'
                        : isDarkMode
                        ? 'bg-white/15 text-white/80'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {bookmarks.length}
                  </span>
                </button>

                {/* 一级父分类列表 */}
                {filteredCategoryTree.map((catNode) => {
                  const isActive = activeCategory === catNode.fullPath || activeCategory.startsWith(catNode.fullPath + ' / ');
                  return (
                    <button
                      key={catNode.id}
                      type="button"
                      onClick={() => onSelectCategory(catNode.fullPath)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                        isActive
                          ? 'bg-amber-400 text-neutral-950 font-bold shadow-md'
                          : isDarkMode
                          ? 'text-white/85 hover:text-white hover:bg-white/15'
                          : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100 font-semibold'
                      }`}
                    >
                      <span>{catNode.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                          isActive
                            ? 'bg-neutral-950/20 text-neutral-900'
                            : isDarkMode
                            ? 'bg-white/15 text-white/80'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {catNode.count}
                      </span>
                    </button>
                  );
                })}

                {filteredCategoryTree.length === 0 && (
                  <div className="text-xs px-3 py-1 opacity-60">未找到相关分类</div>
                )}
              </div>
            </div>

            {!isCategoriesExpanded && (
              <button
                type="button"
                onClick={() => handleScrollCategories('right')}
                className={`p-1.5 rounded-xl site-glass border-0 transition-opacity cursor-pointer hidden sm:flex items-center justify-center flex-shrink-0 ${
                  isDarkMode ? 'site-glass-dark text-white/70 hover:text-white' : 'site-glass-light text-slate-700 hover:text-slate-950'
                }`}
                title="向右滚动"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {categoryTree.length > 3 && (
              <button
                type="button"
                onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl site-glass border-0 text-xs font-semibold cursor-pointer transition-all flex-shrink-0 ${
                  isCategoriesExpanded
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-md'
                    : isDarkMode
                    ? 'site-glass-dark text-amber-300 hover:text-amber-200 hover:bg-white/10'
                    : 'site-glass-light text-amber-700 hover:text-amber-800 hover:bg-amber-50'
                }`}
                title={isCategoriesExpanded ? '收起为单行' : `展平全部 ${categoryTree.length} 个分类`}
              >
                <span>{isCategoriesExpanded ? '收起' : `展开 (${categoryTree.length})`}</span>
                {isCategoriesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}

            {categoryTree.length > 5 && (
              <button
                type="button"
                onClick={() => {
                  setShowCategorySearch(!showCategorySearch);
                  if (showCategorySearch) setCategorySearchQuery('');
                }}
                className={`p-1.5 rounded-xl site-glass border-0 transition-all cursor-pointer flex-shrink-0 ${
                  showCategorySearch || categorySearchQuery
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : isDarkMode
                    ? 'site-glass-dark text-white/70 hover:text-white'
                    : 'site-glass-light text-slate-700 hover:text-slate-950'
                }`}
                title="快速检索一级分类"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 右侧视图与小节展开快捷键 */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            {viewMode === 'section' && (
              <button
                type="button"
                onClick={() =>
                  setGlobalSectionsCollapsed(globalSectionsCollapsed === false ? true : false)
                }
                className={`px-2.5 py-1.5 rounded-xl site-glass border-0 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                  isDarkMode ? 'site-glass-dark text-white/80 hover:text-amber-300' : 'site-glass-light text-slate-700 hover:text-amber-800'
                }`}
                title="一键展开/折叠所有多级分类小节"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {globalSectionsCollapsed === false ? '全部折叠' : '全部展开'}
                </span>
              </button>
            )}

            <div
              className={`flex items-center p-1 rounded-xl site-glass border-0 text-xs shadow-md ${
                isDarkMode ? 'site-glass-dark text-white/80 shadow-black/30' : 'site-glass-light text-slate-800 shadow-slate-900/10'
              }`}
            >
              <button
                type="button"
                onClick={() => setViewMode('section')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'section' ? 'bg-amber-400 text-neutral-950 font-semibold' : 'hover:text-amber-400'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">多级小节</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-amber-400 text-neutral-950 font-semibold' : 'hover:text-amber-400'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">平铺网格</span>
              </button>
            </div>

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

        {showCategorySearch && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <div
              className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl site-glass border-0 text-xs shadow-inner ${
                isDarkMode ? 'site-glass-dark text-white' : 'site-glass-light text-slate-800'
              }`}
            >
              <Search className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
              <input
                type="text"
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                placeholder="快速检索父分类名称..."
                className="w-full bg-transparent border-0 outline-none text-xs"
                autoFocus
              />
              {categorySearchQuery && (
                <button
                  type="button"
                  onClick={() => setCategorySearchQuery('')}
                  className="opacity-60 hover:opacity-100 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. 多级分类面包屑全路径导航 */}
      {breadcrumbs.length > 1 && (
        <div className="flex items-center gap-1 mb-3 text-xs sm:text-sm font-semibold overflow-x-auto pb-1 scrollbar-none animate-in fade-in duration-150">
          <span className={`flex items-center gap-1 opacity-70 pl-1 mr-1 ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
            <Filter className="w-3.5 h-3.5" />
            <span>当前深度:</span>
          </span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.fullPath}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-40 flex-shrink-0" />}
              <button
                type="button"
                onClick={() => onSelectCategory(crumb.fullPath)}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === crumb.fullPath
                    ? 'bg-amber-400 text-neutral-950 font-extrabold shadow-sm'
                    : isDarkMode
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-slate-800 hover:text-slate-950 hover:bg-slate-200/60'
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* 3. 多级子分类全景完全展示面板 */}
      {(directSubCategories.length > 0 || allDescendantSubCategories.length > 0) && (
        <div className="flex flex-col gap-2 mb-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold flex items-center gap-1 ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                <FolderTree className="w-3.5 h-3.5" />
                <span>下级子分类 ({displaySubCategories.length})</span>
              </span>

              {/* 极细多层级切换 */}
              {allDescendantSubCategories.length > directSubCategories.length && (
                <button
                  type="button"
                  onClick={() => setShowAllLevelsSubCategories(!showAllLevelsSubCategories)}
                  className={`text-[11px] px-2 py-0.5 rounded-lg border-0 cursor-pointer font-semibold transition-all ${
                    showAllLevelsSubCategories
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : isDarkMode
                      ? 'bg-white/10 text-white/80 hover:bg-white/20'
                      : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                  }`}
                  title={showAllLevelsSubCategories ? '仅显示直接下级' : `包含所有 ${allDescendantSubCategories.length} 个深层子分类`}
                >
                  {showAllLevelsSubCategories ? '已包含所有极细深层' : `展开极细深层 (${allDescendantSubCategories.length})`}
                </button>
              )}
            </div>

            {/* 控制与检索按钮 */}
            <div className="flex items-center gap-1.5">
              {!isSubCategoriesExpanded && (
                <>
                  <button
                    type="button"
                    onClick={() => handleScrollSubCategories('left')}
                    className={`p-1 rounded-lg site-glass border-0 transition-opacity cursor-pointer hidden sm:flex items-center justify-center ${
                      isDarkMode ? 'site-glass-dark text-white/70 hover:text-white' : 'site-glass-light text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScrollSubCategories('right')}
                    className={`p-1 rounded-lg site-glass border-0 transition-opacity cursor-pointer hidden sm:flex items-center justify-center ${
                      isDarkMode ? 'site-glass-dark text-white/70 hover:text-white' : 'site-glass-light text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {/* 子分类展开多行全景按钮 */}
              {displaySubCategories.length > 2 && (
                <button
                  type="button"
                  onClick={() => setIsSubCategoriesExpanded(!isSubCategoriesExpanded)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border-0 text-xs font-semibold cursor-pointer transition-all ${
                    isSubCategoriesExpanded
                      ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                      : isDarkMode
                      ? 'site-glass-dark text-amber-300 hover:text-amber-200'
                      : 'site-glass-light text-amber-700 hover:text-amber-900'
                  }`}
                  title={isSubCategoriesExpanded ? '收起为单行' : '完全展平平铺所有子分类'}
                >
                  <span>{isSubCategoriesExpanded ? '收起子分类' : `全景平铺 (${displaySubCategories.length})`}</span>
                  {isSubCategoriesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* 子分类检索开关键 */}
              {displaySubCategories.length > 4 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowSubCategorySearch(!showSubCategorySearch);
                    if (showSubCategorySearch) setSubCategorySearchQuery('');
                  }}
                  className={`p-1 rounded-xl site-glass border-0 transition-all cursor-pointer ${
                    showSubCategorySearch || subCategorySearchQuery
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : isDarkMode
                      ? 'site-glass-dark text-white/70 hover:text-white'
                      : 'site-glass-light text-slate-700 hover:text-slate-950'
                  }`}
                  title="检索子分类"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 子分类搜索框 */}
          {showSubCategorySearch && (
            <div className="flex items-center gap-2 animate-in fade-in duration-150">
              <div
                className={`flex-1 flex items-center gap-2 px-3 py-1 rounded-xl site-glass border-0 text-xs shadow-inner ${
                  isDarkMode ? 'site-glass-dark text-white' : 'site-glass-light text-slate-800'
                }`}
              >
                <Search className="w-3 h-3 opacity-60 flex-shrink-0" />
                <input
                  type="text"
                  value={subCategorySearchQuery}
                  onChange={(e) => setSubCategorySearchQuery(e.target.value)}
                  placeholder="查找子分类名称..."
                  className="w-full bg-transparent border-0 outline-none text-xs"
                  autoFocus
                />
                {subCategorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setSubCategorySearchQuery('')}
                    className="opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 子分类列表容器 (支持单行滚动与多行完全展平) */}
          <div
            ref={subCategoryScrollRef}
            onWheel={(e) => handleWheelScroll(e, 'sub')}
            className={`transition-all duration-300 ${
              isSubCategoriesExpanded ? 'overflow-visible' : 'overflow-x-auto scrollbar-none py-1'
            }`}
          >
            <div
              className={`${
                isSubCategoriesExpanded
                  ? 'flex flex-wrap items-center gap-2 p-2 rounded-2xl site-glass border-0 shadow-lg'
                  : 'inline-flex items-center gap-1.5 whitespace-nowrap'
              }`}
            >
              {displaySubCategories.map((subNode) => {
                const isActive = activeCategory === subNode.fullPath;
                return (
                  <button
                    key={subNode.id}
                    type="button"
                    onClick={() => onSelectCategory(subNode.fullPath)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap flex-shrink-0 site-glass border-0 shadow-sm ${
                      isActive
                        ? 'bg-amber-400 text-neutral-950 font-extrabold shadow-md scale-105'
                        : isDarkMode
                        ? 'site-glass-dark text-white/90 font-medium hover:text-amber-300 hover:bg-white/15'
                        : 'site-glass-light text-slate-900 font-semibold hover:text-amber-700 hover:bg-slate-200'
                    }`}
                  >
                    {/* 深层层级指示 */}
                    {subNode.level > 2 && (
                      <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold bg-amber-400/30 text-amber-900 dark:text-amber-200">
                        L{subNode.level}
                      </span>
                    )}
                    <span>{showAllLevelsSubCategories ? subNode.fullPath : subNode.name}</span>
                    <span className="text-[10px] opacity-75 font-semibold">({subNode.count})</span>
                  </button>
                );
              })}

              {displaySubCategories.length === 0 && (
                <div className="text-xs px-3 py-1 opacity-60">未找到相关子分类</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. 拖拽排序上下文包裹容器与内容渲染 */}
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
                forceCollapsed={globalSectionsCollapsed}
              />
            ))}

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
          /* 视图展现 2: 扁平网格卡片容器 */
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

              <div
                onClick={onOpenAddModal}
                className={`flex items-center justify-center gap-2 p-3.5 border-2 border-dashed transition-all duration-200 cursor-pointer min-h-[68px] ${getRadiusClass()} ${
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

