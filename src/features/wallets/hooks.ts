import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { walletFeatureApi } from './api';
import { toWallet } from './mappers';
import { getVisibleWallets, summarizeWallets } from './rules';
import type { Wallet, Transaction, User } from '../../types';
import { generateUUID } from '../../utils/idGenerator';

export function useWallets(currentUser: User | null) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!currentUser) {
      setWallets([]);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const dtos = await walletFeatureApi.list();
      setWallets(dtos.map(toWallet));
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error('Failed to load wallets'));
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { wallets, setWallets, isLoading, error, refresh };
}

export function useWalletView(wallets: Wallet[], currentUser: User | null) {
  const visibleWallets = useMemo(
    () => (currentUser ? getVisibleWallets(wallets, currentUser) : []),
    [wallets, currentUser],
  );

  const summary = useMemo(() => summarizeWallets(visibleWallets), [visibleWallets]);

  return { visibleWallets, summary };
}

function buildTransaction(
  walletId: string,
  type: Transaction['type'],
  amount: number,
  recipient: string,
  currentUser: User,
  sourceWallet?: string,
): Transaction {
  const now = new Date(Date.now() + 3 * 60 * 60 * 1000); // UTC+3
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const date = `${String(now.getUTCDate()).padStart(2,'0')}/${months[now.getUTCMonth()]}/${now.getUTCFullYear()}`;
  const time = `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}`;
  return {
    id: generateUUID(),
    walletId,
    date,
    time,
    user: `${currentUser.firstName} ${currentUser.lastName}`,
    recipient,
    reference: `TXN-${Date.now().toString(36).toUpperCase()}`,
    amount,
    status: 'Completed',
    type,
    sourceWallet,
  };
}

export function useWalletController(currentUser: User | null) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try { return JSON.parse(localStorage.getItem('spendy_transactions') || '[]'); }
    catch { return []; }
  });
  const loadedRef = useRef(false);

  // Load wallets from backend when user changes
  useEffect(() => {
    if (!currentUser) {
      setWallets([]);
      loadedRef.current = false;
      return;
    }
    walletFeatureApi.list()
      .then(dtos => {
        setWallets(dtos.map(toWallet));
        loadedRef.current = true;
      })
      .catch(() => setWallets([]));
  }, [currentUser?.id]);

  // Persist transactions
  useEffect(() => {
    localStorage.setItem('spendy_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const refreshWallets = useCallback(async () => {
    const dtos = await walletFeatureApi.list();
    setWallets(dtos.map(toWallet));
  }, []);

  const clearWallets = useCallback(() => {
    setWallets([]);
    loadedRef.current = false;
  }, []);

  const addWallet = useCallback((walletData: Partial<Wallet>) => {
    const newWallet: Wallet = {
      id: generateUUID(),
      name: walletData.name || '',
      type: walletData.type || 'Event Wallet',
      balance: Number(walletData.balance) || 0,
      linkedEvent: walletData.linkedEvent,
      status: 'Active',
      createdAt: new Date().toISOString().slice(0, 16),
      isDefault: false,
      companyId: currentUser?.companyId,
    };
    setWallets(prev => [...prev, newWallet]);
    return newWallet;
  }, [currentUser?.companyId]);

  const deleteWallet = useCallback((walletId: string) => {
    setWallets(prev => prev.filter(w => w.id !== walletId));
  }, []);

  const updateWallet = useCallback((updated: Wallet) => {
    setWallets(prev => prev.map(w => w.id === updated.id ? updated : w));
  }, []);

  const connectWallet = useCallback((walletId: string, eventId: string) => {
    setWallets(prev => prev.map(w => w.id === walletId ? { ...w, linkedEvent: eventId } : w));
  }, []);

  const fundWallet = useCallback((walletId: string, amount: number) => {
    if (!currentUser) return;
    setWallets(prev => prev.map(w => w.id === walletId ? { ...w, balance: w.balance + amount } : w));
    setTransactions(prev => [buildTransaction(walletId, 'Fund', amount, 'Fund Deposit', currentUser), ...prev]);
  }, [currentUser]);

  const transferFunds = useCallback((
    fromWalletId: string,
    toWalletId: string,
    amount: number,
  ) => {
    if (!currentUser) return;
    const fromWallet = wallets.find(w => w.id === fromWalletId);
    const toWallet = wallets.find(w => w.id === toWalletId);
    if (!fromWallet || !toWallet || fromWallet.balance < amount) return;

    setWallets(prev => prev.map(w => {
      if (w.id === fromWalletId) return { ...w, balance: w.balance - amount };
      if (w.id === toWalletId) return { ...w, balance: w.balance + amount };
      return w;
    }));
    setTransactions(prev => [
      buildTransaction(fromWalletId, 'Transfer', amount, `Transfer to ${toWallet.name}`, currentUser),
      buildTransaction(toWalletId, 'Transfer', amount, `Transfer from ${fromWallet.name}`, currentUser, fromWallet.name),
      ...prev,
    ]);
  }, [wallets, currentUser]);

  const deductFromWallet = useCallback((walletId: string, amount: number, recipient: string) => {
    if (!currentUser) return;
    setWallets(prev => prev.map(w => w.id === walletId ? { ...w, balance: w.balance - amount } : w));
    setTransactions(prev => [buildTransaction(walletId, 'Withdrawal', amount, recipient, currentUser), ...prev]);
  }, [currentUser]);

  const creditToWallet = useCallback((walletId: string, amount: number, from: string, sourceWalletName?: string) => {
    if (!currentUser) return;
    setWallets(prev => prev.map(w => w.id === walletId ? { ...w, balance: w.balance + amount } : w));
    setTransactions(prev => [buildTransaction(walletId, 'Fund', amount, from, currentUser, sourceWalletName), ...prev]);
  }, [currentUser]);

  return {
    wallets,
    setWallets,
    transactions,
    setTransactions,
    loadedRef,
    refreshWallets,
    clearWallets,
    addWallet,
    deleteWallet,
    updateWallet,
    connectWallet,
    fundWallet,
    transferFunds,
    deductFromWallet,
    creditToWallet,
  };
}
