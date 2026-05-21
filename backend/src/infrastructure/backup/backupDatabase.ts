import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

export interface BackupResult {
  fileName: string;
  createdAt: string;
}

/**
 * Respalda la base de datos copiando el archivo .db a data/backups/ con la
 * fecha en el nombre. La base es un único archivo SQLite: respaldarla es,
 * literalmente, copiarlo.
 */
export function backupDatabase(dbPath: string): BackupResult {
  const createdAt = new Date().toISOString();
  const backupDir = join(dirname(dbPath), 'backups');
  mkdirSync(backupDir, { recursive: true });

  const fileName = `finanzas-${createdAt.replace(/[:.]/g, '-')}.db`;
  copyFileSync(dbPath, join(backupDir, fileName));

  return { fileName, createdAt };
}
