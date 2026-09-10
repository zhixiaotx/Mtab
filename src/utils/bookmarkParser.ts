import { BookmarkItem, CategoryNode, ImportMode, ImportParseResult, NoteItem, TodoItem, MtabConfig } from '../types';
import { getAutoFavicon, getHostname, suggestSiteName } from './favicon';

/**
 * 将平铺的书签列表根据 categoryPath 或 category 精确构建完整多级分类树
 */
export function buildCategoryTree(bookmarks: BookmarkItem[]): CategoryNode[] {
  interface InternalNode {
    name: string;
    fullPath: string;
    level: number;
    categoryPath: string[];
    childrenMap: Map<string, InternalNode>;
  }

  const rootMap = new Map<string, InternalNode>();

  bookmarks.forEach((item) => {
    // 提取并清洗分类路径数组
    let path: string[] = [];
    if (item.categoryPath && item.categoryPath.length > 0) {
      path = item.categoryPath.map((p) => String(p).trim()).filter(Boolean);
    } else if (item.category) {
      path = item.category.split(/[\/>\\]/).map((p) => p.trim()).filter(Boolean);
    }

    if (path.length === 0) {
      path = ['常用'];
    }

    // 规范化设置 item 上的属性
    item.categoryPath = [...path];
    item.category = path.join(' / ');

    let currentMap = rootMap;
    let accumulatedPath: string[] = [];

    path.forEach((part, index) => {
      accumulatedPath.push(part);
      const fullPath = accumulatedPath.join(' / ');

      let node = currentMap.get(part);
      if (!node) {
        node = {
          name: part,
          fullPath,
          level: index + 1,
          categoryPath: [...accumulatedPath],
          childrenMap: new Map<string, InternalNode>(),
        };
        currentMap.set(part, node);
      }
      currentMap = node.childrenMap;
    });
  });

  // 递归将 InternalNode 树转换为 CategoryNode 数组，并准确计算层级下包含的书签数量
  function convertToCategoryNodes(map: Map<string, InternalNode>): CategoryNode[] {
    return Array.from(map.values()).map((internalNode) => {
      const pathPrefix = internalNode.fullPath;

      const matchCount = bookmarks.filter((b) => {
        const bPath = b.categoryPath && b.categoryPath.length > 0
          ? b.categoryPath.join(' / ')
          : b.category;
        return bPath === pathPrefix || bPath.startsWith(pathPrefix + ' / ');
      }).length;

      const children = convertToCategoryNodes(internalNode.childrenMap);

      return {
        id: internalNode.fullPath,
        name: internalNode.name,
        fullPath: internalNode.fullPath,
        level: internalNode.level,
        categoryPath: internalNode.categoryPath,
        children,
        count: matchCount,
      };
    });
  }

  return convertToCategoryNodes(rootMap);
}

/**
 * 判断是否为顶层通用书签栏名称（如 "书签栏", "Bookmarks bar", "收藏夹栏"）
 */
function isGenericRootName(name: string): boolean {
  if (!name) return true;
  return /^(书签栏|书签菜单|收藏夹栏|bookmarks bar|favorites bar|bookmarks menu|other bookmarks|其他书签|root|bookmarks|收藏夹)$/i.test(name.trim());
}

/**
 * 解析浏览器导出的 HTML 格式书签文件 (Netscape Bookmark File - Chrome / Edge / Firefox / Safari)
 */
export function parseBookmarkHtml(htmlContent: string): ImportParseResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const bookmarks: BookmarkItem[] = [];
  const categoriesSet = new Set<string>();

  // 从单个 <a> 标签提取 BookmarkItem
  function extractBookmarkFromAnchor(a: Element, currentPath: string[]) {
    let url = a.getAttribute('href')?.trim() || '';
    if (!url) return;

    // 格式化与规范化 URL
    if (!/^https?:\/\//i.test(url) && !url.startsWith('data:')) {
      if (/^www\./i.test(url) || /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(url)) {
        url = 'https://' + url;
      } else {
        return; // 过滤 chrome://, javascript: 等非标准 URL
      }
    }

    const rawName = a.textContent?.trim() || '';
    const name = rawName || suggestSiteName(url) || getHostname(url) || url;

    // 获取 Icon：若缺失或为默认 Globe，自动获取网站高清 Favicon Logo
    let icon = a.getAttribute('icon') || a.getAttribute('favicon') || '';
    if (!icon || icon === 'Globe' || (!icon.startsWith('data:') && !icon.startsWith('http'))) {
      icon = getAutoFavicon(url) || 'Globe';
    }

    // 提取描述：优先 title/comment 属性或相邻 <DD>
    let description = a.getAttribute('title')?.trim() || a.getAttribute('comment')?.trim() || '';
    if (!description && a.parentElement) {
      let nextSib = a.parentElement.nextElementSibling;
      if (nextSib && nextSib.tagName.toUpperCase() === 'DD') {
        description = nextSib.textContent?.trim() || '';
      }
    }

    const categoryPath = currentPath.length > 0 ? [...currentPath] : ['常用'];
    const category = categoryPath.join(' / ');
    categoriesSet.add(category);

    bookmarks.push({
      id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      url,
      icon,
      category,
      categoryPath,
      bgColor: getColorByString(name),
      size: '1x1',
      sort: bookmarks.length + 1,
      description: description || '',
    });
  }

  // 递归 DOM 节点解析容器 (DL/UL/DT/LI)
  function parseContainerElement(container: Element, currentPath: string[]) {
    const children = Array.from(container.children);

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const tag = child.tagName.toUpperCase();

      if (tag === 'A') {
        extractBookmarkFromAnchor(child, currentPath);
      } else if (tag === 'DL' || tag === 'UL') {
        // 寻找此 DL 之前的 H3 文件夹名称
        let folderName = '';
        let prev = child.previousElementSibling;
        if (prev) {
          if (prev.tagName.toUpperCase() === 'H3') {
            folderName = prev.textContent?.trim() || '';
          } else {
            const h3InPrev = prev.querySelector('h3, H3');
            if (h3InPrev) folderName = h3InPrev.textContent?.trim() || '';
          }
        }
        if (!folderName && child.parentElement) {
          const h3InParent = child.parentElement.querySelector(':scope > h3, :scope > H3');
          if (h3InParent) folderName = h3InParent.textContent?.trim() || '';
        }

        let nextPath = currentPath;
        if (folderName) {
          if (isGenericRootName(folderName) && currentPath.length === 0) {
            nextPath = [];
          } else {
            nextPath = [...currentPath, folderName];
          }
        }

        parseContainerElement(child, nextPath);
      } else if (tag === 'DT' || tag === 'LI' || tag === 'P') {
        // 解析 DT/LI/P 节点下的直属 A 标签
        const directAnchors = child.querySelectorAll(':scope > a, :scope > A');
        directAnchors.forEach((a) => extractBookmarkFromAnchor(a, currentPath));

        // 如果 DT/LI/P 不含直属 A 标签，但也包含子 A 标签 (未嵌套在 DL 中)
        if (directAnchors.length === 0) {
          const innerAnchors = Array.from(child.querySelectorAll('a, A')).filter(
            (a) => !a.parentElement?.closest('dl, DL, ul, UL')
          );
          innerAnchors.forEach((a) => extractBookmarkFromAnchor(a, currentPath));
        }

        // 解析 DT/LI/P 中的子 DL/UL 文件夹
        const innerDls = child.querySelectorAll(':scope > dl, :scope > DL, :scope > ul, :scope > UL');
        if (innerDls.length > 0) {
          innerDls.forEach((dl) => {
            let folderName = '';
            const h3 = child.querySelector(':scope > h3, :scope > H3') || child.querySelector('h3, H3');
            if (h3) folderName = h3.textContent?.trim() || '';

            let nextPath = currentPath;
            if (folderName) {
              if (isGenericRootName(folderName) && currentPath.length === 0) {
                nextPath = [];
              } else {
                nextPath = [...currentPath, folderName];
              }
            }

            parseContainerElement(dl, nextPath);
          });
        }
      }
    }
  }

  // 1. 寻找顶层 DL/UL (无外层 DL/UL 包裹的根容器)
  const allDls = Array.from(doc.querySelectorAll('dl, DL, ul, UL'));
  const topDls = allDls.filter((dl) => !dl.parentElement?.closest('dl, DL, ul, UL'));

  if (topDls.length > 0) {
    topDls.forEach((dl) => parseContainerElement(dl, []));
  } else {
    parseContainerElement(doc.body, []);
  }

  // 2. 备用模式：若上述解析未提取到书签，按 DOM 顺序匹配 H3 与 A 标签
  if (bookmarks.length === 0) {
    let currentScanPath: string[] = [];
    const allElements = doc.querySelectorAll('h3, H3, a, A');

    allElements.forEach((node) => {
      const tag = node.tagName.toUpperCase();
      if (tag === 'H3') {
        const text = node.textContent?.trim();
        if (text && !isGenericRootName(text)) {
          currentScanPath = [text];
        }
      } else if (tag === 'A') {
        extractBookmarkFromAnchor(node, currentScanPath);
      }
    });
  }

  const categoryTree = buildCategoryTree(bookmarks);

  return {
    bookmarks,
    categories: Array.from(categoriesSet),
    categoryTree,
    totalBookmarks: bookmarks.length,
    totalCategories: categoriesSet.size,
    sourceType: 'html_bookmarks',
  };
}

/**
 * 解析通用 JSON 配置文件或各浏览器/衍生工具导出的 JSON 书签数据
 */
export function parseBookmarkJson(jsonContent: string): ImportParseResult {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonContent);
  } catch (err: any) {
    throw new Error(`JSON 解析失败: ${err.message}`);
  }

  const bookmarks: BookmarkItem[] = [];
  const categoriesSet = new Set<string>();
  let config: Partial<MtabConfig> | undefined;
  let notes: NoteItem[] | undefined;
  let todos: TodoItem[] | undefined;

  // 辅助函数：从 JSON 对象中抽取有效 BookmarkItem
  function extractBookmarkFromObject(obj: any, currentPath: string[]): BookmarkItem | null {
    if (!obj || typeof obj !== 'object') return null;
    let url = (obj.url || obj.uri || obj.href || obj.link || '').trim();
    if (!url || typeof url !== 'string') return null;

    if (!/^https?:\/\//i.test(url) && !url.startsWith('data:')) {
      if (/^www\./i.test(url) || /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(url)) {
        url = 'https://' + url;
      } else {
        return null; // 跳过无效链接
      }
    }

    const name = obj.name || obj.title || obj.text || obj.label || suggestSiteName(url) || url;

    let categoryPath: string[] = [];
    if (Array.isArray(obj.categoryPath) && obj.categoryPath.length > 0) {
      categoryPath = obj.categoryPath.map((p: any) => String(p).trim()).filter(Boolean);
    } else if (typeof obj.category === 'string' && obj.category.trim()) {
      categoryPath = obj.category.split(/[\/>\\]/).map((s: string) => s.trim()).filter(Boolean);
    } else if (currentPath.length > 0) {
      categoryPath = [...currentPath];
    } else {
      categoryPath = ['常用'];
    }

    const category = categoryPath.join(' / ');
    categoriesSet.add(category);

    // 自动 Icon 获取与兜底
    let icon = obj.icon || obj.favicon || obj.iconuri || obj.avatar || '';
    if (!icon || icon === 'Globe' || icon === 'default') {
      icon = getAutoFavicon(url) || 'Globe';
    }

    return {
      id: obj.id || `bm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      url,
      icon,
      bgColor: obj.bgColor || getColorByString(name),
      category,
      categoryPath,
      size: obj.size || '1x1',
      description: obj.description || obj.comment || obj.notes || '',
      sort: bookmarks.length + 1,
    };
  }

  // 递归树结构处理器 (兼容 Firefox bookmarks.json、Chrome Roots、Mtab、Raindrop、XBrowser 等)
  function traverseJsonTree(node: any, currentPath: string[]) {
    if (!node) return;

    if (Array.isArray(node)) {
      node.forEach((child) => traverseJsonTree(child, currentPath));
      return;
    }

    if (typeof node === 'object') {
      // 1. 尝试提取书签节点
      const bm = extractBookmarkFromObject(node, currentPath);
      if (bm) {
        bookmarks.push(bm);
      }

      // 2. 检查是否有子节点列表 (children, items, nodes, bookmarks, links, data, subfolders, sons 等)
      const children =
        node.children ||
        node.items ||
        node.nodes ||
        node.bookmarks ||
        node.links ||
        node.data ||
        node.subfolders ||
        node.sons ||
        node.childrens;

      if (Array.isArray(children)) {
        const folderName = (node.title || node.name || node.text || node.label || '').trim();
        const isGenericRoot = !folderName || isGenericRootName(folderName);
        const nextPath = (isGenericRoot && currentPath.length === 0) ? currentPath : (folderName ? [...currentPath, folderName] : currentPath);

        children.forEach((child) => traverseJsonTree(child, nextPath));
      }
    }
  }

  // 1. 形式 A: Mtab / Cloudflare 完整备份文件 (包含 config, bookmarks / links / data, notes, todos)
  const topArray = parsed.bookmarks || parsed.links || parsed.data || parsed.items || parsed.list;
  if (Array.isArray(topArray)) {
    topArray.forEach((item: any) => {
      traverseJsonTree(item, []);
    });
    config = parsed.config;
    notes = parsed.notes || parsed.noteList;
    todos = parsed.todos || parsed.todoList;
  }
  // 2. 形式 B: Chrome 浏览器 Roots 书签 JSON (parsed.roots)
  else if (parsed.roots) {
    if (parsed.roots.bookmark_bar) traverseJsonTree(parsed.roots.bookmark_bar, []);
    if (parsed.roots.other) traverseJsonTree(parsed.roots.other, ['其他书签']);
    if (parsed.roots.synced) traverseJsonTree(parsed.roots.synced, ['移动设备书签']);
  }
  // 3. 通用深度树 / 数组 (支持 Firefox、Safari、Raindrop、书签数组等)
  else {
    traverseJsonTree(parsed, []);
  }

  if (bookmarks.length === 0) {
    throw new Error('未在 JSON 文件中找到有效的书签或网络链接数据。');
  }

  const categoryTree = buildCategoryTree(bookmarks);

  return {
    bookmarks,
    categories: Array.from(categoriesSet),
    categoryTree,
    config,
    notes,
    todos,
    totalBookmarks: bookmarks.length,
    totalCategories: categoriesSet.size,
    sourceType: (parsed.bookmarks || parsed.links) ? 'json_config' : 'json_bookmarks',
  };
}

/**
 * 智能合并书签列表 (增量合并 / 完全覆盖)
 */
export function mergeBookmarks(
  existing: BookmarkItem[],
  incoming: BookmarkItem[],
  mode: ImportMode
): BookmarkItem[] {
  if (mode === 'overwrite') {
    // 完全覆盖：重置 sort 序号为 1, 2, 3...，保证排列顺序与导入文件完全一致
    return incoming.map((bm, index) => ({
      ...bm,
      sort: index + 1,
    }));
  }

  // 增量合并：按 URL 去重并更新已存在网址的信息；新增网址与模块整体排列在原有所有网址模块后面
  const mapByUrl = new Map<string, BookmarkItem>();

  // 1. 保留所有现有书签的相对位置与数据
  const merged: BookmarkItem[] = existing.map((item, idx) => {
    const key = normalizeUrl(item.url);
    const itemCopy = {
      ...item,
      sort: typeof item.sort === 'number' && item.sort > 0 ? item.sort : idx + 1,
    };
    mapByUrl.set(key, itemCopy);
    return itemCopy;
  });

  // 2. 计算现有书签中的最大 sort 序号，作为后续新卡片/模块追加的起始点
  let maxSort = merged.reduce((max, b) => Math.max(max, b.sort || 0), 0);

  // 3. 遍历待导入的新书签（保持文件原有层级与顺序）
  incoming.forEach((newItem) => {
    const key = normalizeUrl(newItem.url);
    const existItem = mapByUrl.get(key);

    if (existItem) {
      // 若原网页库中已存在该 URL，在原位置补充更新分类路径、描述与 Icon（不移动其原有显示顺序）
      if (newItem.categoryPath && newItem.categoryPath.length > 0) {
        existItem.categoryPath = newItem.categoryPath;
        existItem.category = newItem.category;
      }
      if (!existItem.description && newItem.description) {
        existItem.description = newItem.description;
      }
      if ((!existItem.icon || existItem.icon === 'Globe' || existItem.icon === 'default') && newItem.icon) {
        existItem.icon = newItem.icon;
      }
    } else {
      // 若为全新网址卡片，整体排列在原有所有网址卡片/模块的后面
      maxSort += 1;
      const appendedItem: BookmarkItem = {
        ...newItem,
        id: newItem.id || `bm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        sort: maxSort,
      };
      merged.push(appendedItem);
      mapByUrl.set(key, appendedItem);
    }
  });

  return merged;
}

/**
 * 导出为标准 HTML 浏览器书签格式 (Chrome/Edge/Firefox 可直接导入)
 */
export function exportToHtmlBookmarks(bookmarks: BookmarkItem[]): string {
  const tree = buildCategoryTree(bookmarks);

  function renderTreeToHtml(nodes: CategoryNode[]): string {
    let out = '<DL><p>\n';

    nodes.forEach((node) => {
      out += `  <DT><H3 ADD_DATE="${Math.floor(Date.now() / 1000)}">${escapeHtml(node.name)}</H3>\n`;

      const currentCategoryBookmarks = bookmarks.filter((b) => {
        const bPath = b.categoryPath ? b.categoryPath.join(' / ') : b.category;
        return bPath === node.fullPath;
      });

      if (currentCategoryBookmarks.length > 0 || node.children.length > 0) {
        out += '  <DL><p>\n';
        currentCategoryBookmarks.forEach((bm) => {
          out += `    <DT><A HREF="${escapeHtml(bm.url)}" ADD_DATE="${Math.floor(Date.now() / 1000)}" ICON="${bm.icon?.startsWith('http') ? escapeHtml(bm.icon) : ''}">${escapeHtml(bm.name)}</A>\n`;
        });

        if (node.children.length > 0) {
          out += renderTreeToHtml(node.children);
        }

        out += '  </DL><p>\n';
      }

      out += '  </DT>\n';
    });

    out += '</DL><p>\n';
    return out;
  }

  const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Mtab Bookmarks Backup</TITLE>
<H1>Bookmarks</H1>
${renderTreeToHtml(tree)}
`;

  return html;
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return (u.hostname.replace(/^www\./, '') + u.pathname).replace(/\/$/, '').toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

function getColorByString(str: string): string {
  const colors = [
    '#2563EB', '#059669', '#DC2626', '#D97706', '#7C3AED',
    '#DB2777', '#0891B2', '#475569', '#0284C7', '#10B981',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
