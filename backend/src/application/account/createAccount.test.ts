import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteAccountRepository } from '@/infrastructure/persistence/SqliteAccountRepository.js';
import { createAccount } from './createAccount.js';

describe('createAccount', () => {
  let accounts: SqliteAccountRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    accounts = new SqliteAccountRepository(db);
  });

  it('crea una cuenta con id generado, isArchived=false y la persiste', async () => {
    const account = await createAccount(accounts, {
      name: 'Banco Estado',
      type: 'checking',
      currency: 'CLP',
    });
    expect(account.id).toBeTruthy();
    expect(account.name).toBe('Banco Estado');
    expect(account.type).toBe('checking');
    expect(account.currency).toBe('CLP');
    expect(account.isArchived).toBe(false);
    expect(account.createdAt).toBeTruthy();
    expect(await accounts.findById(account.id)).not.toBeNull();
  });

  it('la cuenta recién creada aparece en findAllWithBalance con balance cero', async () => {
    const account = await createAccount(accounts, {
      name: 'Caja chica',
      type: 'cash',
      currency: 'CLP',
    });
    const list = await accounts.findAllWithBalance();
    const found = list.find((a) => a.id === account.id);
    expect(found?.balance).toBe(0);
  });
});
