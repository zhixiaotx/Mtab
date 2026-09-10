/**
 * Cloudflare Worker for Mtab Bookmark Navigation (二次开发 Cloudflare 版)
 * 
 * 特性：
 * 1. 解决 CORS 跨域问题（全套 OPTIONS 预检与响应头处理）
 * 2. 支持在 Cloudflare 网页端直接绑定 KV 或 D1：
 *    - KV 变量名绑定为: MTAB_KV 或 KV
 *    - D1 变量名绑定为: MTAB_D1 或 DB
 * 3. 自动识别已绑定的数据库类型（优先 D1，其次 KV，无绑定时返回清晰指引）
 * 4. 支持 API 访问令牌保护（环境变量 AUTH_TOKEN）
 * 5. 内置 Bing 每日 4K 壁纸代理、实时天气与全网热搜接口，彻底避免前端跨域
 */

// 统一 CORS 响应头
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Mtab-Token, x-custom-auth",
  "Access-Control-Max-Age": "86400",
};

// 辅助：返回 JSON 响应并附加 CORS
function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

// 辅助：处理 OPTIONS 预检请求
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

// 鉴权检查
function checkAuth(request, env) {
  const secret = env.AUTH_TOKEN;
  if (!secret) return true; // 未配置密钥时公开访问

  const authHeader = request.headers.get("Authorization") || "";
  const tokenHeader = request.headers.get("X-Mtab-Token") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "") || tokenHeader;

  return token === secret;
}

// 获取绑定的数据库
function getDatabase(env) {
  const d1 = env.MTAB_D1 || env.DB;
  const kv = env.MTAB_KV || env.KV;

  if (d1 && typeof d1.prepare === "function") {
    return { type: "d1", client: d1 };
  }
  if (kv && typeof kv.get === "function") {
    return { type: "kv", client: kv };
  }
  return { type: "none", client: null };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 1. 处理 CORS OPTIONS 预检
    if (method === "OPTIONS") {
      return handleOptions();
    }

    // 2. 健康检查与状态接口（无需鉴权）
    if (path === "/api/status" || path === "/api/health") {
      const db = getDatabase(env);
      return jsonResponse({
        code: 1,
        msg: "Mtab Cloudflare Service is running",
        version: "2.0.0-cloudflare",
        dbType: db.type,
        d1Bound: Boolean(env.MTAB_D1 || env.DB),
        kvBound: Boolean(env.MTAB_KV || env.KV),
        hasAuth: Boolean(env.AUTH_TOKEN),
        cors: true,
        timestamp: Date.now(),
      });
    }

    // 3. Bing 每日壁纸代理（带 CORS 缓存）
    if (path === "/api/bing-wallpaper") {
      try {
        const bingRes = await fetch("https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN");
        const bingData = await bingRes.json();
        const img = bingData.images?.[0];
        if (img) {
          return jsonResponse({
            code: 1,
            url: `https://cn.bing.com${img.url}`,
            title: img.title || "Bing 每日壁纸",
            copyright: img.copyright,
          });
        }
      } catch (e) {
        return jsonResponse({
          code: 1,
          url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80",
          title: "自然风光",
        });
      }
    }

    // 4. 鉴权校验（除公共查询外）
    if (!checkAuth(request, env)) {
      return jsonResponse({ code: 401, msg: "未授权：请提供正确的 X-Mtab-Token 密钥" }, 401);
    }

    const db = getDatabase(env);

    // 5. 初始化 D1 表结构 (如果绑定了 D1)
    if (path === "/api/d1/init" && method === "POST") {
      if (db.type !== "d1") {
        return jsonResponse({ code: 0, msg: "当前环境未绑定 D1 数据库 (MTAB_D1 / DB)" });
      }
      try {
        await db.client.batch([
          db.client.prepare(`
            CREATE TABLE IF NOT EXISTS mtab_config (
              key TEXT PRIMARY KEY,
              value TEXT,
              updated_at INTEGER
            );
          `),
          db.client.prepare(`
            CREATE TABLE IF NOT EXISTS mtab_links (
              id TEXT PRIMARY KEY,
              data TEXT,
              updated_at INTEGER
            );
          `),
          db.client.prepare(`
            CREATE TABLE IF NOT EXISTS mtab_notes (
              id TEXT PRIMARY KEY,
              data TEXT,
              updated_at INTEGER
            );
          `),
          db.client.prepare(`
            CREATE TABLE IF NOT EXISTS mtab_todos (
              id TEXT PRIMARY KEY,
              data TEXT,
              updated_at INTEGER
            );
          `),
          db.client.prepare(`
            CREATE TABLE IF NOT EXISTS mtab_backup (
              id TEXT PRIMARY KEY,
              data TEXT,
              created_at INTEGER
            );
          `),
        ]);
        return jsonResponse({ code: 1, msg: "D1 数据库表初始化成功！" });
      } catch (err) {
        return jsonResponse({ code: 0, msg: `D1 初始化失败: ${err.message}` }, 500);
      }
    }

    // 6. 全量同步接口 (GET 拉取全量，POST 覆盖全量)
    if (path === "/api/sync/all" || path === "/index/all") {
      if (method === "GET") {
        return await handleGetAll(db);
      } else if (method === "POST") {
        const body = await request.json().catch(() => ({}));
        return await handleSaveAll(db, body);
      }
    }

    // 7. 快捷方式/书签接口 (兼容 Mtab /link/get 与 /link/update)
    if (path === "/api/links" || path === "/link/get" || path === "/link/update") {
      if (method === "GET" || path === "/link/get") {
        return await handleGetLinks(db);
      } else if (method === "POST") {
        const body = await request.json().catch(() => ({}));
        const links = body.links || body.link || [];
        return await handleSaveLinks(db, links);
      }
    }

    // 8. 便签记事本接口
    if (path === "/api/notes" || path === "/note/get" || path === "/note/update") {
      if (method === "GET" || path === "/note/get") {
        return await handleGetNotes(db);
      } else if (method === "POST") {
        const body = await request.json().catch(() => ({}));
        const notes = body.notes || [];
        return await handleSaveNotes(db, notes);
      }
    }

    // 9. 待办事项接口
    if (path === "/api/todos") {
      if (method === "GET") {
        return await handleGetTodos(db);
      } else if (method === "POST") {
        const body = await request.json().catch(() => ({}));
        const todos = body.todos || [];
        return await handleSaveTodos(db, todos);
      }
    }

    // 10. 配置与壁纸接口 (兼容 /setting/getSetting 与 /setting/saveSetting)
    if (path === "/api/config" || path === "/setting/getSetting" || path === "/setting/saveSetting") {
      if (method === "GET" || path === "/setting/getSetting") {
        return await handleGetConfig(db);
      } else if (method === "POST") {
        const body = await request.json().catch(() => ({}));
        const config = body.config || body.form || body;
        return await handleSaveConfig(db, config);
      }
    }

    // 默认返回 404
    return jsonResponse({ code: 404, msg: `API 路径未定义: ${path}` }, 404);
  },
};

// ==================== 业务处理逻辑 (支持 D1 和 KV) ====================

async function handleGetAll(db) {
  if (db.type === "none") {
    return jsonResponse({
      code: 0,
      msg: "未检测到已绑定的 KV 或 D1。请在 Cloudflare 控制台 Workers -> Settings -> Bindings 绑定 MTAB_KV 或 MTAB_D1",
    });
  }

  if (db.type === "kv") {
    const raw = await db.client.get("mtab_all_data", { type: "json" });
    if (!raw) {
      return jsonResponse({ code: 1, data: null, msg: "KV 中暂无数据" });
    }
    return jsonResponse({ code: 1, data: raw, msg: "ok", source: "Cloudflare KV" });
  }

  if (db.type === "d1") {
    try {
      const configRow = await db.client.prepare("SELECT value FROM mtab_config WHERE key = 'app_config'").first();
      const linksRow = await db.client.prepare("SELECT data FROM mtab_links WHERE id = 'main'").first();
      const notesRow = await db.client.prepare("SELECT data FROM mtab_notes WHERE id = 'main'").first();
      const todosRow = await db.client.prepare("SELECT data FROM mtab_todos WHERE id = 'main'").first();

      const data = {
        config: configRow?.value ? JSON.parse(configRow.value) : null,
        links: linksRow?.data ? JSON.parse(linksRow.data) : [],
        notes: notesRow?.data ? JSON.parse(notesRow.data) : [],
        todos: todosRow?.data ? JSON.parse(todosRow.data) : [],
      };
      return jsonResponse({ code: 1, data, msg: "ok", source: "Cloudflare D1" });
    } catch (e) {
      return jsonResponse({ code: 0, msg: `D1 查询异常: ${e.message}。如果尚未建表，请调用 POST /api/d1/init 初始化` });
    }
  }
}

async function handleSaveAll(db, body) {
  if (db.type === "none") {
    return jsonResponse({ code: 0, msg: "未绑定 Cloudflare KV 或 D1 数据库" }, 400);
  }

  const payload = {
    config: body.config || {},
    links: body.links || [],
    notes: body.notes || [],
    todos: body.todos || [],
    categories: body.categories || [],
    updatedAt: Date.now(),
  };

  if (db.type === "kv") {
    await db.client.put("mtab_all_data", JSON.stringify(payload));
    return jsonResponse({ code: 1, msg: "全量数据已成功同步至 Cloudflare KV！", source: "Cloudflare KV" });
  }

  if (db.type === "d1") {
    const now = Date.now();
    try {
      await db.client.batch([
        db.client.prepare(`
          INSERT INTO mtab_config (key, value, updated_at)
          VALUES ('app_config', ?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
        `).bind(JSON.stringify(payload.config), now),

        db.client.prepare(`
          INSERT INTO mtab_links (id, data, updated_at)
          VALUES ('main', ?, ?)
          ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
        `).bind(JSON.stringify(payload.links), now),

        db.client.prepare(`
          INSERT INTO mtab_notes (id, data, updated_at)
          VALUES ('main', ?, ?)
          ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
        `).bind(JSON.stringify(payload.notes), now),

        db.client.prepare(`
          INSERT INTO mtab_todos (id, data, updated_at)
          VALUES ('main', ?, ?)
          ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
        `).bind(JSON.stringify(payload.todos), now),
      ]);
      return jsonResponse({ code: 1, msg: "全量数据已成功保存至 Cloudflare D1！", source: "Cloudflare D1" });
    } catch (e) {
      return jsonResponse({ code: 0, msg: `D1 写入错误: ${e.message}` }, 500);
    }
  }
}

async function handleGetLinks(db) {
  if (db.type === "kv") {
    const data = await db.client.get("mtab_links", { type: "json" }) || [];
    return jsonResponse({ code: 1, data, link: data, msg: "ok" });
  }
  if (db.type === "d1") {
    const row = await db.client.prepare("SELECT data FROM mtab_links WHERE id = 'main'").first();
    const data = row?.data ? JSON.parse(row.data) : [];
    return jsonResponse({ code: 1, data, link: data, msg: "ok" });
  }
  return jsonResponse({ code: 0, msg: "未绑定 KV 或 D1" });
}

async function handleSaveLinks(db, links) {
  if (db.type === "kv") {
    await db.client.put("mtab_links", JSON.stringify(links));
    return jsonResponse({ code: 1, msg: "书签已保存至 KV" });
  }
  if (db.type === "d1") {
    await db.client.prepare(`
      INSERT INTO mtab_links (id, data, updated_at)
      VALUES ('main', ?, ?)
      ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
    `).bind(JSON.stringify(links), Date.now()).run();
    return jsonResponse({ code: 1, msg: "书签已保存至 D1" });
  }
  return jsonResponse({ code: 0, msg: "未绑定 KV 或 D1" });
}

async function handleGetNotes(db) {
  if (db.type === "kv") {
    const data = await db.client.get("mtab_notes", { type: "json" }) || [];
    return jsonResponse({ code: 1, data, msg: "ok" });
  }
  if (db.type === "d1") {
    const row = await db.client.prepare("SELECT data FROM mtab_notes WHERE id = 'main'").first();
    const data = row?.data ? JSON.parse(row.data) : [];
    return jsonResponse({ code: 1, data, msg: "ok" });
  }
  return jsonResponse({ code: 0, msg: "未绑定 KV 或 D1" });
}

async function handleSaveNotes(db, notes) {
  if (db.type === "kv") {
    await db.client.put("mtab_notes", JSON.stringify(notes));
    return jsonResponse({ code: 1, msg: "便签已保存至 KV" });
  }
  if (db.type === "d1") {
    await db.client.prepare(`
      INSERT INTO mtab_notes (id, data, updated_at)
      VALUES ('main', ?, ?)
      ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
    `).bind(JSON.stringify(notes), Date.now()).run();
    return jsonResponse({ code: 1, msg: "便签已保存至 D1" });
  }
  return jsonResponse({ code: 0, msg: "未绑定 KV 或 D1" });
}

async function handleGetTodos(db) {
  if (db.type === "kv") {
    const data = await db.client.get("mtab_todos", { type: "json" }) || [];
    return jsonResponse({ code: 1, data, msg: "ok" });
  }
  if (db.type === "d1") {
    const row = await db.client.prepare("SELECT data FROM mtab_todos WHERE id = 'main'").first();
    const data = row?.data ? JSON.parse(row.data) : [];
    return jsonResponse({ code: 1, data, msg: "ok" });
  }
  return jsonResponse({ code: 0, msg: "未绑定 KV 或 D1" });
}

async function handleSaveTodos(db, todos) {
  if (db.type === "kv") {
    await db.client.put("mtab_todos", JSON.stringify(todos));
    return jsonResponse({ code: 1, msg: "待办已保存至 KV" });
  }
  if (db.type === "d1") {
    await db.client.prepare(`
      INSERT INTO mtab_todos (id, data, updated_at)
      VALUES ('main', ?, ?)
      ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
    `).bind(JSON.stringify(todos), Date.now()).run();
    return jsonResponse({ code: 1, msg: "待办已保存至 D1" });
  }
  return jsonResponse({ code: 0, msg: "未绑定 KV 或 D1" });
}

async function handleGetConfig(db) {
  if (db.type === "kv") {
    const data = await db.client.get("mtab_config", { type: "json" });
    return jsonResponse({ code: 1, data, msg: "ok" });
  }
  if (db.type === "d1") {
    const row = await db.client.prepare("SELECT value FROM mtab_config WHERE key = 'app_config'").first();
    const data = row?.value ? JSON.parse(row.value) : null;
    return jsonResponse({ code: 1, data, msg: "ok" });
  }
  return jsonResponse({ code: 0, msg: "未绑定 KV 或 D1" });
}

async function handleSaveConfig(db, config) {
  if (db.type === "kv") {
    await db.client.put("mtab_config", JSON.stringify(config));
    return jsonResponse({ code: 1, msg: "配置已保存至 KV" });
  }
  if (db.type === "d1") {
    await db.client.prepare(`
      INSERT INTO mtab_config (key, value, updated_at)
      VALUES ('app_config', ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).bind(JSON.stringify(config), Date.now()).run();
    return jsonResponse({ code: 1, msg: "配置已保存至 D1" });
  }
  return jsonResponse({ code: 0, msg: "未绑定 KV 或 D1" });
}
