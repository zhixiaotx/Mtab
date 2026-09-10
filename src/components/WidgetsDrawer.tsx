import React, { useState, useEffect } from 'react';
import {
  X, CheckSquare, FileText, Sparkles, Sun, Flame, Utensils, BookOpen,
  Plus, Trash2, Check, RefreshCw, Volume2, VolumeX, ExternalLink, Calendar
} from 'lucide-react';
import { NoteItem, TodoItem, WeatherData, HotSearchItem } from '../types';
import { POETRY_LIST, FOOD_OPTIONS } from '../data/defaultData';

interface WidgetsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notes: NoteItem[];
  todos: TodoItem[];
  onSaveNotes: (notes: NoteItem[]) => void;
  onSaveTodos: (todos: TodoItem[]) => void;
  weatherData: WeatherData | null;
  onCityChange: (city: string) => void;
  isDarkMode?: boolean;
}

export const WidgetsDrawer: React.FC<WidgetsDrawerProps> = ({
  isOpen,
  onClose,
  notes,
  todos,
  onSaveNotes,
  onSaveTodos,
  weatherData,
  onCityChange,
  isDarkMode = true,
}) => {
  const [activeTab, setActiveTab] = useState<'todo' | 'notes' | 'muyu' | 'weather' | 'hot' | 'food' | 'poetry'>('todo');

  // ========== 木鱼状态与音频合成 ==========
  const [meritCount, setMeritCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('mtab_merit_count') || '66', 10);
  });
  const [muyuSoundEnabled, setMuyuSoundEnabled] = useState(true);
  const [muyuAnimations, setMuyuAnimations] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const playMuyuSound = () => {
    if (!muyuSoundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(430, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch (e) {
      // ignore
    }
  };

  const handleTapMuyu = (e: React.MouseEvent) => {
    playMuyuSound();
    const newCount = meritCount + 1;
    setMeritCount(newCount);
    localStorage.setItem('mtab_merit_count', newCount.toString());

    // 触发浮动动画
    const rect = e.currentTarget.getBoundingClientRect();
    const animId = Date.now() + Math.random();
    setMuyuAnimations((prev) => [...prev, { id: animId, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => {
      setMuyuAnimations((prev) => prev.filter((item) => item.id !== animId));
    }, 900);
  };

  // ========== 待办状态 ==========
  const [newTodoText, setNewTodoText] = useState('');
  const [todoFolder, setTodoFolder] = useState<'today' | 'week' | 'all'>('today');
  const [todoPriority, setTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const filteredTodos = todos.filter((t) => {
    if (todoFolder === 'all') return true;
    if (todoFolder === 'today') {
      if (t.folder) return t.folder === 'today';
      if (t.createdAt) {
        const todayStr = new Date().toDateString();
        const itemStr = new Date(t.createdAt).toDateString();
        return todayStr === itemStr;
      }
      return true;
    }
    if (todoFolder === 'week') {
      if (t.folder) return t.folder === 'week' || t.folder === 'today';
      if (t.createdAt) {
        const diffDays = (Date.now() - t.createdAt) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      return true;
    }
    return true;
  });

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      priority: todoPriority,
      folder: todoFolder,
      createdAt: Date.now(),
    };
    onSaveTodos([newTodo, ...todos]);
    setNewTodoText('');
  };

  const handleToggleTodo = (id: string) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    onSaveTodos(updated);
  };

  const handleDeleteTodo = (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    onSaveTodos(updated);
  };

  // ========== 便签状态 ==========
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const handleCreateNote = () => {
    const newNote: NoteItem = {
      id: Date.now().toString(),
      title: '新建便签',
      content: '',
      color: 'amber',
      updatedAt: Date.now(),
    };
    onSaveNotes([newNote, ...notes]);
    setEditingNoteId(newNote.id);
    setNoteTitle(newNote.title);
    setNoteContent('');
  };

  const handleSaveNote = () => {
    if (!editingNoteId) return;
    const updated = notes.map((n) =>
      n.id === editingNoteId ? { ...n, title: noteTitle || '无标题便签', content: noteContent, updatedAt: Date.now() } : n
    );
    onSaveNotes(updated);
    setEditingNoteId(null);
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    onSaveNotes(updated);
    if (editingNoteId === id) {
      setEditingNoteId(null);
    }
  };

  // ========== 全网热搜状态 ==========
  const [hotPlatform, setHotPlatform] = useState<'baidu' | 'weibo' | 'zhihu' | 'bilibili'>('baidu');
  const [hotData, setHotData] = useState<Record<string, HotSearchItem[]>>({});
  const [isHotLoading, setIsHotLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'hot' && Object.keys(hotData).length === 0) {
      setIsHotLoading(true);
      fetch('/api/hot-search')
        .then((res) => res.json())
        .then((res) => {
          if (res.platforms) setHotData(res.platforms);
        })
        .catch(() => {})
        .finally(() => setIsHotLoading(false));
    }
  }, [activeTab]);

  // ========== 今天吃什么 ==========
  const [selectedFood, setSelectedFood] = useState<string>('酸汤肥牛');
  const [isSpinningFood, setIsSpinningFood] = useState(false);

  const spinFood = () => {
    if (isSpinningFood) return;
    setIsSpinningFood(true);
    let count = 0;
    const interval = setInterval(() => {
      const random = FOOD_OPTIONS[Math.floor(Math.random() * FOOD_OPTIONS.length)];
      setSelectedFood(random);
      count++;
      if (count > 15) {
        clearInterval(interval);
        setIsSpinningFood(false);
      }
    }, 80);
  };

  // ========== 每日诗词 ==========
  const [currentPoetryIndex, setCurrentPoetryIndex] = useState(0);
  const poetry = POETRY_LIST[currentPoetryIndex];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl h-full site-glass border-0 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 dark:text-slate-200 text-slate-800 ${
          isDarkMode
            ? 'site-glass-dark'
            : 'site-glass-light'
        }`}
      >
        {/* 顶部标题与关闭 */}
        <div
          className={`flex items-center justify-between p-5 border-b ${
            isDarkMode ? 'border-white/10 bg-black/20' : 'border-slate-200/80 bg-slate-50/70'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Mtab 实用小工具</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 标签栏选择 - 采用自适应 flex-wrap 确保所有功能文字一目了然、绝不截断 */}
        <div
          className={`px-3.5 py-2.5 border-b flex-shrink-0 ${
            isDarkMode ? 'border-white/10 bg-black/10' : 'border-slate-200/80 bg-slate-100/60'
          }`}
        >
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'todo', name: '待办清单', icon: CheckSquare },
              { id: 'notes', name: '便签笔记', icon: FileText },
              { id: 'muyu', name: '电子木鱼', icon: Sparkles },
              { id: 'weather', name: '实时天气', icon: Sun },
              { id: 'hot', name: '全网热搜', icon: Flame },
              { id: 'food', name: '今天吃什么', icon: Utensils },
              { id: 'poetry', name: '每日诗词', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                      : isDarkMode
                      ? 'text-slate-300 hover:text-white hover:bg-white/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 工具主体内容区 */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* 1. 待办事项 */}
          {activeTab === 'todo' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1 p-1 rounded-xl ${isDarkMode ? 'bg-white/10' : 'bg-slate-100'}`}>
                  {(['today', 'week', 'all'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setTodoFolder(f)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                        todoFolder === f
                          ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                          : isDarkMode
                          ? 'text-white/70 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f === 'today' ? '今日待办' : f === 'week' ? '最近七天' : '全部'}
                    </button>
                  ))}
                </div>
                <span className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                  {filteredTodos.filter((t) => !t.completed).length} 个未完成
                </span>
              </div>

              {/* 输入框 */}
              <form onSubmit={handleAddTodo} className="flex gap-2">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  placeholder="添加一条待办事项，回车确认..."
                  className={`flex-1 px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all ${
                    isDarkMode
                      ? 'bg-white/10 border border-white/15 text-white placeholder-white/40 focus:border-amber-400'
                      : 'bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                  }`}
                />
                <select
                  value={todoPriority}
                  onChange={(e) => setTodoPriority(e.target.value as any)}
                  className={`px-2.5 py-2.5 rounded-xl text-xs outline-none cursor-pointer ${
                    isDarkMode
                      ? 'bg-white/10 border border-white/15 text-white'
                      : 'bg-slate-100 border border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="low" className={isDarkMode ? 'bg-neutral-900 text-white' : 'bg-white text-slate-800'}>普通</option>
                  <option value="medium" className={isDarkMode ? 'bg-neutral-900 text-white' : 'bg-white text-slate-800'}>重要</option>
                  <option value="high" className={isDarkMode ? 'bg-neutral-900 text-white' : 'bg-white text-slate-800'}>紧急</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl text-sm font-semibold cursor-pointer shadow-md active:scale-95 flex items-center justify-center flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              {/* 待办列表 */}
              <div className="space-y-2">
                {filteredTodos.length === 0 ? (
                  <div className={`p-8 text-center rounded-2xl border border-dashed ${
                    isDarkMode ? 'border-white/10 text-white/40' : 'border-slate-200 text-slate-400'
                  }`}>
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">暂无{todoFolder === 'today' ? '今日' : todoFolder === 'week' ? '七天内' : ''}待办事项</p>
                  </div>
                ) : (
                  filteredTodos.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      t.completed
                        ? isDarkMode
                          ? 'bg-white/5 border-white/5 text-white/40'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                        : isDarkMode
                        ? 'bg-white/10 border-white/15 text-white hover:border-amber-400/50'
                        : 'bg-slate-100 border-slate-200 text-slate-800 hover:border-amber-400/80'
                    }`}
                  >
                    <div
                      onClick={() => handleToggleTodo(t.id)}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${
                          t.completed
                            ? 'bg-amber-400 border-amber-400 text-neutral-950'
                            : isDarkMode
                            ? 'border-white/40 hover:border-amber-400'
                            : 'border-slate-300 hover:border-amber-500'
                        }`}
                      >
                        {t.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className={`text-sm truncate ${t.completed ? 'line-through' : 'font-medium'}`}>
                        {t.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          t.priority === 'high'
                            ? 'bg-rose-500/20 text-rose-500'
                            : t.priority === 'medium'
                            ? 'bg-amber-500/20 text-amber-600'
                            : 'bg-blue-500/20 text-blue-600'
                        }`}
                      >
                        {t.priority === 'high' ? '紧急' : t.priority === 'medium' ? '重要' : '普通'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTodo(t.id)}
                        className={`p-1 transition-colors cursor-pointer ${
                          isDarkMode ? 'text-white/40 hover:text-rose-400' : 'text-slate-400 hover:text-rose-500'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )))}
              </div>
            </div>
          )}

          {/* 2. 便签笔记 */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>快捷记录瞬时灵感与笔记</span>
                <button
                  type="button"
                  onClick={handleCreateNote}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-neutral-950 text-xs font-semibold cursor-pointer hover:bg-amber-300 active:scale-95 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>新建便签</span>
                </button>
              </div>

              {editingNoteId ? (
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  isDarkMode ? 'bg-white/10 border-white/20' : 'bg-slate-100 border-slate-200'
                }`}>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="便签标题..."
                    className={`w-full px-3 py-2 rounded-xl text-sm font-semibold outline-none ${
                      isDarkMode
                        ? 'bg-black/40 border border-white/15 text-white focus:border-amber-400'
                        : 'bg-white border border-slate-300 text-slate-900 focus:border-amber-500'
                    }`}
                  />
                  <textarea
                    rows={6}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="写下您的灵感与备忘..."
                    className={`w-full p-3 rounded-xl text-sm outline-none resize-none ${
                      isDarkMode
                        ? 'bg-black/40 border border-white/15 text-white focus:border-amber-400'
                        : 'bg-white border border-slate-300 text-slate-900 focus:border-amber-500'
                    }`}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingNoteId(null)}
                      className={`px-4 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        isDarkMode ? 'bg-white/10 text-white/80 hover:bg-white/15' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNote}
                      className="px-4 py-1.5 rounded-lg bg-amber-400 text-neutral-950 text-xs font-bold hover:bg-amber-300 active:scale-95 cursor-pointer shadow-sm"
                    >
                      保存便签
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {notes.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setEditingNoteId(n.id);
                        setNoteTitle(n.title);
                        setNoteContent(n.content);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group ${
                        isDarkMode
                          ? 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                          : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm truncate">{n.title}</h4>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(n.id);
                            }}
                            className={`p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                              isDarkMode ? 'text-white/40 hover:text-rose-400' : 'text-slate-400 hover:text-rose-500'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className={`text-xs line-clamp-4 whitespace-pre-line ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>
                          {n.content || '（空白便签）'}
                        </p>
                      </div>
                      <div className={`mt-3 text-[10px] pt-2 border-t ${
                        isDarkMode ? 'text-white/40 border-white/10' : 'text-slate-400 border-slate-200'
                      }`}>
                        {new Date(n.updatedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. 电子木鱼 */}
          {activeTab === 'muyu' && (
            <div className="flex flex-col items-center justify-center py-6 text-center select-none">
              <div className="flex items-center justify-between w-full max-w-sm mb-6 px-4">
                <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-slate-600'}`}>功德池计数</span>
                <button
                  type="button"
                  onClick={() => setMuyuSoundEnabled(!muyuSoundEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                    isDarkMode ? 'bg-white/10 text-white/80 hover:bg-white/20' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {muyuSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-500" /> : <VolumeX className="w-3.5 h-3.5 opacity-60" />}
                  <span>{muyuSoundEnabled ? '音效已开' : '静音模式'}</span>
                </button>
              </div>

              {/* 功德总计数 */}
              <div className="text-5xl font-mono font-bold text-amber-500 dark:text-amber-300 mb-6 drop-shadow-md">
                {meritCount}
              </div>

              {/* 木鱼主体打击区 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={handleTapMuyu}
                  className="w-48 h-48 rounded-full bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 border-4 border-amber-500/50 shadow-2xl flex flex-col items-center justify-center text-white cursor-pointer active:scale-95 transition-transform group"
                >
                  <div className="w-24 h-16 rounded-3xl bg-amber-950/60 border-2 border-amber-400/40 flex items-center justify-center mb-1 shadow-inner">
                    <span className="font-serif font-bold text-amber-300 text-lg">木鱼</span>
                  </div>
                  <span className="text-xs text-amber-200/80 font-medium">轻触敲击 积攒功德</span>
                </button>

                {/* 功德 +1 飘字动画 */}
                {muyuAnimations.map((anim) => (
                  <span
                    key={anim.id}
                    className="absolute text-xl font-extrabold text-amber-400 pointer-events-none animate-bounce"
                    style={{
                      left: anim.x,
                      top: anim.y - 30,
                      animation: 'fadeUp 0.8s ease-out forwards',
                    }}
                  >
                    功德 +1
                  </span>
                ))}
              </div>

              <p className={`mt-8 text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>木鱼一敲，烦恼丢掉。深呼吸，放慢节奏。</p>
            </div>
          )}

          {/* 4. 实时天气 */}
          {activeTab === 'weather' && weatherData && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className={`text-sm font-semibold ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>当前城市与气象</span>
                <div className={`flex items-center gap-1 p-1 rounded-xl ${isDarkMode ? 'bg-white/10' : 'bg-slate-100'}`}>
                  {['北京', '上海', '广州', '深圳', '成都', '杭州'].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => onCityChange(city)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                        weatherData.city === city
                          ? 'bg-amber-400 text-neutral-950 font-bold'
                          : isDarkMode
                          ? 'text-white/70 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600/30 to-indigo-900/40 border border-blue-500/20 shadow-xl flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">{weatherData.city}</div>
                  <div className="text-sm text-white/90">{weatherData.condition} · {weatherData.wind}</div>
                  <div className="text-xs text-white/70 mt-1">相对湿度: {weatherData.humidity}</div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-mono font-bold text-amber-300">{weatherData.temp}°C</div>
                </div>
              </div>

              {/* 3天天气预报 */}
              <div className="grid grid-cols-3 gap-3">
                {weatherData.forecast.map((f, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-2xl border text-center ${
                      isDarkMode ? 'bg-white/10 border-white/10' : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className={`text-xs mb-1 ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>{f.day}</div>
                    <div className={`text-base font-bold mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{f.temp}</div>
                    <div className="text-xs text-amber-500 font-medium">{f.condition}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. 全网热搜 */}
          {activeTab === 'hot' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1 p-1 rounded-xl ${isDarkMode ? 'bg-white/10' : 'bg-slate-100'}`}>
                  {[
                    { id: 'baidu', name: '百度热搜' },
                    { id: 'weibo', name: '微博热搜' },
                    { id: 'zhihu', name: '知乎热榜' },
                    { id: 'bilibili', name: 'B站热门' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setHotPlatform(p.id as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                        hotPlatform === p.id
                          ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                          : isDarkMode
                          ? 'text-white/70 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <span className={`text-[11px] ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>实时热榜</span>
              </div>

              {/* 热搜榜单 */}
              <div className="space-y-2">
                {(hotData[hotPlatform] || []).map((item, idx) => (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors group cursor-pointer ${
                      isDarkMode
                        ? 'bg-white/5 hover:bg-white/10 border-white/10'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          item.rank === 1
                            ? 'bg-amber-400 text-neutral-950'
                            : item.rank === 2
                            ? 'bg-slate-300 text-neutral-950'
                            : item.rank === 3
                            ? 'bg-amber-700 text-white'
                            : isDarkMode
                            ? 'bg-white/10 text-white/60'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {item.rank}
                      </span>
                      <span className={`text-xs sm:text-sm truncate transition-colors ${
                        isDarkMode ? 'text-white/90 group-hover:text-amber-300' : 'text-slate-800 group-hover:text-amber-600'
                      }`}>
                        {item.title}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs flex-shrink-0 ml-2 ${
                      isDarkMode ? 'text-white/40 group-hover:text-white/70' : 'text-slate-400 group-hover:text-slate-600'
                    }`}>
                      <span>{item.hot}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 6. 今天吃什么 */}
          {activeTab === 'food' && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
              <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                纠结吃什么？让 Mtab 帮你决定！
              </h3>
              <div className="p-8 rounded-3xl bg-amber-400/20 border-2 border-amber-400/60 shadow-2xl min-w-[240px]">
                <span className="text-4xl font-extrabold text-amber-500 dark:text-amber-300">{selectedFood}</span>
              </div>
              <button
                type="button"
                onClick={spinFood}
                disabled={isSpinningFood}
                className="px-8 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-base shadow-xl transition-transform active:scale-95 cursor-pointer disabled:opacity-50 whitespace-nowrap flex items-center justify-center gap-2"
              >
                <Utensils className="w-5 h-5 flex-shrink-0" />
                <span className="whitespace-nowrap">{isSpinningFood ? '正在抽选美味中...' : '换一个，再抽一次！'}</span>
              </button>
            </div>
          )}

          {/* 7. 每日诗词 */}
          {activeTab === 'poetry' && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
              <div className={`p-8 rounded-3xl border shadow-2xl max-w-md ${
                isDarkMode ? 'bg-white/5 border-white/15' : 'bg-slate-50 border-slate-200'
              }`}>
                <p className="text-xl sm:text-2xl font-serif text-amber-500 dark:text-amber-300 leading-relaxed mb-4">
                  “{poetry.text}”
                </p>
                <div className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>
                  —— {poetry.author} {poetry.origin}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentPoetryIndex((prev) => (prev + 1) % POETRY_LIST.length)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm whitespace-nowrap ${
                  isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">换一首诗词</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
