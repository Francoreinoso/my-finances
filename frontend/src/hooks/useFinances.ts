import { useCallback, useEffect, useState } from 'react';
import { accountClient } from '@/api/accountClient';
import { categoryClient } from '@/api/categoryClient';
import { transactionClient } from '@/api/transactionClient';
import type { Account } from '@/types/account';
import type { Category } from '@/types/category';
import type {
  Transaction,
  CreateTransactionInput,
  TransactionChanges,
} from '@/types/transaction';

export type FinancesStatus = 'loading' | 'ready' | 'error';

export interface UseFinances {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  status: FinancesStatus;
  error: string | null;
  createTransaction: (input: CreateTransactionInput) => Promise<void>;
  updateTransaction: (id: string, changes: TransactionChanges) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

function toMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Error desconocido';
}

/**
 * Carga cuentas, categorías y transacciones, y expone las acciones de crear,
 * editar y borrar. Estado local con useState: lo consume una sola vista.
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

  // Toda mutación de transacciones cambia balances: recargamos cuentas y
  // transacciones. El error se propaga a propósito: el modal lo muestra.
  const reloadCashState = useCallback(async () => {
    const [a, t] = await Promise.all([accountClient.list(), transactionClient.list()]);
    setAccounts(a);
    setTransactions(t);
  }, []);

  const createTransaction = useCallback(
    async (input: CreateTransactionInput) => {
      await transactionClient.create(input);
      await reloadCashState();
    },
    [reloadCashState],
  );

  const updateTransaction = useCallback(
    async (id: string, changes: TransactionChanges) => {
      await transactionClient.update(id, changes);
      await reloadCashState();
    },
    [reloadCashState],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      await transactionClient.remove(id);
      await reloadCashState();
    },
    [reloadCashState],
  );

  return {
    accounts,
    categories,
    transactions,
    status,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
