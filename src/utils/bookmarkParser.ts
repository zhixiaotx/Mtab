import { BookmarkItem, CategoryNode, ImportMode, ImportParseResult, NoteItem, TodoItem, MtabConfig } from '../types';
import { getAutoFavicon, getHostname, suggestSiteName } from './favicon';

/**
 * 将平铺的书签列表根据 categoryPath 或 category 构建多级分类树
 */
export function buildCategoryTree(bookmarks: BookmarkItem[]): CategoryNode[] {
  const rootMap = new Map<string, CategoryNode>();

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

    // 确保 item 的规范属性对齐
    item.categoryPath = [...path];
    item.category = path.join(' / ');

    let currentChildren = rootMap;
    let accumulatedPath: string[] = [];

    path.forEach((part, index) => {
      accumulatedPath.push(part);
      const fullPath = accumulatedPath.join(' / ');

      let node = currentChildren.get(part);
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
        currentChildren.set(part, node);
      }

      // 为子层级构造 Map
      const nextChildren = new Map<string, CategoryNode>();
      node.children.forEach((c) => nextChildren.set(c.name, c));
      currentChildren = nextChildren;
    });
  });

  // 递归计算每个分类节点（及其子节点）包含的书签数量并组装树结构
  function updateNodeAndChildren(map: Map<string, CategoryNode>): CategoryNode[] {
    return Array.from(map.values()).map((node) => {
      const pathPrefix = node.fullPath;
      const matchCount = bookmarks.filter((b) => {
        const bPath = b.categoryPath ? b.categoryPath.join(' / ') : b.category;
        return bPath === pathPrefix || bPath.startsWith(pathPrefix + ' / ');
      }).length;

      const childMap = new Map<string, CategoryNode>();
      node.children.forEach((c) => childMap.set(c.name, c));

      return {
        ...node,
        count: matchCount,
        children: updateNodeAndChildren(childMap),
      };
    });
  }

  return updateNodeAndChildren(rootMap);
}

/**
 * 解析浏览器导出的 HTML 格式书签文件 (Netscape Bookmark File - Chrome / Edge / Firefox / Safari)
 */
export function parseBookmarkHtml(htmlContent: string): ImportParseResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const bookmarks: BookmarkItem[] = [];
  const categoriesSet = new Set<string>();
  const processedElements = new Set<Element>();

  // 解析单个 <a> 标签链接元素
  function parseLinkElement(a: Element, parentElement: Element | null, currentPath: string[]) {
    let url = a.getAttribute('href')?.trim() || '';
    if (!url) return;

    // 格式化与规范化 URL
    if (!/^https?:\/\//i.test(url) && !url.startsWith('data:')) {
      if (/^www\./i.test(url) || /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(url)) {
        url = 'https://' + url;
      } else {
        return; // 过滤非标准/内部 URL（如 javascript: 或 chrome://）
      }
    }

    const rawName = a.textContent?.trim() || '';
    const name = rawName || suggestSiteName(url) || getHostname(url) || url;
    let icon = a.getAttribute('icon') || a.getAttribute('favicon') || '';

    // 核心自动 Logo 获取逻辑：若无 icon、或为默认 Globe、或非 Base64/HTTP，自动域名提取高清 Favicon
    if (!icon || icon === 'Globe' || (!icon.startsWith('data:') && !icon.startsWith('http'))) {
      icon = getAutoFavicon(url) || 'Globe';
    }

    // 提取描述：优先提取 title、comment 属性，或相邻 <DD> 标签
    let description = a.getAttribute('title')?.trim() || a.getAttribute('comment')?.trim() || '';
    if (!description && parentElement) {
      const dd = parentElement.querySelector(':scope > DD, :scope > dd') ||
                 (parentElement.nextElementSibling && parentElement.nextElementSibling.tagName.toUpperCase() === 'DD' ? parentElement.nextElementSibling : null);
      if (dd && dd.textContent) {
        description = dd.textContent.trim();
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

  // 递归解析 DL / UL 容器中的 H3 (文件夹) 与 A (书签)
  function parseContainer(container: Element, currentPath: string[]) {
    processedElements.add(container);
    const children = Array.from(container.children);

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (processedElements.has(child)) continue;

      const tagName = child.tagName.toUpperCase();

      if (tagName === 'DT' || tagName === 'LI' || tagName === 'P') {
        processedElements.add(child);

        // 检查 DT 中是否包含 H3 (文件夹)
        const h3 = child.querySelector(':scope > H3, :scope > h3') || (child.tagName === 'H3' ? child : null);
        const a = child.querySelector(':scope > A, :scope > a');

        if (h3) {
          const folderName = h3.textContent?.trim() || '未命名文件夹';
          // 忽略顶层通用书签栏无用名称（如 "书签栏", "Bookmarks bar", "收藏夹栏"）
          const isGenericRoot = /^(书签栏|书签菜单|收藏夹栏|bookmarks bar|favorites bar|bookmarks menu|other bookmarks|其他书签|root)$/i.test(folderName);
          const nextPath = (isGenericRoot && currentPath.length === 0) ? [] : [...currentPath, folderName];

          // 寻找该文件夹对应的子 DL 容器（核心：防二次遍历关键）
          let subContainer = child.querySelector(':scope > DL, :scope > dl, :scope > UL, :scope > ul');
          if (!subContainer) {
            let sib = child.nextElementSibling;
            while (sib) {
              const sibTag = sib.tagName.toUpperCase();
              if (sibTag === 'DL' || sibTag === 'UL') {
                subContainer = sib;
                break;
              }
              if (sibTag === 'DT' || sibTag === 'H3' || sibTag === 'A') {
                break;
              }
              sib = sib.nextElementSibling;
            }
          }

          if (subContainer) {
            parseContainer(subContainer, nextPath);
          }
        }

        if (a) {
          parseLinkElement(a, child, currentPath);
        }

        // 某些嵌套 DL 结构的追加解析
        const innerDl = child.querySelector(':scope > DL, :scope > dl, :scope > UL, :scope > ul');
        if (innerDl && !processedElements.has(innerDl)) {
          parseContainer(innerDl, currentPath);
        }
      } else if (tagName === 'DL' || tagName === 'UL') {
        parseContainer(child, currentPath);
      } else if (tagName === 'A') {
        parseLinkElement(child, child.parentElement, currentPath);
      } else if (tagName === 'H3') {
        const folderName = child.textContent?.trim() || '未命名文件夹';
        const isGenericRoot = /^(书签栏|书签菜单|收藏夹栏|bookmarks bar|favorites bar|bookmarks menu|other bookmarks|其他书签|root)$/i.test(folderName);
        const nextPath = (isGenericRoot && currentPath.length === 0) ? [] : [...currentPath, folderName];

        let sib = child.nextElementSibling;
        while (sib) {
          const sibTag = sib.tagName.toUpperCase();
          if (sibTag === 'DL' || sibTag === 'UL') {
            parseContainer(sib, nextPath);
            break;
          }
          if (sibTag === 'H3') break;
          sib = sib.nextElementSibling;
        }
      }
    }
  }

  // 1. 优先尝试从 DL/UL 根节点递归解析
  const rootContainers = doc.querySelectorAll('body > dl, body > DL, body > ul, body > UL, dl, DL, ul, UL');
  if (rootContainers.length > 0) {
    rootContainers.forEach((cont) => {
      if (!processedElements.has(cont)) {
        parseContainer(cont, []);
      }
    });
  }

  // 2. 降级模式：若非标准 HTML，则顺序扫描 H3 目录与 A 链接
  if (bookmarks.length === 0) {
    let currentScanPath: string[] = [];
    const allNodes = doc.querySelectorAll('h3, H3, a, A');

    allNodes.forEach((node) => {
      const tag = node.tagName.toUpperCase();
      if (tag === 'H3') {
        const fName = node.textContent?.trim();
        if (fName && !/^(书签栏|bookmarks bar|收藏夹栏)$/i.test(fName)) {
          currentScanPath = [fName];
        }
      } else if (tag === 'A') {
        let url = node.getAttribute('href')?.trim() || '';
        if (url) {
          if (!/^https?:\/\//i.test(url) && /^www\./i.test(url)) url = 'https://' + url;
          if (/^https?:\/\//i.test(url)) {
            const name = node.textContent?.trim() || suggestSiteName(url) || url;
            let icon = node.getAttribute('icon') || getAutoFavicon(url) || 'Globe';
            const description = node.getAttribute('title')?.trim() || node.getAttribute('comment')?.trim() || '';
            const categoryPath = currentScanPath.length > 0 ? [...currentScanPath] : ['导入书签'];
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
              description,
            });
          }
        }
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
 * 解析通用 JSON 配置文件或各浏览器/延伸工具导出的 JSON 书签数据
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
      sort: typeof obj.sort === 'number' ? obj.sort : bookmarks.length + 1,
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

      // 2. 检查是否有子节点列表 (children, items, nodes, bookmarks, subfolders)
      const children = node.children || node.items || node.nodes || node.bookmarks || node.subfolders || node.sons;
      if (Array.isArray(children)) {
        const folderName = (node.title || node.name || node.text || node.label || '').trim();
        const isGenericRoot = !folderName || /^(书签栏|bookmarks bar|收藏夹栏|favorites bar|bookmarks menu|other bookmarks|其他书签|root)$/i.test(folderName);
        const nextPath = (isGenericRoot && currentPath.length === 0) ? currentPath : (folderName ? [...currentPath, folderName] : currentPath);

        children.forEach((child) => traverseJsonTree(child, nextPath));
      }
    }
  }

  // 1. 形式 A: Mtab 备份文件 (包含 config, bookmarks, notes, todos)
  if (parsed.bookmarks && Array.isArray(parsed.bookmarks)) {
    parsed.bookmarks.forEach((item: any) => {
      const bm = extractBookmarkFromObject(item, []);
      if (bm) bookmarks.push(bm);
    });
    config = parsed.config;
    notes = parsed.notes;
    todos = parsed.todos;
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

  // 增量合并 (按 URL 去重并补充更新多级分类与 Logo)
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
      // 存在相同 URL，补充更新多级分类、描述与 Icon
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
