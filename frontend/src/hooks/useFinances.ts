import { useCallback, useEffect, useState } from 'react';
import { accountClient } from '@/api/accountClient';
import { categoryClient } from '@/api/categoryClient';
import { transactionClient } from '@/api/transactionClient';
import type { Account } from '@/types/account';
import type { Category } from '@/types/category';
import type { Transaction, CreateTransactionInput } from '@/types/transaction';

export type FinancesStatus = 'loading' | 'ready' | 'error';

export interface UseFinances {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  status: FinancesStatus;
  error: string | null;
  createTransaction: (input: CreateTransactionInput) => Promise<void>;
}

function toMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Error desconocido';
}

/**
 * Carga cuentas, categorías y transacciones, y expone la acción de crear.
 * Estado local con useState: en Fase 1 hay una sola vista que consume esto.
 * Cuando la Fase 2 sume vistas que compartan estos datos, conviene migrar a
 * un store (Zustand) — la interfaz del hook puede quedar igual.
 */
export function useFinances(): UseFinances {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [status, setStatus] = useState<FinancesStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const [a, c, t] = await Promise.all([
        accountClient.list(),
        categoryClient.list(),
        transactionClient.list(),
      ]);
      setAccounts(a);
      setCategories(c);
      setTransactions(t);
      setStatus('ready');
    } catch (e) {
      setError(toMessage(e));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const createTransaction = useCallback(async (input: CreateTransactionInput) => {
    // El error se propaga a propósito: el modal lo muestra y se queda abierto.
    await transactionClient.create(input);
    // La transacción cambió balances: recargamos cuentas y transacciones.
    const [a, t] = await Promise.all([accountClient.list(), transactionClient.list()]);
    setAccounts(a);
    setTransactions(t);
  }, []);

  return { accounts, categories, transactions, status, error, createTransaction };
}
