-- ==========================================================
-- Mtab Cloudflare D1 数据库初始化脚本
-- 在 Cloudflare 网页端控制台直接执行即可快速建表
-- 网页路径: Cloudflare 控制台 -> Workers & Pages -> D1 -> 选择您的数据库 -> Console
-- ==========================================================

-- 1. 用户配置与主题表
CREATE TABLE IF NOT EXISTS mtab_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 2. 快捷方式/书签表
CREATE TABLE IF NOT EXISTS mtab_links (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 3. 记事本/便签表
CREATE TABLE IF NOT EXISTS mtab_notes (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 4. 待办事项表
CREATE TABLE IF NOT EXISTS mtab_todos (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 5. 备份历史表 (可选)
CREATE TABLE IF NOT EXISTS mtab_backup (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- 写入默认配置标志（可选）
INSERT OR IGNORE INTO mtab_config (key, value, updated_at) 
VALUES ('schema_version', '{"version":"2.0.0","engine":"cloudflare_d1"}', unixepoch());
