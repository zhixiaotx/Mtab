import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, History, ArrowRight, CornerDownLeft, Sparkles, Folder } from 'lucide-react';
import { SearchEngine, BookmarkItem } from '../types';

export const SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'local',
    value: 'local',
    name: '本站',
    group: 'local',
    url: '',
    icon: '🔍',
    placeholder: '在本地书签与导航中检索 (输入关键词或名称)...',
  },
  {
    id: 'bing',
    value: 'bing',
    name: '必应',
    group: 'general',
    url: 'https://www.bing.com/search?q=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M7 5v14l6-3.5V8.5L7 5zm6 3.5v7l6 3.5V8.5L13 8.5z" fill="#0089D6" />
      </svg>
    ),
    placeholder: '微软必应搜索或输入网址...',
    shortcut: 'b',
    isDefault: true,
  },
  {
    id: 'baidu',
    value: 'baidu',
    name: '百度',
    group: 'general',
    url: 'https://www.baidu.com/s?wd=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.5 15c-.8 0-1.5-.7-1.5-1.5v-3c0-.8.7-1.5 1.5-1.5h3c.8 0 1.5.7 1.5 1.5v3c0 .8-.7 1.5-1.5 1.5h-3zm0-6c-.8 0-1.5-.7-1.5-1.5v-3c0-.8.7-1.5 1.5-1.5h3c.8 0 1.5.7 1.5 1.5v3c0 .8-.7 1.5-1.5 1.5h-3z"
          fill="#23B8E8"
        />
      </svg>
    ),
    placeholder: '百度一下，你就知道...',
    shortcut: 'bd',
  },
  {
    id: 'google',
    value: 'google',
    name: '谷歌',
    group: 'general',
    url: 'https://www.google.com/search?q=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M21.35 11.1H12v3.8h5.38c-.24 1.28-.96 2.37-2.05 3.1v2.58h3.32c1.94-1.78 3.06-4.4 3.06-7.48 0-.68-.06-1.34-.16-2z"
          fill="#4285F4"
        />
        <path
          d="M12 20.6c2.43 0 4.47-.8 5.96-2.18l-3.32-2.58c-.92.62-2.1.98-3.64.98-2.34 0-4.32-1.58-5.03-3.7H2.54v2.66C4.02 18.7 7.74 20.6 12 20.6z"
          fill="#34A853"
        />
        <path
          d="M6.97 13.12a5.16 5.16 0 0 1 0-3.24V7.22H2.54a8.98 8.98 0 0 0 0 9.56l4.43-3.66z"
          fill="#FBBC05"
        />
        <path
          d="M12 7.4c1.32 0 2.5.45 3.44 1.35l2.58-2.58C16.46 4.68 14.43 4 12 4c-4.26 0-7.98 1.9-9.46 4.66l4.43 3.66c.71-2.12 2.69-3.7 5.03-3.7z"
          fill="#EA4335"
        />
      </svg>
    ),
    placeholder: 'Google 搜索或输入网址...',
    shortcut: 'g',
  },
  {
    id: 'duckduckgo',
    value: 'duckduckgo',
    name: 'DuckDuckGo',
    group: 'general',
    url: 'https://duckduckgo.com/?q=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#DE5833" />
        <text
          x="12"
          y="17"
          fontSize="14"
          fontWeight="800"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Arial, sans-serif"
        >
          D
        </text>
      </svg>
    ),
    placeholder: 'DuckDuckGo 隐私保护搜索...',
    shortcut: 'd',
  },
  {
    id: 'sogou',
    value: 'sogou',
    name: '搜狗搜索',
    group: 'general',
    url: 'https://www.sogou.com/web?query=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#FB6022" />
        <text
          x="12"
          y="17"
          fontSize="14"
          fontWeight="800"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Arial, sans-serif"
        >
          搜
        </text>
      </svg>
    ),
    placeholder: '搜狗搜索...',
  },
  {
    id: 'so',
    value: 'so',
    name: '360搜索',
    group: 'general',
    url: 'https://www.so.com/s?q=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#18B22B" />
        <path
          d="M9 12l2 2 4-4"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    placeholder: '360 安全搜索...',
  },
  {
    id: 'sm',
    value: 'sm',
    name: '神马搜索',
    group: 'general',
    url: 'https://m.sm.cn/s?q=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#FFB200" />
        <text
          x="12"
          y="17"
          fontSize="14"
          fontWeight="800"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Arial, sans-serif"
        >
          神
        </text>
      </svg>
    ),
    placeholder: '神马移动搜索...',
  },
  {
    id: 'yahoo',
    value: 'yahoo',
    name: '雅虎',
    group: 'general',
    url: 'https://search.yahoo.com/search?p=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#6001D2" />
        <text
          x="12"
          y="17"
          fontSize="14"
          fontWeight="800"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Arial, sans-serif"
        >
          Y
        </text>
      </svg>
    ),
    placeholder: 'Yahoo! Search...',
  },
  {
    id: 'yandex',
    value: 'yandex',
    name: 'Yandex',
    group: 'general',
    url: 'https://yandex.com/search/?text=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="12" fill="#FC3F1D" />
        <text
          x="12"
          y="17"
          fontSize="13"
          fontWeight="700"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Arial, sans-serif"
        >
          Я
        </text>
      </svg>
    ),
    placeholder: 'Yandex Search...',
  },
  {
    id: 'brave',
    value: 'brave',
    name: 'Brave',
    group: 'general',
    url: 'https://search.brave.com/search?q=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#FB542B" />
        <text
          x="12"
          y="17"
          fontSize="14"
          fontWeight="800"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Arial, sans-serif"
        >
          B
        </text>
      </svg>
    ),
    placeholder: 'Brave 隐私搜索...',
  },
  {
    id: 'startpage',
    value: 'startpage',
    name: 'Startpage',
    group: 'general',
    url: 'https://www.startpage.com/sp/search?query=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#082A62" />
        <text
          x="12"
          y="17"
          fontSize="14"
          fontWeight="800"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Arial, sans-serif"
        >
          S
        </text>
      </svg>
    ),
    placeholder: 'Startpage 隐私搜索...',
  },
  {
    id: 'ecosia',
    value: 'ecosia',
    name: 'Ecosia',
    group: 'general',
    url: 'https://www.ecosia.org/search?q=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#008060" />
        <path d="M12 6v12M8 10h8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    placeholder: 'Ecosia 植树环保搜索...',
  },
  {
    id: 'naver',
    value: 'naver',
    name: 'Naver',
    group: 'general',
    url: 'https://search.naver.com/search.naver?query=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#03C75A" />
        <text
          x="12"
          y="17"
          fontSize="14"
          fontWeight="800"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Arial, sans-serif"
        >
          N
        </text>
      </svg>
    ),
    placeholder: 'Naver 搜索...',
  },
  {
    id: 'youtube',
    value: 'youtube',
    name: 'YouTube',
    group: 'general',
    url: 'https://www.youtube.com/results?search_query=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M23 12s0-3.85-.5-5.4a3 3 0 0 0-2.1-2.1C18.8 4 12 4 12 4s-6.8 0-8.4.5a3 3 0 0 0-2.1 2.1C1 8.15 1 12 1 12s0 3.85.5 5.4a3 3 0 0 0 2.1 2.1c1.6.5 8.4.5 8.4.5s6.8 0 8.4-.5a3 3 0 0 0 2.1-2.1c.5-1.55.5-5.4.5-5.4z"
          fill="#FF0000"
        />
        <path d="M9.5 8.5V15.5L15.5 12z" fill="#FFF" />
      </svg>
    ),
    placeholder: '在 YouTube 搜索全球视频...',
    shortcut: 'yt',
  },
  {
    id: 'bilibili',
    value: 'bilibili',
    name: '哔哩哔哩',
    group: 'general',
    url: 'https://search.bilibili.com/all?keyword=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#00AEEC" />
        <path
          d="M6 15h12M9 9h.01M15 9h.01"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    placeholder: '哔哩哔哩 (゜-゜)つロ 干杯~',
    shortcut: 'bl',
  },
  {
    id: 'zhihu',
    value: 'zhihu',
    name: '知乎',
    group: 'general',
    url: 'https://www.zhihu.com/search?type=content&q=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#0084FF" />
        <text
          x="12"
          y="17"
          fontSize="14"
          fontWeight="800"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Arial, sans-serif"
        >
          知
        </text>
      </svg>
    ),
    placeholder: '在知乎搜索感兴趣的回答...',
    shortcut: 'zh',
  },
  {
    id: 'weixin',
    value: 'weixin',
    name: '微信搜一搜',
    group: 'general',
    url: 'https://weixin.sogou.com/weixin?type=2&query=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M2 12c0-5 4.5-9 10-9s10 4 10 9-4.5 9-10 9c-1.2 0-2.3-.2-3.3-.6l-3 1 .8-2.5C3.5 16.5 2 14.5 2 12z"
          fill="#07C160"
        />
        <circle cx="8" cy="10" r="1.5" fill="#fff" />
        <circle cx="14" cy="10" r="1.5" fill="#fff" />
      </svg>
    ),
    placeholder: '搜索微信公众号与文章...',
    shortcut: 'wx',
  },
  {
    id: 'jike',
    value: 'jike',
    name: '即刻',
    group: 'general',
    url: 'https://okjike.com/search?keyword=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#FFE411" />
        <text
          x="12"
          y="17"
          fontSize="14"
          fontWeight="800"
          textAnchor="middle"
          fill="#111"
          fontFamily="Arial, sans-serif"
        >
          即
        </text>
      </svg>
    ),
    placeholder: '即刻搜索动态与圈子...',
  },
  {
    id: 'taobao',
    value: 'taobao',
    name: '淘宝',
    group: 'general',
    url: 'https://s.taobao.com/search?q=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#FF5000" />
        <text
          x="12"
          y="17"
          fontSize="14"
          fontWeight="800"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Arial, sans-serif"
        >
          淘
        </text>
      </svg>
    ),
    placeholder: '在淘宝搜索海量商品...',
    shortcut: 'tb',
  },
  {
    id: 'jd',
    value: 'jd',
    name: '京东',
    group: 'general',
    url: 'https://search.jd.com/Search?keyword=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#E1251B" />
        <text
          x="12"
          y="17"
          fontSize="14"
          fontWeight="800"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Arial, sans-serif"
        >
          东
        </text>
      </svg>
    ),
    placeholder: '在京东搜索正品数码与好物...',
    shortcut: 'jd',
  },
  {
    id: 'metaso',
    value: 'metaso',
    name: '秘塔AI搜索',
    group: 'ai',
    url: 'https://metaso.cn/?q=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#5B67E8" />
        <text
          x="12"
          y="17"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Arial, sans-serif"
        >
          M
        </text>
      </svg>
    ),
    placeholder: '秘塔 AI 没有广告的深度学术搜索...',
  },
  {
    id: 'nami',
    value: 'nami',
    name: '纳米AI搜索',
    group: 'ai',
    url: 'https://www.n.cn/search/?q=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#E1051B" />
        <text
          x="12"
          y="17"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Arial, sans-serif"
        >
          纳
        </text>
      </svg>
    ),
    placeholder: '纳米 AI 全网精准问答搜索...',
  },
  {
    id: 'felo',
    value: 'felo',
    name: 'Felo AI搜索',
    group: 'ai',
    url: 'https://felo.ai/search?q=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#00A4FF" />
        <text
          x="12"
          y="17"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Arial, sans-serif"
        >
          F
        </text>
      </svg>
    ),
    placeholder: 'Felo 跨语言全球智能 AI 检索...',
  },
  {
    id: 'tiangong',
    value: 'tiangong',
    name: '天工AI搜索',
    group: 'ai',
    url: 'https://www.tiangong.cn/search?q=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#6633CC" />
        <text
          x="12"
          y="17"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Arial, sans-serif"
        >
          天
        </text>
      </svg>
    ),
    placeholder: '昆仑万维天工 AI 智能搜索...',
  },
  {
    id: 'github',
    value: 'github',
    name: 'GitHub',
    group: 'dev',
    url: 'https://github.com/search?q=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    ),
    placeholder: '在 GitHub 搜索代码库与开源项目...',
    shortcut: 'gh',
  },
  {
    id: 'npm',
    value: 'npm',
    name: 'NPM',
    group: 'dev',
    url: 'https://www.npmjs.com/search?q=',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#CB3837">
        <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.13h13.74v13.74h-3.435V8.565h-3.435v10.305H5.13z" />
      </svg>
    ),
    placeholder: '搜索 NPM 包依赖...',
    shortcut: 'npm',
  },
];

interface SearchBarProps {
  openInNewTab: boolean;
  bookmarks?: BookmarkItem[];
  isDarkMode?: boolean;
  onSearch?: (query: string, engine: SearchEngine) => void;
  onSelectBookmark?: (bookmark: BookmarkItem) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  openInNewTab,
  bookmarks = [],
  isDarkMode = true,
  onSearch,
  onSelectBookmark,
}) => {
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(
    SEARCH_ENGINES.find((e) => e.isDefault) || SEARCH_ENGINES[1]
  );
  const [query, setQuery] = useState('');
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mtab_search_history') || '["Cloudflare D1", "Mtab 导航", "Vite React"]');
    } catch {
      return [];
    }
  });
  const [isFocused, setIsFocused] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string>('all');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 本地书签搜索过滤结果
  const localMatches: BookmarkItem[] = query.trim()
    ? bookmarks.filter((b) => {
        const q = query.trim().toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          (b.description && b.description.toLowerCase().includes(q)) ||
          (b.category && b.category.toLowerCase().includes(q)) ||
          b.url.toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : [];

  // 点击外部收起下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpenDropdown(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExecuteSearch = (textToSearch?: string) => {
    const finalQuery = (textToSearch ?? query).trim();
    if (!finalQuery) return;

    // 如果选择的是“本站”本地搜索，且有匹配书签
    if (selectedEngine.id === 'local') {
      if (localMatches.length > 0) {
        handleOpenBookmark(localMatches[0]);
        return;
      }
    }

    // 记录搜索历史
    const updatedHistory = [finalQuery, ...searchHistory.filter((h) => h !== finalQuery)].slice(0, 10);
    setSearchHistory(updatedHistory);
    try {
      localStorage.setItem('mtab_search_history', JSON.stringify(updatedHistory));
    } catch {}

    if (onSearch) {
      onSearch(finalQuery, selectedEngine);
    }

    if (selectedEngine.url) {
      const targetUrl = `${selectedEngine.url}${encodeURIComponent(finalQuery)}`;
      if (openInNewTab) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = targetUrl;
      }
    }

    setIsFocused(false);
  };

  const handleOpenBookmark = (bm: BookmarkItem) => {
    if (onSelectBookmark) {
      onSelectBookmark(bm);
    } else if (openInNewTab) {
      window.open(bm.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = bm.url;
    }
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecuteSearch();
    }
  };

  const removeHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = searchHistory.filter((h) => h !== item);
    setSearchHistory(updated);
    try {
      localStorage.setItem('mtab_search_history', JSON.stringify(updated));
    } catch {}
  };

  const clearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    try {
      localStorage.removeItem('mtab_search_history');
    } catch {}
  };

  const filteredEngines = activeGroup === 'all'
    ? SEARCH_ENGINES
    : SEARCH_ENGINES.filter((e) => e.group === activeGroup);

  return (
    <div ref={containerRef} className="w-full max-w-2xl px-4 my-4 relative z-20">
      {/* 圆角矩形胶囊搜索栏 (统一纯净毛玻璃) */}
      <div
        className={`flex items-center w-full h-13 sm:h-14 rounded-full p-1.5 site-glass transition-all duration-300 shadow-xl ${
          isDarkMode
            ? isFocused
              ? 'bg-neutral-950/85 border border-amber-400/50 ring-2 ring-amber-400/35 shadow-2xl shadow-black/60'
              : 'bg-neutral-950/70 border border-white/10 hover:bg-neutral-950/85 shadow-black/40'
            : isFocused
            ? 'bg-white/95 border border-amber-500/50 ring-2 ring-amber-500/35 shadow-xl shadow-slate-900/15'
            : 'bg-white/90 border border-slate-200/80 hover:bg-white shadow-slate-900/10'
        }`}
      >
        {/* 搜索引擎切换胶囊按钮 */}
        <div className="relative">
          <button
            type="button"
            id="btn-search-engine-toggle"
            onClick={() => setIsOpenDropdown(!isOpenDropdown)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full site-glass border-0 transition-all cursor-pointer ${
              isDarkMode
                ? 'text-white/90 hover:text-white bg-white/10 hover:bg-white/20'
                : 'text-slate-800 hover:text-slate-950 bg-black/5 hover:bg-black/10'
            }`}
            title="点击切换搜索引擎"
          >
            <span className="flex items-center justify-center w-5 h-5 flex-shrink-0">
              {typeof selectedEngine.icon === 'string' ? (
                <span className="text-sm">{selectedEngine.icon}</span>
              ) : (
                selectedEngine.icon
              )}
            </span>
            <span className="text-xs sm:text-sm font-medium">{selectedEngine.name}</span>
            <ChevronDown className={`w-3.5 h-3.5 ${isDarkMode ? 'text-white/50' : 'text-slate-400'}`} />
          </button>

          {/* 搜索引擎分类下拉选单 */}
          {isOpenDropdown && (
            <div
              className={`absolute top-full left-0 mt-2 w-72 sm:w-80 p-2 rounded-2xl site-glass border-0 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                isDarkMode
                  ? 'bg-neutral-950/85 text-white shadow-black/60'
                  : 'bg-white/85 text-slate-800 shadow-slate-900/20'
              }`}
            >
              {/* 分类快捷标签 */}
              <div className={`flex items-center gap-1 p-1 mb-2 border-b overflow-x-auto scrollbar-none ${
                isDarkMode ? 'border-white/10' : 'border-slate-200'
              }`}>
                {[
                  { id: 'all', label: '全部 (27)' },
                  { id: 'general', label: '常用' },
                  { id: 'ai', label: 'AI搜索' },
                  { id: 'dev', label: '开发者' },
                  { id: 'local', label: '本站' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroup(g.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer transition-colors whitespace-nowrap ${
                      activeGroup === g.id
                        ? 'bg-amber-400 text-neutral-950 font-bold'
                        : isDarkMode
                        ? 'text-white/60 hover:text-white hover:bg-white/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {/* 引擎列表 */}
              <div className="max-h-72 overflow-y-auto pr-1 space-y-0.5">
                {filteredEngines.map((engine) => {
                  const isSelected = selectedEngine.id === engine.id;
                  return (
                    <button
                      key={engine.id}
                      onClick={() => {
                        setSelectedEngine(engine);
                        setIsOpenDropdown(false);
                        inputRef.current?.focus();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-amber-400/20 text-amber-300 font-semibold'
                            : 'bg-amber-100 text-amber-900 font-semibold'
                          : isDarkMode
                          ? 'text-white/80 hover:bg-white/10'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                          {typeof engine.icon === 'string' ? (
                            <span className="text-sm">{engine.icon}</span>
                          ) : (
                            engine.icon
                          )}
                        </span>
                        <span className="truncate">{engine.name}</span>
                        {engine.group === 'ai' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-medium">AI</span>
                        )}
                        {engine.group === 'local' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-medium">本地</span>
                        )}
                      </div>
                      {engine.shortcut && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-white/40">
                          {engine.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 搜索输入框 */}
        <input
          ref={inputRef}
          id="main-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={selectedEngine.placeholder}
          className={`flex-1 h-full px-3.5 bg-transparent text-sm sm:text-base outline-none focus:outline-none ${
            isDarkMode
              ? 'text-white placeholder-white/40'
              : 'text-slate-900 placeholder-slate-400'
          }`}
        />

        {/* 清除按钮 */}
        {query && (
          <button
            type="button"
            id="btn-clear-search"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className={`p-1.5 transition-colors cursor-pointer mr-1 ${
              isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* 搜索操作按钮 */}
        <button
          type="button"
          id="btn-do-search"
          onClick={() => handleExecuteSearch()}
          className="flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 mr-1 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-all cursor-pointer shadow-md flex-shrink-0"
          title={selectedEngine.id === 'local' ? '在本地书签中检索' : '搜索'}
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* 1. 本地书签实时搜索结果下拉面板 */}
      {isFocused && (selectedEngine.id === 'local' || query.trim().length > 0) && localMatches.length > 0 && (
        <div
          className={`absolute top-full left-4 right-4 mt-2 p-2 rounded-2xl site-glass border-0 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-150 ${
            isDarkMode
              ? 'bg-neutral-950/85 text-white shadow-black/60'
              : 'bg-white/85 text-slate-800 shadow-slate-900/20'
          }`}
        >
          <div className={`flex items-center justify-between px-2.5 py-1 text-xs text-amber-400 font-semibold border-b pb-1 mb-1 ${
            isDarkMode ? 'border-white/10' : 'border-slate-200'
          }`}>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              本地匹配书签与导航 ({localMatches.length})
            </span>
            <span className={`text-[10px] font-normal ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
              回车直接打开首项
            </span>
          </div>
          <div className="space-y-1">
            {localMatches.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenBookmark(item)}
                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                  isDarkMode
                    ? 'hover:bg-amber-400/20 hover:text-amber-300'
                    : 'hover:bg-amber-100 hover:text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0"
                    style={{ backgroundColor: item.bgColor || '#2563eb' }}
                  >
                    {item.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-semibold truncate">{item.name}</div>
                    <div className="text-[11px] opacity-60 truncate">{item.url}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-white/10 opacity-70' : 'bg-black/5 text-slate-600'}`}>
                    {item.category}
                  </span>
                  <CornerDownLeft className="w-3.5 h-3.5 opacity-50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. 搜索历史面板 (常规模式下展示) */}
      {isFocused && selectedEngine.id !== 'local' && localMatches.length === 0 && searchHistory.length > 0 && (
        <div
          className={`absolute top-full left-4 right-4 mt-2 p-2 rounded-2xl site-glass border-0 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-150 ${
            isDarkMode
              ? 'bg-neutral-950/85 text-white shadow-black/60'
              : 'bg-white/85 text-slate-800 shadow-slate-900/20'
          }`}
        >
          <div className={`flex items-center justify-between px-2.5 py-1 text-xs border-b pb-1.5 mb-1 ${
            isDarkMode ? 'border-white/10 opacity-60' : 'border-slate-200 text-slate-500'
          }`}>
            <span className="flex items-center gap-1.5 font-medium">
              <History className="w-3.5 h-3.5" />
              最近搜索历史
            </span>
            <button
              onClick={clearAllHistory}
              className="text-[11px] hover:text-rose-400 transition-colors cursor-pointer"
            >
              清空
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 p-1">
            {searchHistory.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setQuery(item);
                  handleExecuteSearch(item);
                }}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  isDarkMode
                    ? 'bg-white/10 hover:bg-amber-400/20 hover:text-amber-300 text-white/80'
                    : 'bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700'
                }`}
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={(e) => removeHistoryItem(e, item)}
                  className="opacity-40 group-hover:opacity-100 hover:text-rose-400 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
