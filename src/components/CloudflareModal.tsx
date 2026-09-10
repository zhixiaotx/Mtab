import React, { useState, useEffect } from 'react';
import {
  X, Cloud, Database, Key, RefreshCw, CheckCircle2, AlertCircle, Copy, Check,
  Download, ArrowUpRight, ShieldCheck, Terminal, BookOpen, Layers, Zap
} from 'lucide-react';
import { CloudflareConfig, CloudflareStatusResponse } from '../types';
import { testCloudflareConnection, getCloudflareCode, initRemoteD1 } from '../utils/api';

interface CloudflareModalProps {
  isOpen: boolean;
  onClose: () => void;
  cloudflareConfig: CloudflareConfig;
  onSaveCloudflareConfig: (config: CloudflareConfig) => void;
  onPushData: () => Promise<void>;
  onPullData: () => Promise<void>;
  isSyncing: boolean;
  isDarkMode?: boolean;
}

export const CloudflareModal: React.FC<CloudflareModalProps> = ({
  isOpen,
  onClose,
  cloudflareConfig,
  onSaveCloudflareConfig,
  onPushData,
  onPullData,
  isSyncing,
  isDarkMode = true,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'guide' | 'worker' | 'sql'>('status');
  const [workerUrl, setWorkerUrl] = useState(cloudflareConfig.workerUrl || '');
  const [authToken, setAuthToken] = useState(cloudflareConfig.authToken || '');
  const [autoSync, setAutoSync] = useState(cloudflareConfig.autoSync || false);

  // 测试状态
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latency: number;
    corsSupported: boolean;
    status: CloudflareStatusResponse | null;
    error?: string;
  } | null>(null);

  // 代码与 SQL
  const [workerCode, setWorkerCode] = useState('');
  const [schemaSql, setSchemaSql] = useState('');
  const [copiedType, setCopiedType] = useState<'worker' | 'sql' | null>(null);

  // D1 远程一键建表
  const [isD1Initing, setIsD1Initing] = useState(false);
  const [d1InitMsg, setD1InitMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setWorkerUrl(cloudflareConfig.workerUrl || '');
      setAuthToken(cloudflareConfig.authToken || '');
      setAutoSync(cloudflareConfig.autoSync || false);

      // 获取 Worker 代码与 Schema
      getCloudflareCode().then((data) => {
        if (data.workerCode) setWorkerCode(data.workerCode);
        if (data.schemaSql) setSchemaSql(data.schemaSql);
      });

      // 默认进行一次测速与连通检测
      handleTestConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    const newConfig: CloudflareConfig = {
      ...cloudflareConfig,
      workerUrl: workerUrl.trim(),
      authToken: authToken.trim(),
      autoSync,
    };
    onSaveCloudflareConfig(newConfig);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setD1InitMsg(null);

    const tempConfig: CloudflareConfig = {
      ...cloudflareConfig,
      workerUrl: workerUrl.trim(),
      authToken: authToken.trim(),
    };

    const res = await testCloudflareConnection(tempConfig);
    setTestResult(res);
    setIsTesting(false);
  };

  const copyToClipboard = (text: string, type: 'worker' | 'sql') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    });
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRemoteD1Init = async () => {
    setIsD1Initing(true);
    setD1InitMsg(null);
    try {
      const res = await initRemoteD1({
        ...cloudflareConfig,
        workerUrl: workerUrl.trim(),
        authToken: authToken.trim(),
      });
      if (res.code === 1) {
        setD1InitMsg('D1 数据库所有表格已成功创建初始化！');
      } else {
        setD1InitMsg(`初始化返回: ${res.msg}`);
      }
    } catch (e: any) {
      setD1InitMsg(`初始化请求失败: ${e.message}`);
    } finally {
      setIsD1Initing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl max-h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 ${
          isDarkMode
            ? 'bg-neutral-900/95 backdrop-blur-2xl text-white shadow-black/60'
            : 'bg-white/95 backdrop-blur-2xl text-slate-900 shadow-slate-900/20'
        }`}
      >
        {/* 统一顶部标题栏 */}
        <div
          className={`flex items-center justify-between p-5 sm:p-6 pb-4 border-b flex-shrink-0 ${
            isDarkMode ? 'border-white/10 bg-black/20' : 'border-slate-200/80 bg-slate-50/70'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <span>Cloudflare 数据库同步中心</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                  CORS 跨域已解除
                </span>
              </h3>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                支持在 Cloudflare 网页控制台直接绑定 KV 或 D1，免去复杂配置，秒级跨端数据同步
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
              isDarkMode ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="关闭窗口"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 统一标签栏 */}
        <div
          className={`px-4 sm:px-6 py-2.5 border-b flex-shrink-0 ${
            isDarkMode ? 'border-white/10 bg-black/10' : 'border-slate-200/80 bg-slate-100/50'
          }`}
        >
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'status', label: '连接与测速', icon: Zap },
              { id: 'guide', label: '网页端绑定教程', icon: BookOpen },
              { id: 'worker', label: 'Worker 部署代码', icon: Terminal },
              { id: 'sql', label: 'D1 数据库建表 SQL', icon: Database },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                      : isDarkMode
                      ? 'text-white/70 hover:text-white hover:bg-white/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 内容主体 */}
        <div className={`flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          {/* TAB 1: 连接与状态测试 */}
          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* 配置表单 */}
              <div className={`p-4 rounded-2xl border space-y-3.5 ${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
              }`}>
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 flex items-center justify-between ${
                    isDarkMode ? 'text-white/80' : 'text-slate-700'
                  }`}>
                    <span>Cloudflare Worker 地址 (URL)</span>
                    <span className={`font-normal ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                      留空则连接内置本地 Express 仿真后端
                    </span>
                  </label>
                  <input
                    type="text"
                    value={workerUrl}
                    onChange={(e) => setWorkerUrl(e.target.value)}
                    placeholder="https://your-mtab-worker.workers.dev"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none font-mono transition-all ${
                      isDarkMode
                        ? 'bg-black/40 border border-white/15 text-white placeholder-white/40 focus:border-amber-400'
                        : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${
                      isDarkMode ? 'text-white/80' : 'text-slate-700'
                    }`}>
                      访问秘钥 AUTH_TOKEN (可选)
                    </label>
                    <input
                      type="password"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      placeholder="环境变量 AUTH_TOKEN（未设则留空）"
                      className={`w-full px-3.5 py-2 rounded-xl text-sm outline-none font-mono transition-all ${
                        isDarkMode
                          ? 'bg-black/40 border border-white/15 text-white placeholder-white/40 focus:border-amber-400'
                          : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                      }`}
                    />
                  </div>
                  <div className={`flex items-center justify-between p-2.5 rounded-xl border mt-auto ${
                    isDarkMode ? 'bg-black/20 border-white/10' : 'bg-white border-slate-200'
                  }`}>
                    <div>
                      <div className="text-xs font-semibold">变更时自动同步</div>
                      <div className={`text-[11px] ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                        修改书签或便签后自动推送云端
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSync}
                      onChange={(e) => setAutoSync(e.target.checked)}
                      className="w-4 h-4 accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? '正在检测与测试延迟...' : '测试连接 & CORS 跨域'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold transition-colors cursor-pointer shadow-sm active:scale-95"
                  >
                    保存服务配置
                  </button>
                </div>
              </div>

              {/* 连通性测试报告卡片 */}
              {testResult && (
                <div
                  className={`p-4 rounded-2xl border ${
                    testResult.success
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-rose-950/20 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      {testResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      )}
                      <div>
                        <div className="text-sm font-bold text-white">
                          {testResult.success ? '连接与 CORS 跨域测试成功！' : '连接检测失败'}
                        </div>
                        <div className="text-xs text-white/60 mt-0.5">
                          {testResult.error || (testResult.status ? testResult.status.msg : '服务正常响应')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-amber-300">
                        响应延迟: {testResult.latency} ms
                      </span>
                    </div>
                  </div>

                  {testResult.status && (
                    <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-black/30">
                        <span className="text-white/40 block">当前识别数据库</span>
                        <span className="font-bold text-amber-300 capitalize">{testResult.status.dbType}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/30">
                        <span className="text-white/40 block">D1 数据库绑定</span>
                        <span className={testResult.status.d1Bound ? 'text-emerald-400 font-bold' : 'text-white/40'}>
                          {testResult.status.d1Bound ? '已绑定' : '未绑定'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/30">
                        <span className="text-white/40 block">KV 存储命名空间</span>
                        <span className={testResult.status.kvBound ? 'text-emerald-400 font-bold' : 'text-white/40'}>
                          {testResult.status.kvBound ? '已绑定' : '未绑定'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/30">
                        <span className="text-white/40 block">CORS 预检支持</span>
                        <span className="text-emerald-400 font-bold">全域开放 (*)</span>
                      </div>
                    </div>
                  )}

                  {/* 如果是 D1 且需要一键建表 */}
                  {testResult.status?.dbType === 'd1' && (
                    <div className="mt-3 pt-2 flex items-center justify-between">
                      <span className="text-xs text-white/60">
                        已绑定 D1 数据库。如首次使用，可一键完成建表：
                      </span>
                      <button
                        onClick={handleRemoteD1Init}
                        disabled={isD1Initing}
                        className="px-3 py-1 rounded-lg bg-amber-400 text-neutral-950 text-xs font-semibold hover:bg-amber-300 transition-colors cursor-pointer"
                      >
                        {isD1Initing ? '初始化中...' : '一键初始化 D1 表结构'}
                      </button>
                    </div>
                  )}
                  {d1InitMsg && (
                    <div className="mt-2 text-xs text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30">
                      {d1InitMsg}
                    </div>
                  )}
                </div>
              )}

              {/* 手动全量同步控制区 */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-sm">云端数据手动同步</div>
                  <div className="text-xs text-white/50 mt-0.5">
                    一键推送当前所有配置、书签、便签至 Cloudflare，或从云端拉取恢复
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={onPullData}
                    disabled={isSyncing}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>从云端拉取</span>
                  </button>
                  <button
                    onClick={onPushData}
                    disabled={isSyncing}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold cursor-pointer transition-colors shadow-md"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>推送至云端</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 网页端绑定教程 */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs sm:text-sm text-white/80 leading-relaxed">
              <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs">
                💡 <strong>核心亮点：</strong> 本项目完全适配 Cloudflare 网页端控制台，无需安装本地 wrangler 命令行工具，在浏览器中即可 100% 完成创建、绑定与部署！
              </div>

              {/* 步骤 1 */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center text-xs">1</span>
                  <span>创建 Cloudflare Worker 实例</span>
                </div>
                <p className="text-white/60 pl-8">
                  登录 <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="text-amber-300 underline inline-flex items-center gap-0.5">Cloudflare 控制台 <ArrowUpRight className="w-3 h-3" /></a>，进入 <strong>Workers 与 Pages</strong> → 点击 <strong>创建 (Create Application)</strong> → <strong>创建 Worker</strong>。
                </p>
              </div>

              {/* 步骤 2 */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center text-xs">2</span>
                  <span>粘贴 Worker 代码</span>
                </div>
                <p className="text-white/60 pl-8">
                  切换到本窗口的 <strong>“Worker 部署代码”</strong> 标签页，点击右上角 <strong>一键复制全部代码</strong>，在 Cloudflare 的在线编辑器中全选替换原代码，并点击 <strong>部署 (Deploy)</strong>。
                </p>
              </div>

              {/* 步骤 3 */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center text-xs">3</span>
                  <span>在网页端直接绑定 KV 或 D1（任选一种或两者皆可）</span>
                </div>
                <div className="pl-8 space-y-3">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
                      <Layers className="w-4 h-4" />
                      <span>方案 A：绑定 Cloudflare KV (最简，推荐新手)</span>
                    </div>
                    <ol className="list-decimal list-inside text-white/70 space-y-1 text-xs">
                      <li>左侧菜单进入 <strong>Workers 与 Pages</strong> → <strong>KV</strong> → 创建一个命名空间（例如 <code>mtab-kv</code>）。</li>
                      <li>回到刚创建的 Worker 页面 → 点击 <strong>设置 (Settings)</strong> → <strong>变量和机密 (Variables and Bindings)</strong>。</li>
                      <li>在 <strong>KV 命名空间绑定</strong> 区域点击 <strong>添加绑定</strong>：</li>
                      <li>变量名称 (Variable name) 务必填入：<code className="text-amber-300 bg-white/10 px-1 rounded">MTAB_KV</code></li>
                      <li>KV 命名空间选择您刚才创建的 <code>mtab-kv</code>，保存并重新部署即可！</li>
                    </ol>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="font-semibold text-teal-300 flex items-center gap-1.5 mb-1">
                      <Database className="w-4 h-4" />
                      <span>方案 B：绑定 Cloudflare D1 (关系型 SQL，高性能)</span>
                    </div>
                    <ol className="list-decimal list-inside text-white/70 space-y-1 text-xs">
                      <li>左侧菜单进入 <strong>D1 数据库</strong> → 创建一个数据库（例如 <code>mtab-db</code>）。</li>
                      <li>进入 Worker 页面 → <strong>设置 (Settings)</strong> → <strong>变量和机密 (Variables and Bindings)</strong>。</li>
                      <li>在 <strong>D1 数据库绑定</strong> 区域点击 <strong>添加绑定</strong>：</li>
                      <li>变量名称 (Variable name) 务必填入：<code className="text-teal-300 bg-white/10 px-1 rounded">MTAB_D1</code></li>
                      <li>D1 数据库选择您创建的 <code>mtab-db</code>，保存并重新部署！</li>
                      <li>回到本系统“连接与测速”页面，点击 <strong>“一键初始化 D1 表结构”</strong> 即可全自动建表！</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* 步骤 4 */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center text-xs">4</span>
                  <span>解决 CORS 跨域问题验证</span>
                </div>
                <p className="text-white/60 pl-8">
                  本 Worker 代码已内嵌全套 CORS 逻辑，自动放行所有 OPTIONS 预检请求并返回 <code>Access-Control-Allow-Origin: *</code> 与所有常用请求头，无论从任何域名、本地开发端口或手机浏览器请求，均永不报跨域错误！
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Worker 部署代码 */}
          {activeTab === 'worker' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">
                  复制以下完整的 JavaScript 代码至 Cloudflare Worker 网页在线编辑器
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadFile(workerCode, 'mtab-worker.js')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下载 .js 文件</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(workerCode, 'worker')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs cursor-pointer transition-colors"
                  >
                    {copiedType === 'worker' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'worker' ? '已复制全部代码！' : '一键复制全部代码'}</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/60">
                <pre className="p-4 text-xs font-mono text-white/90 overflow-x-auto max-h-[50vh] leading-relaxed">
                  {workerCode || '// 正在加载 Cloudflare Worker 代码...'}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: D1 数据库 SQL */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">
                  用于在 Cloudflare D1 网页端 Console 中手动执行建表
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadFile(schemaSql, 'mtab-d1-schema.sql')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下载 .sql 文件</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(schemaSql, 'sql')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-400 hover:bg-teal-300 text-neutral-950 font-bold text-xs cursor-pointer transition-colors"
                  >
                    {copiedType === 'sql' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'sql' ? '已复制 SQL！' : '一键复制 D1 SQL'}</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/60">
                <pre className="p-4 text-xs font-mono text-teal-200 overflow-x-auto max-h-[50vh] leading-relaxed">
                  {schemaSql || '-- 正在加载 D1 建表 SQL...'}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* 统一模态底部固定操作栏 */}
        <div
          className={`flex items-center justify-between p-4 sm:p-5 border-t flex-shrink-0 ${
            isDarkMode ? 'border-white/10 bg-black/20' : 'border-slate-200/80 bg-slate-50/70'
          }`}
        >
          <div className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
            Mtab Cloudflare Edition · 完美跨域兼容
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-sm font-semibold transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
