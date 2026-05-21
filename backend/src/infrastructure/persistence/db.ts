import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema.js';

export type DB = BetterSQLite3Database<typeof schema>;

const MIGRATIONS_FOLDER = resolve(import.meta.dirname, '../../../drizzle');

/**
 * Crea una conexión a SQLite y aplica las migraciones pendientes.
 *
 * - Pasar una ruta de archivo para uso normal (la carpeta se crea si no existe).
 * - Pasar ':memory:' para tests (base efímera, sin tocar disco).
 *
 * No es un singleton a propósito: el composition root (index.ts) crea la DB
 * y la inyecta en los repositorios. Los tests crean su propia DB en memoria.
 */
export function createDb(dbPath: string): DB {
  if (dbPath !== ':memory:') {
    const dir = dirname(dbPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(dbPath);
  // WAL: mejor concurrencia lectura/escritura. FK: integridad referencial activa.
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  return db;
}
