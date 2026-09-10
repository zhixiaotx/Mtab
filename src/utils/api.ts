import { CloudflareConfig, CloudflareStatusResponse, MtabConfig, BookmarkItem, NoteItem, TodoItem } from '../types';

export function getEffectiveApiBase(config: CloudflareConfig): string {
  if (config.workerUrl && config.workerUrl.trim()) {
    let url = config.workerUrl.trim();
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    return url;
  }
  return ''; // 本地 Express 服务相对路径
}

export function getAuthHeaders(config: CloudflareConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.authToken && config.authToken.trim()) {
    headers['X-Mtab-Token'] = config.authToken.trim();
    headers['Authorization'] = `Bearer ${config.authToken.trim()}`;
  }
  return headers;
}

// 检查 Cloudflare Worker 连通性、CORS 与数据库类型
export async function testCloudflareConnection(
  config: CloudflareConfig
): Promise<{
  success: boolean;
  latency: number;
  corsSupported: boolean;
  status: CloudflareStatusResponse | null;
  error?: string;
}> {
  const base = getEffectiveApiBase(config);
  const targetUrl = `${base}/api/status`;
  const startTime = performance.now();

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: getAuthHeaders(config),
      mode: 'cors',
    });

    const latency = Math.round(performance.now() - startTime);
    const corsHeader = res.headers.get('access-control-allow-origin');
    const corsSupported = corsHeader === '*' || Boolean(corsHeader);

    if (!res.ok) {
      return {
        success: false,
        latency,
        corsSupported,
        status: null,
        error: `HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const data: CloudflareStatusResponse = await res.json();
    return {
      success: true,
      latency,
      corsSupported,
      status: data,
    };
  } catch (err: any) {
    const latency = Math.round(performance.now() - startTime);
    return {
      success: false,
      latency,
      corsSupported: false,
      status: null,
      error: err.message || '网络连接超时或存在跨域错误',
    };
  }
}

// 全量拉取
export async function fetchAllData(config: CloudflareConfig) {
  const base = getEffectiveApiBase(config);
  const res = await fetch(`${base}/api/sync/all`, {
    method: 'GET',
    headers: getAuthHeaders(config),
  });
  if (!res.ok) {
    throw new Error(`拉取数据失败: ${res.statusText}`);
  }
  return await res.json();
}

// 全量保存
export async function pushAllData(
  config: CloudflareConfig,
  payload: {
    config: MtabConfig;
    links: BookmarkItem[];
    notes: NoteItem[];
    todos: TodoItem[];
  }
) {
  const base = getEffectiveApiBase(config);
  const res = await fetch(`${base}/api/sync/all`, {
    method: 'POST',
    headers: getAuthHeaders(config),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`推送同步失败: ${res.statusText}`);
  }
  return await res.json();
}

// 获取 Cloudflare Worker 代码与 D1 Schema
export async function getCloudflareCode(): Promise<{ workerCode: string; schemaSql: string }> {
  try {
    const res = await fetch('/api/cloudflare/code');
    if (res.ok) {
      const data = await res.json();
      return {
        workerCode: data.workerCode || '',
        schemaSql: data.schemaSql || '',
      };
    }
  } catch (e) {
    // ignore
  }
  return { workerCode: '', schemaSql: '' };
}

// 初始化远程 D1 数据库表结构
export async function initRemoteD1(config: CloudflareConfig) {
  const base = getEffectiveApiBase(config);
  const res = await fetch(`${base}/api/d1/init`, {
    method: 'POST',
    headers: getAuthHeaders(config),
  });
  return await res.json();
}
