import { sql } from 'drizzle-orm';
import { drizzle, useLiveQuery as drizzleLiveQuery } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { Platform } from 'react-native';
import * as schema from './schema';

// On web, SQLite is unavailable — return empty data so screens render without crashing.
export const useLiveQuery: typeof drizzleLiveQuery = Platform.OS === 'web'
  ? (_query: any, _deps?: any[]) => ({ data: [] as any, updatedAt: undefined, error: undefined })
  : drizzleLiveQuery;

// expo-sqlite's sync WASM driver requires SharedArrayBuffer which isn't
// available in browsers without special server headers. Skip on web so the
// app renders (UI/navigation work; data features are no-ops in browser).
const expoDb = Platform.OS !== 'web'
  ? openDatabaseSync('plitso.db', { enableChangeListener: true })
  : (null as unknown as ReturnType<typeof openDatabaseSync>);

// On web, return a chainable no-op Proxy so db.select().from(...) etc.
// don't throw — the useLiveQuery stub above ignores the query anyway.
const webDbStub: any = new Proxy({}, {
  get: (_t, prop) => prop === 'then' ? undefined : () => webDbStub,
});

export const db = Platform.OS !== 'web'
  ? drizzle(expoDb, { schema })
  : (webDbStub as ReturnType<typeof drizzle<typeof schema>>);

// Bootstraps tables on startup, mirroring Room's auto-create-on-first-run.
export function initDatabase() {
  if (Platform.OS === 'web') return;
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS categories (
      category_id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      image TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recipes (
      recipe_id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      image TEXT NOT NULL,
      category_id TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recipe_detail (
      recipe_id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      image TEXT NOT NULL,
      country TEXT NOT NULL,
      instructions TEXT NOT NULL,
      ingredients TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      recipe_id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      image TEXT NOT NULL,
      country TEXT NOT NULL,
      instructions TEXT NOT NULL,
      ingredients TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS day_recipe (
      recipe_id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      image TEXT NOT NULL,
      updated_date INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shopping_items (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      text TEXT NOT NULL,
      checked INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);
}

export { sql };
