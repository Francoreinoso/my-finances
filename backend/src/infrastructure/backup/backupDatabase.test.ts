import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { backupDatabase } from './backupDatabase.js';

const TMP = join('/tmp', 'my-finanzas-backup-test');

describe('backupDatabase', () => {
  beforeEach(() => {
    rmSync(TMP, { recursive: true, force: true });
    mkdirSync(TMP, { recursive: true });
  });

  afterEach(() => {
    rmSync(TMP, { recursive: true, force: true });
  });

  it('copia el archivo a la carpeta backups/ con la fecha en el nombre', () => {
    const dbPath = join(TMP, 'finanzas.db');
    writeFileSync(dbPath, 'contenido de prueba');

    const result = backupDatabase(dbPath);

    expect(result.fileName).toMatch(/^finanzas-.*\.db$/);
    expect(existsSync(join(TMP, 'backups', result.fileName))).toBe(true);
  });

  it('crea la carpeta backups/ si no existe', () => {
    const dbPath = join(TMP, 'finanzas.db');
    writeFileSync(dbPath, 'x');
    expect(existsSync(join(TMP, 'backups'))).toBe(false);

    backupDatabase(dbPath);

    expect(existsSync(join(TMP, 'backups'))).toBe(true);
  });
});
