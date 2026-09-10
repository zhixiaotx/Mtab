import { BookmarkItem, MtabConfig, SearchEngine } from '../types';

export const DEFAULT_SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'baidu',
    name: '百度',
    url: 'https://www.baidu.com/s?wd=',
    icon: 'Search',
    placeholder: '百度一下，你就知道...',
    isDefault: true,
  },
  {
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: 'Globe',
    placeholder: 'Search Google or type a URL...',
  },
  {
    id: 'bing',
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    icon: 'Compass',
    placeholder: '微软 Bing 搜索...',
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com/search?q=',
    icon: 'Github',
    placeholder: 'Search GitHub repositories...',
  },
  {
    id: 'bilibili',
    name: '哔哩哔哩',
    url: 'https://search.bilibili.com/all?keyword=',
    icon: 'Tv',
    placeholder: '搜索视频、番剧、UP主...',
  },
  {
    id: 'zhihu',
    name: '知乎',
    url: 'https://www.zhihu.com/search?type=content&q=',
    icon: 'BookOpen',
    placeholder: '知乎：有问题，就会有答案...',
  },
];

export const DEFAULT_CATEGORIES = ['全部', '常用', '开发', '媒体', '工具', '社区'];

export const DEFAULT_BOOKMARKS: BookmarkItem[] = [
  { id: '1', name: 'GitHub', url: 'https://github.com', icon: 'Github', bgColor: '#181717', category: '开发', size: '1x1', sort: 1, description: '全球最大的代码托管与协作社区' },
  { id: '2', name: 'Cloudflare', url: 'https://dash.cloudflare.com', icon: 'Cloud', bgColor: '#F38020', category: '开发', size: '1x1', sort: 2, description: '全球 CDN、Workers 与 D1/KV 平台' },
  { id: '3', name: '哔哩哔哩', url: 'https://www.bilibili.com', icon: 'Tv', bgColor: '#00AEEC', category: '媒体', size: '1x1', sort: 3, description: '国内知名弹幕视频网站' },
  { id: '4', name: 'YouTube', url: 'https://www.youtube.com', icon: 'Youtube', bgColor: '#FF0000', category: '媒体', size: '1x1', sort: 4, description: '全球流行视频平台' },
  { id: '5', name: '知乎', url: 'https://www.zhihu.com', icon: 'BookOpen', bgColor: '#0084FF', category: '社区', size: '1x1', sort: 5, description: '中文互联网高质量问答社区' },
  { id: '6', name: '掘金', url: 'https://juejin.cn', icon: 'Code', bgColor: '#1E80FF', category: '开发', size: '1x1', sort: 6, description: '面向全球中文开发者的技术社区' },
  { id: '7', name: '微博', url: 'https://weibo.com', icon: 'Flame', bgColor: '#E6162D', category: '社区', size: '1x1', sort: 7, description: '随时随地发现新鲜事' },
  { id: '8', name: 'V2EX', url: 'https://www.v2ex.com', icon: 'Terminal', bgColor: '#333333', category: '社区', size: '1x1', sort: 8, description: '创意工作者讨论社区' },
  { id: '9', name: '阿里云', url: 'https://aliyun.com', icon: 'Server', bgColor: '#FF6A00', category: '工具', size: '1x1', sort: 9, description: '领先的云计算及人工智能科技公司' },
  { id: '10', name: '网易云音乐', url: 'https://music.163.com', icon: 'Music', bgColor: '#C20C0C', category: '媒体', size: '1x1', sort: 10, description: '专注于发现与分享的音乐产品' },
  { id: '11', name: 'Notion', url: 'https://notion.so', icon: 'FileText', bgColor: '#000000', category: '工具', size: '1x1', sort: 11, description: '全能文档与项目知识库' },
  { id: '12', name: 'DeepL 翻译', url: 'https://www.deepl.com/translator', icon: 'Languages', bgColor: '#0F2B46', category: '工具', size: '1x1', sort: 12, description: '世界领先的高精度翻译' },
];

export const DEFAULT_CONFIG: MtabConfig = {
  theme: {
    mode: 'light',
    wallpaperType: 'bing',
    wallpaperUrl: '',
    blur: 0,
    opacity: 0.25,
    glassBlur: 16,
    glassOpacity: 0.65,
    timeColor: '#ffffff',
    time24: true,
    timeSeconds: true,
    timeLunar: true,
    iconSize: 'md',
    iconRadius: 'lg',
    showTitle: true,
    columns: 6,
  },
  openInNewTab: true,
  tabbarEnabled: true,
  autoLocalBackup: false,
};

export const PRESET_WALLPAPERS = [
  { id: 'nature', name: '壮美山河', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80' },
  { id: 'mountains', name: '雪山晨曦', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80' },
  { id: 'cyberpunk', name: '赛博夜景', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&q=80' },
  { id: 'stars', name: '璀璨星河', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&q=80' },
  { id: 'forest', name: '幽静森林', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80' },
  { id: 'aurora', name: '极光幻境', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80' },
];

export const POETRY_LIST = [
  { text: '海内存知己，天涯若比邻。', author: '王勃', origin: '《送杜少府之任蜀州》' },
  { text: '大漠孤烟直，长河落日圆。', author: '王维', origin: '《使至塞上》' },
  { text: '星垂平野阔，月涌大江流。', author: '杜甫', origin: '《旅夜书怀》' },
  { text: '长风破浪会有时，直挂云帆济沧海。', author: '李白', origin: '《行路难》' },
  { text: '竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。', author: '苏轼', origin: '《定风波》' },
  { text: '莫道桑榆晚，为霞尚满天。', author: '刘禹锡', origin: '《酬乐天咏老见示》' },
];

export const FOOD_OPTIONS = [
  '麻辣香锅', '兰州牛肉面', '黄焖鸡米饭', '螺蛳粉', '轻食沙拉', '手工水饺',
  '日式拉面', '番茄牛腩饭', '广式点心', '铁板烧牛肉', '酸汤肥牛', '石锅拌饭',
  '海南鸡饭', '新疆炒米粉', '麻辣烫', '西冷牛排', '鲜虾云吞面', '烤肉拌饭'
];
