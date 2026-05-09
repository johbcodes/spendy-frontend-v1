/**
 * Custom Hooks for Data Operations
 *
 * These hooks provide a clean, reusable way to interact with data.
 * Reduces code duplication and makes it easy to swap localStorage for API calls.
 */

import { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import {
  Event, Wallet, Expense, Payment, Request, Supplier,
  InventoryItem, SystemNotification, User, SystemData
} from '../types';

/**
 * Generic hook for fetching and managing list data
 */
function useListData<T>(
  fetchFn: () => Promise<T[]>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    refresh();
  }, [...dependencies, refresh]);

  return { data, loading, error, refresh, setData };
}

// ============================================================================
// EVENTS HOOKS
// ============================================================================

export function useEvents() {
  const { data, loading, error, refresh, setData } = useListData(
    API.events.getAll
  );

  const addEvent = useCallback(async (eventData: Partial<Event>) => {
    try {
      const newEvent = await API.events.create(eventData);
      setData(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      console.error('Error adding event:', err);
      throw err;
    }
  }, [setData]);

  const updateEvent = useCallback(async (id: string, eventData: Partial<Event>) => {
    try {
      const updated = await API.events.update(id, eventData);
      setData(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err) {
      console.error('Error updating event:', err);
      throw err;
    }
  }, [setData]);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      await API.events.delete(id);
      setData(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting event:', err);
      throw err;
    }
  }, [setData]);

  return {
    events: data,
    loading,
    error,
    refresh,
    addEvent,
    updateEvent,
    deleteEvent
  };
}

// ============================================================================
// WALLETS HOOKS
// ============================================================================

export function useWallets() {
  const { data, loading, error, refresh, setData } = useListData(
    API.wallets.getAll
  );

  const addWallet = useCallback(async (walletData: Partial<Wallet>) => {
    try {
      const newWallet = await API.wallets.create(walletData);
      setData(prev => [...prev, newWallet]);
      return newWallet;
    } catch (err) {
      console.error('Error adding wallet:', err);
      throw err;
    }
  }, [setData]);

  const updateWallet = useCallback(async (id: string, walletData: Partial<Wallet>) => {
    try {
      const updated = await API.wallets.update(id, walletData);
      setData(prev => prev.map(w => w.id === id ? updated : w));
      return updated;
    } catch (err) {
      console.error('Error updating wallet:', err);
      throw err;
    }
  }, [setData]);

  return {
    wallets: data,
    loading,
    error,
    refresh,
    addWallet,
    updateWallet
  };
}

// ============================================================================
// EXPENSES HOOKS
// ============================================================================

export function useExpenses() {
  const { data, loading, error, refresh, setData } = useListData(
    API.expenses.getAll
  );

  const addExpense = useCallback(async (expenseData: Partial<Expense>) => {
    try {
      const newExpense = await API.expenses.create(expenseData);
      setData(prev => [...prev, newExpense]);
      return newExpense;
    } catch (err) {
      console.error('Error adding expense:', err);
      throw err;
    }
  }, [setData]);

  const updateExpense = useCallback(async (id: string, expenseData: Partial<Expense>) => {
    try {
      const updated = await API.expenses.update(id, expenseData);
      setData(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err) {
      console.error('Error updating expense:', err);
      throw err;
    }
  }, [setData]);

  return {
    expenses: data,
    loading,
    error,
    refresh,
    addExpense,
    updateExpense
  };
}

// ============================================================================
// PAYMENTS HOOKS
// ============================================================================

export function usePayments() {
  const { data, loading, error, refresh, setData } = useListData(
    API.payments.getAll
  );

  const addPayment = useCallback(async (paymentData: Partial<Payment>) => {
    try {
      const newPayment = await API.payments.create(paymentData);
      setData(prev => [...prev, newPayment]);
      return newPayment;
    } catch (err) {
      console.error('Error adding payment:', err);
      throw err;
    }
  }, [setData]);

  return {
    payments: data,
    loading,
    error,
    refresh,
    addPayment
  };
}

// ============================================================================
// REQUESTS (APPROVALS) HOOKS
// ============================================================================

export function useRequests() {
  const { data, loading, error, refresh, setData } = useListData(
    API.requests.getAll
  );

  const addRequest = useCallback(async (requestData: Partial<Request>) => {
    try {
      const newRequest = await API.requests.create(requestData);
      setData(prev => [...prev, newRequest]);
      return newRequest;
    } catch (err) {
      console.error('Error adding request:', err);
      throw err;
    }
  }, [setData]);

  const updateRequest = useCallback(async (id: string, requestData: Partial<Request>) => {
    try {
      const updated = await API.requests.update(id, requestData);
      setData(prev => prev.map(r => r.id === id ? updated : r));
      return updated;
    } catch (err) {
      console.error('Error updating request:', err);
      throw err;
    }
  }, [setData]);

  return {
    requests: data,
    loading,
    error,
    refresh,
    addRequest,
    updateRequest
  };
}

// ============================================================================
// SUPPLIERS HOOKS
// ============================================================================

export function useSuppliers() {
  const { data, loading, error, refresh, setData } = useListData(
    API.suppliers.getAll
  );

  const addSupplier = useCallback(async (supplierData: Partial<Supplier>) => {
    try {
      const newSupplier = await API.suppliers.create(supplierData);
      setData(prev => [...prev, newSupplier]);
      return newSupplier;
    } catch (err) {
      console.error('Error adding supplier:', err);
      throw err;
    }
  }, [setData]);

  const deleteSupplier = useCallback(async (id: string) => {
    try {
      await API.suppliers.delete(id);
      setData(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting supplier:', err);
      throw err;
    }
  }, [setData]);

  return {
    suppliers: data,
    loading,
    error,
    refresh,
    addSupplier,
    deleteSupplier
  };
}

// ============================================================================
// INVENTORY HOOKS
// ============================================================================

export function useInventory() {
  const { data, loading, error, refresh, setData } = useListData(
    API.inventory.getAll
  );

  const addInventoryItem = useCallback(async (itemData: Partial<InventoryItem>) => {
    try {
      const newItem = await API.inventory.create(itemData);
      setData(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      console.error('Error adding inventory item:', err);
      throw err;
    }
  }, [setData]);

  const updateInventoryItem = useCallback(async (id: string, itemData: Partial<InventoryItem>) => {
    try {
      const updated = await API.inventory.update(id, itemData);
      setData(prev => prev.map(i => i.id === id ? updated : i));
      return updated;
    } catch (err) {
      console.error('Error updating inventory item:', err);
      throw err;
    }
  }, [setData]);

  return {
    inventory: data,
    loading,
    error,
    refresh,
    addInventoryItem,
    updateInventoryItem
  };
}

// ============================================================================
// NOTIFICATIONS HOOKS
// ============================================================================

export function useNotifications() {
  const { data, loading, error, refresh, setData } = useListData(
    API.notifications.getAll
  );

  const addNotification = useCallback(async (notificationData: Partial<SystemNotification>) => {
    try {
      const newNotification = await API.notifications.create(notificationData);
      setData(prev => [newNotification, ...prev]);
      return newNotification;
    } catch (err) {
      console.error('Error adding notification:', err);
      throw err;
    }
  }, [setData]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await API.notifications.markAsRead(id);
      setData(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, [setData]);

  return {
    notifications: data,
    loading,
    error,
    refresh,
    addNotification,
    markAsRead
  };
}

// ============================================================================
// USERS HOOKS
// ============================================================================

export function useUsers() {
  const { data, loading, error, refresh, setData } = useListData(
    API.users.getAll
  );

  const addUser = useCallback(async (userData: Partial<User>) => {
    try {
      const newUser = await API.users.create(userData);
      setData(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      console.error('Error adding user:', err);
      throw err;
    }
  }, [setData]);

  const updateUser = useCallback(async (id: string, userData: Partial<User>) => {
    try {
      const updated = await API.users.update(id, userData);
      setData(prev => prev.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  }, [setData]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await API.users.delete(id);
      setData(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }, [setData]);

  return {
    users: data,
    loading,
    error,
    refresh,
    addUser,
    updateUser,
    deleteUser
  };
}

// ============================================================================
// SYSTEM DATA HOOK
// ============================================================================

export function useSystemData() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await API.systemData.get();
      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching system data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateSystemData = useCallback(async (systemData: Partial<SystemData>) => {
    try {
      const updated = await API.systemData.update(systemData);
      setData(updated);
      return updated;
    } catch (err) {
      console.error('Error updating system data:', err);
      throw err;
    }
  }, []);

  return {
    systemData: data,
    loading,
    error,
    refresh,
    updateSystemData
  };
}
