import { BookmarkItem, CategoryNode, ImportMode, ImportParseResult, NoteItem, TodoItem, MtabConfig } from '../types';
import { getAutoFavicon } from './favicon';

/**
 * 将平铺的书签列表根据 categoryPath 或 category 构建多级分类树
 */
export function buildCategoryTree(bookmarks: BookmarkItem[]): CategoryNode[] {
  const rootMap = new Map<string, CategoryNode>();

  bookmarks.forEach((item) => {
    // 获取分类路径数组
    let path: string[] = [];
    if (item.categoryPath && item.categoryPath.length > 0) {
      path = item.categoryPath.map((p) => p.trim()).filter(Boolean);
    } else if (item.category) {
      path = item.category.split(/[\/>\\]/).map((p) => p.trim()).filter(Boolean);
    }

    if (path.length === 0) {
      path = ['未分类'];
    }

    // 递归查找或创建节点
    let currentMap = rootMap;
    let accumulatedPath: string[] = [];

    path.forEach((part, index) => {
      accumulatedPath.push(part);
      const fullPath = accumulatedPath.join(' / ');

      let node = currentMap.get(part);
      if (!node) {
        node = {
          id: fullPath,
          name: part,
          fullPath,
          level: index + 1,
          categoryPath: [...accumulatedPath],
          children: [],
          count: 0,
        };
        currentMap.set(part, node);
      }

      // 如果是叶子层级，统计归属于当前节点的书签计数
      node.count += 1;

      // 下一层级的 Map
      const nextMap = new Map<string, CategoryNode>();
      node.children.forEach((child) => nextMap.set(child.name, child));
      currentMap = nextMap;
    });
  });

  // 递归将 Map 转成 Array
  function mapToArray(map: Map<string, CategoryNode>): CategoryNode[] {
    return Array.from(map.values()).map((node) => {
      const childMap = new Map<string, CategoryNode>();
      node.children.forEach((c) => childMap.set(c.name, c));
      return {
        ...node,
        children: mapToArray(childMap),
      };
    });
  }

  // 整理顶层树
  const tree: CategoryNode[] = [];
  rootMap.forEach((node) => {
    tree.push(syncNodeChildren(node, bookmarks));
  });

  return tree;
}

function syncNodeChildren(node: CategoryNode, bookmarks: BookmarkItem[]): CategoryNode {
  // 计算该分类树及其所有子分类包含的书签
  const pathPrefix = node.fullPath;
  const matchCount = bookmarks.filter((b) => {
    const bPath = b.categoryPath ? b.categoryPath.join(' / ') : b.category;
    return bPath === pathPrefix || bPath.startsWith(pathPrefix + ' / ');
  }).length;

  return {
    ...node,
    count: matchCount,
    children: node.children.map((c) => syncNodeChildren(c, bookmarks)),
  };
}

/**
 * 解析浏览器导出的 HTML 格式书签文件 (Netscape Bookmark File)
 */
export function parseBookmarkHtml(htmlContent: string): ImportParseResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const bookmarks: BookmarkItem[] = [];
  const categoriesSet = new Set<string>();

  // 遍历 DOM 节点
  function traverse(element: Element, currentPath: string[]) {
    const children = Array.from(element.children);

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const tagName = child.tagName.toUpperCase();

      if (tagName === 'DT') {
        // 查找 H3 (文件夹/分类)
        const h3 = child.querySelector(':scope > H3, :scope > h3');
        const a = child.querySelector(':scope > A, :scope > a');
        const dl = child.querySelector(':scope > DL, :scope > dl');

        if (h3) {
          const folderName = h3.textContent?.trim() || '未命名文件夹';
          // 忽略浏览器根文件夹无用前缀如 "书签栏", "Bookmarks bar", "收藏夹"
          const isGenericRoot = /^(书签栏|书签菜单|收藏夹栏|bookmarks bar|favorites bar|bookmarks menu)$/i.test(folderName);
          const nextPath = isGenericRoot && currentPath.length === 0 ? [] : [...currentPath, folderName];

          if (dl) {
            traverse(dl, nextPath);
          } else {
            // 某些 HTML 结构的 DL 与 DT 属于兄弟节点
            const nextSibling = child.nextElementSibling;
            if (nextSibling && nextSibling.tagName.toUpperCase() === 'DL') {
              traverse(nextSibling, nextPath);
            }
          }
        } else if (a) {
          const url = a.getAttribute('href')?.trim();
          if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            const name = a.textContent?.trim() || url;
            let icon = a.getAttribute('icon') || '';
            // 如果没有明确的 icon (base64 或 url)，自动获取网站高清 Favicon
            if (!icon || (!icon.startsWith('data:') && !icon.startsWith('http'))) {
              icon = getAutoFavicon(url) || 'Globe';
            }

            // 提取网址描述 (优先提取 title、comment 属性，或紧邻的 <DD> 标签描述)
            let description = a.getAttribute('title')?.trim() || a.getAttribute('comment')?.trim() || '';
            if (!description) {
              const dd = child.querySelector(':scope > DD, :scope > dd') ||
                         (child.nextElementSibling && child.nextElementSibling.tagName.toUpperCase() === 'DD' ? child.nextElementSibling : null);
              if (dd && dd.textContent) {
                description = dd.textContent.trim();
              }
            }

            const category = currentPath.length > 0 ? currentPath.join(' / ') : '常用';
            const categoryPath = currentPath.length > 0 ? [...currentPath] : ['常用'];

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
        }
      } else if (tagName === 'DL') {
        traverse(child, currentPath);
      }
    }
  }

  const rootDL = doc.querySelector('dl, DL');
  if (rootDL) {
    traverse(rootDL, []);
  } else {
    // 降级：如果未找到 DL，直接提取所有 <a> 标签
    const allLinks = doc.querySelectorAll('a[href]');
    allLinks.forEach((a, idx) => {
      const url = a.getAttribute('href')?.trim();
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        const name = a.textContent?.trim() || url;
        const autoIcon = a.getAttribute('icon') || getAutoFavicon(url) || 'Globe';
        const description = a.getAttribute('title')?.trim() || a.getAttribute('comment')?.trim() || '';
        bookmarks.push({
          id: `bm_${Date.now()}_${idx}`,
          name,
          url,
          icon: autoIcon,
          category: '导入书签',
          categoryPath: ['导入书签'],
          bgColor: getColorByString(name),
          size: '1x1',
          sort: idx + 1,
          description,
        });
      }
    });
    categoriesSet.add('导入书签');
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
 * 解析 JSON 配置文件或书签 JSON 数据
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

  // 1. 结构形式 A: Mtab 标准备份导出包
  if (parsed.bookmarks && Array.isArray(parsed.bookmarks)) {
    parsed.bookmarks.forEach((item: any, idx: number) => {
      if (item.url) {
        const path = item.categoryPath || (item.category ? item.category.split(/[\/>\\]/).map((s: string) => s.trim()) : ['常用']);
        const catName = path.join(' / ');
        categoriesSet.add(catName);

        // 如果没有指定 logo 或为默认 Globe，自动从网络获取该网址的高清 Favicon
        let icon = item.icon || '';
        if (!icon || icon === 'Globe' || icon === 'default') {
          icon = getAutoFavicon(item.url) || item.icon || 'Globe';
        }

        bookmarks.push({
          id: item.id || `bm_${Date.now()}_${idx}`,
          name: item.name || item.title || item.url,
          url: item.url,
          icon,
          bgColor: item.bgColor || getColorByString(item.name || ''),
          category: catName,
          categoryPath: path,
          size: item.size || '1x1',
          description: item.description || '',
          sort: item.sort ?? idx,
        });
      }
    });

    config = parsed.config;
    notes = parsed.notes;
    todos = parsed.todos;
  }
  // 2. 结构形式 B: Chrome 浏览器书签 JSON (roots.bookmark_bar)
  else if (parsed.roots) {
    function traverseChromeNode(node: any, path: string[]) {
      if (!node) return;
      if (node.type === 'folder' && Array.isArray(node.children)) {
        const nextPath = node.name && node.name !== 'Bookmarks bar' && node.name !== '书签栏'
          ? [...path, node.name]
          : path;
        node.children.forEach((child: any) => traverseChromeNode(child, nextPath));
      } else if (node.type === 'url' && node.url) {
        const cat = path.length > 0 ? path.join(' / ') : '常用';
        categoriesSet.add(cat);
        const autoIcon = getAutoFavicon(node.url) || 'Globe';
        bookmarks.push({
          id: node.id || `bm_${Date.now()}_${Math.random()}`,
          name: node.name || node.url,
          url: node.url,
          icon: autoIcon,
          bgColor: getColorByString(node.name || ''),
          category: cat,
          categoryPath: path.length > 0 ? [...path] : ['常用'],
          size: '1x1',
          sort: bookmarks.length + 1,
          description: '',
        });
      }
    }

    if (parsed.roots.bookmark_bar) traverseChromeNode(parsed.roots.bookmark_bar, []);
    if (parsed.roots.other) traverseChromeNode(parsed.roots.other, ['其他书签']);
    if (parsed.roots.synced) traverseChromeNode(parsed.roots.synced, ['移动设备书签']);
  }
  // 3. 结构形式 C: 书签对象纯数组
  else if (Array.isArray(parsed)) {
    parsed.forEach((item: any, idx: number) => {
      if (item && item.url) {
        const path = item.categoryPath || (item.category ? item.category.split(/[\/>\\]/).map((s: string) => s.trim()) : ['常用']);
        const cat = path.join(' / ');
        categoriesSet.add(cat);

        let icon = item.icon || '';
        if (!icon || icon === 'Globe' || icon === 'default') {
          icon = getAutoFavicon(item.url) || item.icon || 'Globe';
        }

        bookmarks.push({
          id: item.id || `bm_${Date.now()}_${idx}`,
          name: item.name || item.title || item.url,
          url: item.url,
          icon,
          bgColor: item.bgColor || getColorByString(item.name || ''),
          category: cat,
          categoryPath: path,
          size: item.size || '1x1',
          description: item.description || '',
          sort: idx,
        });
      }
    });
  } else {
    throw new Error('未识别的 JSON 数据格式，请上传正确的 Mtab 备份或浏览器书签文件。');
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
    sourceType: parsed.bookmarks ? 'json_config' : 'json_bookmarks',
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
    return incoming;
  }

  // 增量合并 (按 URL 去重并更新，不存在的追加进来)
  const mapByUrl = new Map<string, BookmarkItem>();
  existing.forEach((item) => {
    const key = normalizeUrl(item.url);
    mapByUrl.set(key, item);
  });

  const merged = [...existing];

  incoming.forEach((newItem) => {
    const key = normalizeUrl(newItem.url);
    const existItem = mapByUrl.get(key);

    if (existItem) {
      // 存在相同 URL，补充更新多级分类与描述
      if (newItem.categoryPath && newItem.categoryPath.length > 0) {
        existItem.categoryPath = newItem.categoryPath;
        existItem.category = newItem.category;
      }
      if (!existItem.description && newItem.description) {
        existItem.description = newItem.description;
      }
    } else {
      // 新书签，加入列表
      merged.push(newItem);
      mapByUrl.set(key, newItem);
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

      // 属于当前层级的书签
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
