import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isSupabase } from "@/lib/config";
import type { TableName, Tables } from "@/lib/types";

type Eq = Record<string, string | number | boolean | null>;

export interface DbAdapter {
  list<T extends TableName>(table: T, eq?: Eq): Promise<Tables[T][]>;
  get<T extends TableName>(table: T, eq: Eq): Promise<Tables[T] | null>;
  insert<T extends TableName>(table: T, row: Tables[T]): Promise<Tables[T]>;
  update<T extends TableName>(table: T, id: string, patch: Partial<Tables[T]>): Promise<Tables[T]>;
  remove(table: TableName, id: string): Promise<void>;
}

/* ───────────────────────── Supabase ───────────────────────── */

let sb: SupabaseClient | null = null;
export function supabase(): SupabaseClient {
  if (!sb) {
    sb = createClient(env.supabaseUrl, env.supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return sb;
}

const supabaseAdapter: DbAdapter = {
  async list(table, eq) {
    let q = supabase().from(table).select("*");
    for (const [k, v] of Object.entries(eq ?? {})) q = v === null ? q.is(k, null) : q.eq(k, v);
    const { data, error } = await q;
    if (error) throw new Error(`[db] ${table}: ${error.message}`);
    return (data ?? []) as never;
  },
  async get(table, eq) {
    let q = supabase().from(table).select("*");
    for (const [k, v] of Object.entries(eq)) q = v === null ? q.is(k, null) : q.eq(k, v);
    const { data, error } = await q.limit(1).maybeSingle();
    if (error) throw new Error(`[db] ${table}: ${error.message}`);
    return (data ?? null) as never;
  },
  async insert(table, row) {
    const { data, error } = await supabase().from(table).insert(row as never).select("*").single();
    if (error) throw new Error(`[db] ${table}: ${error.message}`);
    return data as never;
  },
  async update(table, id, patch) {
    const { data, error } = await supabase().from(table).update(patch as never).eq("id", id).select("*").single();
    if (error) throw new Error(`[db] ${table}: ${error.message}`);
    return data as never;
  },
  async remove(table, id) {
    const { error } = await supabase().from(table).delete().eq("id", id);
    if (error) throw new Error(`[db] ${table}: ${error.message}`);
  },
};

/* ──────────────────── Local JSON (데모 모드) ──────────────────── */

type Store = { [K in TableName]: Tables[K][] };
const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const g = globalThis as unknown as { __mpStore?: Store };

function emptyStore(): Store {
  return {
    categories: [], products: [], product_files: [], users: [], orders: [],
    entitlements: [], memberships: [], downloads: [], access_codes: [],
  };
}

function load(): Store {
  if (g.__mpStore) return g.__mpStore;
  let store = emptyStore();
  try {
    if (fs.existsSync(DB_FILE)) store = { ...store, ...JSON.parse(fs.readFileSync(DB_FILE, "utf8")) };
  } catch {
    /* 손상된 파일은 무시하고 새로 시작 */
  }
  g.__mpStore = store;
  return store;
}

function persist() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(g.__mpStore, null, 2));
  } catch {
    /* 읽기 전용 파일시스템(예: Vercel)에서는 메모리에만 유지 */
  }
}

const matches = (row: object, eq?: Eq) =>
  Object.entries(eq ?? {}).every(([k, v]) => ((row as Record<string, unknown>)[k] ?? null) === v);

const clone = <T,>(v: T): T => structuredClone(v);

const localAdapter: DbAdapter = {
  async list(table, eq) {
    return clone(load()[table].filter((r) => matches(r, eq))) as never;
  },
  async get(table, eq) {
    const row = load()[table].find((r) => matches(r, eq));
    return (row ? clone(row) : null) as never;
  },
  async insert(table, row) {
    const s = load();
    const rows = s[table] as { id: string }[];
    if (rows.some((r) => r.id === row.id)) throw new Error(`[db] ${table}: duplicate id`);
    rows.push(clone(row));
    persist();
    return clone(row);
  },
  async update(table, id, patch) {
    const rows = load()[table] as { id: string }[];
    const i = rows.findIndex((r) => r.id === id);
    if (i < 0) throw new Error(`[db] ${table}: ${id} not found`);
    rows[i] = { ...rows[i], ...clone(patch) };
    persist();
    return clone(rows[i]) as never;
  },
  async remove(table, id) {
    const s = load();
    (s[table] as { id: string }[]) = (s[table] as { id: string }[]).filter((r) => r.id !== id);
    persist();
  },
};

export const db: DbAdapter = isSupabase ? supabaseAdapter : localAdapter;
export const LOCAL_DATA_DIR = DATA_DIR;
