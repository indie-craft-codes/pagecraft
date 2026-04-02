import { getDb } from "./schema";

/**
 * Minimal Supabase-compatible client backed by SQLite.
 * Only implements the subset of the Supabase API that PageCraft uses.
 */

type Row = Record<string, unknown>;

// Local dev user — always authenticated
const LOCAL_USER = {
  id: "local-dev-user",
  email: "dev@pagecraft.local",
  user_metadata: { full_name: "Local Developer" },
};

class QueryBuilder {
  private table: string;
  private _select = "*";
  private _where: { col: string; val: unknown }[] = [];
  private _order: { col: string; asc: boolean } | null = null;
  private _limit: number | null = null;
  private _single = false;
  private _count = false;
  private _head = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = "*", opts?: { count?: string; head?: boolean }) {
    this._select = columns === "*" ? "*" : columns;
    if (opts?.count) this._count = true;
    if (opts?.head) this._head = true;
    return this;
  }

  eq(col: string, val: unknown) {
    this._where.push({ col, val });
    return this;
  }

  in(col: string, vals: unknown[]) {
    // Flatten IN clause to multiple OR-like conditions
    // For simplicity, just use the first match approach
    this._where.push({ col, val: vals });
    return this;
  }

  gte(col: string, val: unknown) {
    this._where.push({ col: `${col}>=`, val });
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this._order = { col, asc: opts?.ascending ?? true };
    return this;
  }

  limit(n: number) {
    this._limit = n;
    return this;
  }

  single() {
    this._single = true;
    return this._execute();
  }

  then(
    resolve: (value: { data: Row[] | Row | null; error: null; count?: number }) => void,
    reject?: (err: unknown) => void
  ) {
    try {
      resolve(this._execute());
    } catch (e) {
      if (reject) reject(e);
    }
  }

  private _execute(): { data: Row[] | Row | null; error: null; count?: number } {
    const db = getDb();
    let sql = `SELECT ${this._select === "*" ? "*" : this._select} FROM ${this.table}`;
    const params: unknown[] = [];

    if (this._where.length > 0) {
      const conditions = this._where.map((w) => {
        if (w.col.endsWith(">=")) {
          const realCol = w.col.slice(0, -2);
          params.push(w.val);
          return `${realCol} >= ?`;
        }
        if (Array.isArray(w.val)) {
          const placeholders = w.val.map(() => "?").join(",");
          params.push(...w.val);
          return `${w.col} IN (${placeholders})`;
        }
        params.push(w.val);
        return `${w.col} = ?`;
      });
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    if (this._order) {
      sql += ` ORDER BY ${this._order.col} ${this._order.asc ? "ASC" : "DESC"}`;
    }

    if (this._limit) {
      sql += ` LIMIT ${this._limit}`;
    }

    if (this._count && this._head) {
      const countSql = sql.replace(/^SELECT .* FROM/, "SELECT COUNT(*) as count FROM");
      const result = db.prepare(countSql).get(...(params as [])) as { count: number } | undefined;
      return { data: null, error: null, count: result?.count ?? 0 };
    }

    const rows = db.prepare(sql).all(...(params as [])) as Row[];

    // Parse JSON columns
    const jsonCols = ["data", "config", "site_settings"];
    const parsed = rows.map((row) => {
      const r = { ...row };
      for (const col of jsonCols) {
        if (typeof r[col] === "string") {
          try {
            r[col] = JSON.parse(r[col] as string);
          } catch {
            // keep as string
          }
        }
      }
      // SQLite uses 0/1 for booleans
      if ("published" in r) r.published = !!r.published;
      if ("is_winner" in r) r.is_winner = !!r.is_winner;
      if ("is_home" in r) r.is_home = !!r.is_home;
      if ("enabled" in r) r.enabled = !!r.enabled;
      if ("accepted" in r) r.accepted = !!r.accepted;
      return r;
    });

    if (this._single) {
      if (parsed.length === 0) {
        return { data: null, error: null };
      }
      return { data: parsed[0], error: null };
    }

    return { data: parsed, error: null };
  }
}

class InsertBuilder {
  private table: string;
  private rows: Row[];

  constructor(table: string, rows: Row | Row[]) {
    this.rows = Array.isArray(rows) ? rows : [rows];
    this.table = table;
  }

  select() {
    return this;
  }

  single() {
    const db = getDb();
    const row = this.rows[0];
    const cols = Object.keys(row);
    const placeholders = cols.map(() => "?").join(",");
    const vals = cols.map((c) => {
      const v = row[c];
      if (typeof v === "object" && v !== null) return JSON.stringify(v);
      if (typeof v === "boolean") return v ? 1 : 0;
      return v;
    });

    // Generate ID if not provided
    if (!row.id && cols.indexOf("id") === -1) {
      cols.push("id");
      const id = crypto.randomUUID();
      vals.push(id);
      row.id = id;
    }

    try {
      db.prepare(
        `INSERT INTO ${this.table} (${cols.join(",")}) VALUES (${placeholders}${!row.id ? "" : ""})`
      ).run(...(vals as []));
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err.message?.includes("UNIQUE")) {
        return { data: null, error: { code: "23505", message: err.message } };
      }
      return { data: null, error: { code: "UNKNOWN", message: err.message } };
    }

    // Re-read the inserted row
    const insertedId = row.id || db.prepare("SELECT last_insert_rowid() as id").get();
    const inserted = db
      .prepare(`SELECT * FROM ${this.table} WHERE id = ?`)
      .get(row.id as string) as Row | undefined;

    return { data: inserted || row, error: null };
  }

  then(
    resolve: (value: { data: null; error: null }) => void,
  ) {
    const db = getDb();
    for (const row of this.rows) {
      const cols = Object.keys(row);
      const vals = cols.map((c) => {
        const v = row[c];
        if (typeof v === "object" && v !== null) return JSON.stringify(v);
        if (typeof v === "boolean") return v ? 1 : 0;
        return v;
      });
      if (!row.id) {
        cols.push("id");
        vals.push(crypto.randomUUID());
      }
      const placeholders = cols.map(() => "?").join(",");
      try {
        db.prepare(
          `INSERT INTO ${this.table} (${cols.join(",")}) VALUES (${placeholders})`
        ).run(...(vals as []));
      } catch {
        // ignore
      }
    }
    resolve({ data: null, error: null });
  }
}

class UpdateBuilder {
  private table: string;
  private updates: Row;
  private _where: { col: string; val: unknown }[] = [];

  constructor(table: string, updates: Row) {
    this.table = table;
    this.updates = updates;
  }

  eq(col: string, val: unknown) {
    this._where.push({ col, val });
    return this;
  }

  select() {
    return this;
  }

  single() {
    return this._execute();
  }

  then(resolve: (value: { data: null; error: null }) => void) {
    this._execute();
    resolve({ data: null, error: null });
  }

  private _execute() {
    const db = getDb();
    const sets = Object.keys(this.updates)
      .map((k) => `${k} = ?`)
      .join(", ");
    const vals = Object.values(this.updates).map((v) => {
      if (typeof v === "object" && v !== null) return JSON.stringify(v);
      if (typeof v === "boolean") return v ? 1 : 0;
      return v;
    });

    const whereClause = this._where.map((w) => `${w.col} = ?`).join(" AND ");
    const whereVals = this._where.map((w) => w.val);

    db.prepare(
      `UPDATE ${this.table} SET ${sets}, updated_at = datetime('now') WHERE ${whereClause}`
    ).run(...(vals as []), ...(whereVals as []));

    // Re-read
    if (this._where.length > 0) {
      const row = db
        .prepare(
          `SELECT * FROM ${this.table} WHERE ${whereClause}`
        )
        .get(...(whereVals as [])) as Row | undefined;
      return { data: row || null, error: null };
    }

    return { data: null, error: null };
  }
}

class DeleteBuilder {
  private table: string;
  private _where: { col: string; val: unknown }[] = [];

  constructor(table: string) {
    this.table = table;
  }

  eq(col: string, val: unknown) {
    this._where.push({ col, val });
    return this;
  }

  then(resolve: (value: { error: null }) => void) {
    const db = getDb();
    const whereClause = this._where.map((w) => `${w.col} = ?`).join(" AND ");
    const vals = this._where.map((w) => w.val);
    db.prepare(`DELETE FROM ${this.table} WHERE ${whereClause}`).run(
      ...(vals as [])
    );
    resolve({ error: null });
  }
}

class UpsertBuilder {
  private table: string;
  private row: Row;
  private _conflict: string;

  constructor(table: string, row: Row, opts?: { onConflict?: string }) {
    this.table = table;
    this.row = row;
    this._conflict = opts?.onConflict || "id";
  }

  select() {
    return this;
  }

  single() {
    const db = getDb();
    const cols = Object.keys(this.row);
    const vals = cols.map((c) => {
      const v = this.row[c];
      if (typeof v === "object" && v !== null) return JSON.stringify(v);
      if (typeof v === "boolean") return v ? 1 : 0;
      return v;
    });

    if (!this.row.id) {
      cols.push("id");
      vals.push(crypto.randomUUID());
    }

    const placeholders = cols.map(() => "?").join(",");
    const updateSets = cols
      .filter((c) => c !== "id")
      .map((c) => `${c} = excluded.${c}`)
      .join(", ");

    try {
      db.prepare(
        `INSERT INTO ${this.table} (${cols.join(",")}) VALUES (${placeholders})
         ON CONFLICT(${this._conflict}) DO UPDATE SET ${updateSets}`
      ).run(...(vals as []));
    } catch (e: unknown) {
      const err = e as { message?: string };
      return { data: null, error: { message: err.message } };
    }

    // Re-read
    const conflictCol = this._conflict.split(",")[0].trim();
    const lookupVal = this.row[conflictCol] || this.row.id;
    const row = db
      .prepare(`SELECT * FROM ${this.table} WHERE ${conflictCol} = ?`)
      .get(lookupVal as string) as Row | undefined;

    return { data: row || this.row, error: null };
  }
}

class TableClient {
  private table: string;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string, opts?: { count?: string; head?: boolean }) {
    const qb = new QueryBuilder(this.table);
    return qb.select(columns, opts);
  }

  insert(rows: Row | Row[]) {
    return new InsertBuilder(this.table, rows);
  }

  update(updates: Row) {
    return new UpdateBuilder(this.table, updates);
  }

  delete() {
    return new DeleteBuilder(this.table);
  }

  upsert(row: Row, opts?: { onConflict?: string }) {
    return new UpsertBuilder(this.table, row, opts);
  }
}

class RpcClient {
  call(fn: string, params: Row) {
    const db = getDb();
    if (fn === "increment_variant_views") {
      db.prepare("UPDATE variants SET views = views + 1 WHERE id = ?").run(
        params.variant_id as string
      );
      return { error: null };
    }
    if (fn === "increment_variant_conversions") {
      db.prepare(
        "UPDATE variants SET conversions = conversions + 1 WHERE id = ?"
      ).run(params.variant_id as string);
      return { error: null };
    }
    return { error: { message: `Unknown RPC: ${fn}` } };
  }
}

export class LocalSupabaseClient {
  auth = {
    getUser: async () => ({
      data: { user: LOCAL_USER },
      error: null,
    }),
    signInWithPassword: async () => ({
      data: { user: LOCAL_USER },
      error: null,
    }),
    signUp: async () => ({
      data: { user: LOCAL_USER },
      error: null,
    }),
    signInWithOAuth: async () => ({
      data: { url: "/dashboard" },
      error: null,
    }),
    signOut: async () => ({ error: null }),
    exchangeCodeForSession: async () => ({ error: null }),
  };

  from(table: string) {
    return new TableClient(table);
  }

  rpc(fn: string, params: Row) {
    return new RpcClient().call(fn, params);
  }
}

export function createLocalClient() {
  return new LocalSupabaseClient();
}
