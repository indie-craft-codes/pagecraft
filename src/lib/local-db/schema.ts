import Database from "better-sqlite3";
import path from "path";

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    const dbPath = path.join(process.cwd(), "local.db");
    _db = new Database(dbPath);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      plan TEXT NOT NULL DEFAULT 'free',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      pages_created_this_month INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      html_content TEXT NOT NULL DEFAULT '',
      meta_title TEXT,
      meta_description TEXT,
      published INTEGER NOT NULL DEFAULT 0,
      custom_domain TEXT,
      thumbnail_url TEXT,
      webhook_url TEXT,
      site_settings TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      project_id TEXT NOT NULL,
      email TEXT NOT NULL,
      data TEXT DEFAULT '{}',
      source TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS variants (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      project_id TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT 'Variant A',
      html_content TEXT NOT NULL DEFAULT '',
      traffic_weight INTEGER NOT NULL DEFAULT 50,
      views INTEGER NOT NULL DEFAULT 0,
      conversions INTEGER NOT NULL DEFAULT 0,
      is_winner INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS brand_kits (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      team_id TEXT,
      name TEXT NOT NULL DEFAULT 'Default',
      logo_url TEXT,
      primary_color TEXT DEFAULT '#4f46e5',
      secondary_color TEXT DEFAULT '#7c3aed',
      accent_color TEXT DEFAULT '#06b6d4',
      font_heading TEXT DEFAULT 'Inter',
      font_body TEXT DEFAULT 'Inter',
      tone TEXT DEFAULT 'professional',
      tagline TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS page_events (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      project_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      visitor_id TEXT,
      country TEXT,
      device TEXT,
      referrer TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      referrer_id TEXT NOT NULL,
      referred_id TEXT,
      referral_code TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (referrer_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      project_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT 'Untitled',
      slug TEXT NOT NULL DEFAULT 'page',
      html_content TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_home INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      UNIQUE(project_id, slug)
    );

    CREATE TABLE IF NOT EXISTS integrations (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      project_id TEXT NOT NULL,
      type TEXT NOT NULL,
      config TEXT NOT NULL DEFAULT '{}',
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      UNIQUE(project_id, type)
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT 'Default',
      key_hash TEXT UNIQUE NOT NULL,
      key_prefix TEXT NOT NULL,
      last_used_at TEXT,
      requests_this_month INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
    );
  `);

  // Seed a default local dev user if not exists
  const existing = db
    .prepare("SELECT id FROM profiles WHERE id = ?")
    .get("local-dev-user");
  if (!existing) {
    db.prepare(
      `INSERT INTO profiles (id, email, full_name, plan) VALUES (?, ?, ?, ?)`
    ).run("local-dev-user", "dev@pagecraft.local", "Local Developer", "team");
  }
}
