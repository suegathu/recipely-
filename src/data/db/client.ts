import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

const expoDb = openDatabaseSync('plitso.db', { enableChangeListener: true });

export const db = drizzle(expoDb, { schema });

// Bootstraps tables on startup, mirroring Room's auto-create-on-first-run.
export function initDatabase() {
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
  `);
}

export { sql };
