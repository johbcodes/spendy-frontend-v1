import { useCallback, useEffect, useMemo, useState } from 'react';
import { expenseFeatureApi } from './api';
import { toExpense } from './mappers';
import { filterExpenses, summarizeExpenses } from './rules';
import type { Expense, User } from '../../types';
import type { ExpenseFilters, ExpensePayload } from './types';

export function useExpenses(currentUser: User | null) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!currentUser) {
      setExpenses([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const dtos = await expenseFeatureApi.list();
      setExpenses(dtos.map(toExpense));
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error('Failed to load expenses'));
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { expenses, setExpenses, isLoading, error, refresh };
}

export function useExpenseView(expenses: Expense[], filters: ExpenseFilters) {
  const filteredExpenses = useMemo(() => filterExpenses(expenses, filters), [expenses, filters]);
  const summary = useMemo(() => summarizeExpenses(filteredExpenses), [filteredExpenses]);

  return { filteredExpenses, summary };
}

export function useExpenseController(currentUser: User | null) {
  const { expenses, setExpenses, isLoading, error, refresh } = useExpenses(currentUser);

  const persistExpenses = useCallback((nextExpenses: Expense[]) => {
    setExpenses(nextExpenses);
    localStorage.setItem('spendy_expenses', JSON.stringify(nextExpenses));
  }, [setExpenses]);

  const addExpense = useCallback(async (payload: ExpensePayload) => {
    const savedExpense = toExpense(await expenseFeatureApi.create(payload));
    setExpenses(previous => {
      const nextExpenses = [...previous, savedExpense];
      localStorage.setItem('spendy_expenses', JSON.stringify(nextExpenses));
      return nextExpenses;
    });
    return savedExpense;
  }, [setExpenses]);

  const updateExpense = useCallback(async (expenseId: string, payload: Partial<ExpensePayload>) => {
    const savedExpense = toExpense(await expenseFeatureApi.update(expenseId, payload));
    setExpenses(previous => {
      const nextExpenses = previous.map(expense => expense.id === expenseId ? savedExpense : expense);
      localStorage.setItem('spendy_expenses', JSON.stringify(nextExpenses));
      return nextExpenses;
    });
    return savedExpense;
  }, [setExpenses]);

  const clearExpenses = useCallback(() => {
    setExpenses([]);
    localStorage.removeItem('spendy_expenses');
  }, [setExpenses]);

  return {
    expenses,
    setExpenses,
    persistExpenses,
    isLoading,
    error,
    refreshExpenses: refresh,
    clearExpenses,
    addExpense,
    updateExpense,
  };
}
