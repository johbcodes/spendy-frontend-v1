/**
 * App Context
 *
 * Centralized state management using custom hooks and Context API.
 * This replaces the massive App.tsx component with clean, organized state management.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Event, Wallet, Expense, Payment, Request, Supplier,
  InventoryItem, SystemNotification, User, SystemData,
  Transaction, Movement
} from '../types';
import { useEvents, useWallets, useExpenses, usePayments, useRequests, useSuppliers, useInventory, useNotifications, useUsers, useSystemData } from '../hooks/useData';
import { hashPassword, verifyPassword } from '../utils/auth';
import { safeGetLocalStorage, safeSetLocalStorage } from '../utils/errorHandler';
import { generateUUID } from '../utils/idGenerator';

// ============================================================================
// CONTEXT TYPE DEFINITION
// ============================================================================

interface AppContextType {
  // Authentication
  isAuthenticated: boolean;
  currentUser: User | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  updateProfile: (profileData: Partial<User>) => void;

  // Data
  events: Event[];
  wallets: Wallet[];
  expenses: Expense[];
  payments: Payment[];
  requests: Request[];
  suppliers: Supplier[];
  inventory: InventoryItem[];
  users: User[];
  notifications: SystemNotification[];
  systemData: SystemData | null;
  transactions: Transaction[];
  inventoryMovements: Movement[];
  activityLog: any[];

  // Loading states
  loading: {
    events: boolean;
    wallets: boolean;
    expenses: boolean;
    payments: boolean;
    requests: boolean;
    suppliers: boolean;
    inventory: boolean;
    users: boolean;
    notifications: boolean;
  };

  // Event operations
  addEvent: (eventData: Partial<Event>) => Promise<Event>;
  updateEvent: (id: string, eventData: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;

  // Wallet operations
  addWallet: (walletData: Partial<Wallet>) => Promise<Wallet>;
  updateWallet: (id: string, walletData: Partial<Wallet>) => Promise<Wallet>;
  fundWallet: (walletId: string, amount: number, description?: string) => void;
  transferBetweenWallets: (fromWalletId: string, toWalletId: string, amount: number, description?: string) => void;

  // Expense operations
  addExpense: (expenseData: any) => void;
  updateExpense: (id: string, expenseData: Partial<Expense>) => Promise<Expense>;

  // Payment operations
  addPayment: (paymentData: Partial<Payment>) => Promise<Payment>;

  // Request operations
  addRequest: (requestData: Partial<Request>) => Promise<Request>;
  updateRequest: (id: string, requestData: Partial<Request>) => Promise<Request>;
  approveRequest: (requestId: string, walletId: string) => void;
  rejectRequest: (requestId: string, reason: string) => void;

  // Supplier operations
  addSupplier: (supplierData: Partial<Supplier>) => Promise<Supplier>;
  deleteSupplier: (id: string) => Promise<void>;

  // Inventory operations
  addInventoryItem: (itemData: Partial<InventoryItem>) => Promise<InventoryItem>;
  updateInventoryItem: (id: string, itemData: Partial<InventoryItem>) => Promise<InventoryItem>;
  checkOut: (checkOutData: any) => void;
  checkIn: (checkInData: any) => void;

  // User operations
  addUser: (userData: Partial<User>) => Promise<User>;
  updateUser: (id: string, userData: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;

  // Notification operations
  sendNotification: (notification: SystemNotification) => void;
  markNotificationAsRead: (id: string) => Promise<void>;

  // System data operations
  updateSystemData: (data: Partial<SystemData>) => void;

  // Utility
  refresh: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

// ============================================================================
// CREATE CONTEXT
// ============================================================================

const AppContext = createContext<AppContextType | null>(null);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function AppProvider({ children }: { children: ReactNode }) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Additional local state not in hooks
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<Movement[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);

  // Use custom hooks for data management
  const eventsHook = useEvents();
  const walletsHook = useWallets();
  const expensesHook = useExpenses();
  const paymentsHook = usePayments();
  const requestsHook = useRequests();
  const suppliersHook = useSuppliers();
  const inventoryHook = useInventory();
  const usersHook = useUsers();
  const notificationsHook = useNotifications();
  const systemDataHook = useSystemData();

  // Toast notification state (you can integrate with your existing toast system)
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    // Integrate with existing toast system
    console.log(`[${type.toUpperCase()}] ${message}`);
    // You can dispatch a custom event here or use your existing toast hook
  };

  // ==========================================================================
  // AUTHENTICATION METHODS
  // ==========================================================================

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const allUsers = usersHook.users;
      const user = allUsers.find(u => u.email === email);

      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Verify password (handle both hashed and plain text for migration)
      let isPasswordValid = false;
      if (user.password?.startsWith('$2')) {
        // Hashed password
        isPasswordValid = await verifyPassword(password, user.password);
      } else {
        // Plain text password (for migration)
        isPasswordValid = password === user.password;

        // Hash the password for future use
        if (isPasswordValid) {
          const hashedPass = await hashPassword(password);
          await usersHook.updateUser(user.id, { password: hashedPass });
        }
      }

      if (!isPasswordValid) {
        return { success: false, error: 'Invalid email or password' };
      }

      setCurrentUser(user);
      setIsAuthenticated(true);
      safeSetLocalStorage('currentUser', user);
      safeSetLocalStorage('isAuthenticated', 'true');

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An error occurred during sign in' };
    }
  };

  const signUp = async (userData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      // Hash password before storing
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }

      const newUser = await usersHook.addUser(userData);

      setCurrentUser(newUser);
      setIsAuthenticated(true);
      safeSetLocalStorage('currentUser', newUser);
      safeSetLocalStorage('isAuthenticated', 'true');

      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An error occurred during sign up' };
    }
  };

  const signOut = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    localStorage.setItem('isAuthenticated', 'false');
  };

  const updateProfile = (profileData: Partial<User>) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...profileData };
    setCurrentUser(updatedUser);

    // Update in users list
    usersHook.updateUser(currentUser.id, profileData);

    safeSetLocalStorage('currentUser', updatedUser);
    showToast('Profile updated successfully', 'success');
  };

  // ==========================================================================
  // WALLET METHODS
  // ==========================================================================

  const fundWallet = (walletId: string, amount: number, description?: string) => {
    const wallet = walletsHook.wallets.find(w => w.id === walletId);
    if (!wallet) {
      showToast('Wallet not found', 'error');
      return;
    }

    walletsHook.updateWallet(walletId, {
      balance: wallet.balance + amount
    });

    // Add transaction
    const transaction: Transaction = {
      id: generateUUID(),
      type: 'deposit',
      walletId,
      amount,
      description: description || 'Wallet funding',
      date: new Date().toISOString(),
      performedBy: currentUser?.id || 'system'
    };

    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    safeSetLocalStorage('spendy_transactions', updatedTransactions);

    showToast(`Wallet funded with KES ${amount.toLocaleString()}`, 'success');
  };

  const transferBetweenWallets = (
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    description?: string
  ) => {
    const fromWallet = walletsHook.wallets.find(w => w.id === fromWalletId);
    const toWallet = walletsHook.wallets.find(w => w.id === toWalletId);

    if (!fromWallet || !toWallet) {
      showToast('Wallet not found', 'error');
      return;
    }

    if (fromWallet.balance < amount) {
      showToast('Insufficient balance', 'error');
      return;
    }

    // Update wallets
    walletsHook.updateWallet(fromWalletId, {
      balance: fromWallet.balance - amount
    });

    walletsHook.updateWallet(toWalletId, {
      balance: toWallet.balance + amount
    });

    // Add transactions
    const withdrawTransaction: Transaction = {
      id: generateUUID(),
      type: 'transfer_out',
      walletId: fromWalletId,
      amount,
      description: description || `Transfer to ${toWallet.name}`,
      date: new Date().toISOString(),
      performedBy: currentUser?.id || 'system'
    };

    const depositTransaction: Transaction = {
      id: generateUUID(),
      type: 'transfer_in',
      walletId: toWalletId,
      amount,
      description: description || `Transfer from ${fromWallet.name}`,
      date: new Date().toISOString(),
      performedBy: currentUser?.id || 'system'
    };

    const updatedTransactions = [...transactions, withdrawTransaction, depositTransaction];
    setTransactions(updatedTransactions);
    safeSetLocalStorage('spendy_transactions', updatedTransactions);

    showToast('Transfer completed successfully', 'success');
  };

  // ==========================================================================
  // REQUEST METHODS (Approval workflow)
  // ==========================================================================

  const approveRequest = async (requestId: string, walletId: string) => {
    const request = requestsHook.requests.find(r => r.id === requestId);
    const wallet = walletsHook.wallets.find(w => w.id === walletId);

    if (!request || !wallet) {
      showToast('Request or wallet not found', 'error');
      return;
    }

    if (wallet.balance < request.amount) {
      showToast('Insufficient wallet balance', 'error');
      return;
    }

    // Update request
    await requestsHook.updateRequest(requestId, {
      status: 'approved',
      processedBy: currentUser?.id,
      dateProcessed: new Date().toISOString()
    });

    // Update wallet
    await walletsHook.updateWallet(walletId, {
      balance: wallet.balance - request.amount
    });

    // If expense exists, update it
    if (request.expenseId) {
      await expensesHook.updateExpense(request.expenseId, {
        approvalStatus: 'approved',
        approvedBy: currentUser?.id,
        approvalDate: new Date().toISOString()
      });
    }

    showToast('Request approved successfully', 'success');
  };

  const rejectRequest = async (requestId: string, reason: string) => {
    await requestsHook.updateRequest(requestId, {
      status: 'rejected',
      processedBy: currentUser?.id,
      dateProcessed: new Date().toISOString(),
      rejectionReason: reason
    });

    showToast('Request rejected', 'info');
  };

  // ==========================================================================
  // INVENTORY METHODS
  // ==========================================================================

  const checkOut = (checkOutData: any) => {
    const { inventoryId, quantity, eventId, checkedOutBy, checkOutDate, expectedReturnDate, notes } = checkOutData;

    const item = inventoryHook.inventory.find(i => i.id === inventoryId);
    if (!item) {
      showToast('Inventory item not found', 'error');
      return;
    }

    if ((item.availableQuantity || 0) < quantity) {
      showToast('Insufficient quantity available', 'error');
      return;
    }

    // Update inventory
    inventoryHook.updateInventoryItem(inventoryId, {
      availableQuantity: (item.availableQuantity || 0) - quantity,
      allocatedQuantity: (item.allocatedQuantity || 0) + quantity
    });

    // Create movement record
    const movement: Movement = {
      id: generateUUID(),
      inventoryId,
      type: 'checkout',
      quantity,
      eventId,
      date: checkOutDate,
      performedBy: checkedOutBy,
      notes
    };

    const updatedMovements = [...inventoryMovements, movement];
    setInventoryMovements(updatedMovements);
    safeSetLocalStorage('spendy_inventoryMovements', updatedMovements);

    showToast('Item checked out successfully', 'success');
  };

  const checkIn = (checkInData: any) => {
    const { inventoryId, quantity, checkedInBy, checkInDate, condition, notes } = checkInData;

    const item = inventoryHook.inventory.find(i => i.id === inventoryId);
    if (!item) {
      showToast('Inventory item not found', 'error');
      return;
    }

    // Update inventory
    inventoryHook.updateInventoryItem(inventoryId, {
      availableQuantity: (item.availableQuantity || 0) + quantity,
      allocatedQuantity: Math.max(0, (item.allocatedQuantity || 0) - quantity),
      condition
    });

    // Create movement record
    const movement: Movement = {
      id: generateUUID(),
      inventoryId,
      type: 'checkin',
      quantity,
      date: checkInDate,
      performedBy: checkedInBy,
      condition,
      notes
    };

    const updatedMovements = [...inventoryMovements, movement];
    setInventoryMovements(updatedMovements);
    safeSetLocalStorage('spendy_inventoryMovements', updatedMovements);

    showToast('Item checked in successfully', 'success');
  };

  // ==========================================================================
  // EXPENSE METHOD (Legacy support)
  // ==========================================================================

  const addExpense = async (expenseData: any) => {
    await expensesHook.addExpense(expenseData);
    showToast('Expense added successfully', 'success');
  };

  // ==========================================================================
  // NOTIFICATION METHODS
  // ==========================================================================

  const sendNotification = (notification: SystemNotification) => {
    notificationsHook.addNotification(notification);
  };

  const markNotificationAsRead = async (id: string) => {
    await notificationsHook.markAsRead(id);
  };

  // ==========================================================================
  // SYSTEM DATA METHODS
  // ==========================================================================

  const updateSystemData = (data: Partial<SystemData>) => {
    systemDataHook.updateSystemData(data);
  };

  // ==========================================================================
  // INITIALIZE FROM LOCALSTORAGE
  // ==========================================================================

  useEffect(() => {
    const storedAuth = safeGetLocalStorage('isAuthenticated', 'false');
    const storedUser = safeGetLocalStorage<User | null>('currentUser', null);
    const storedTransactions = safeGetLocalStorage<Transaction[]>('spendy_transactions', []);
    const storedMovements = safeGetLocalStorage<Movement[]>('spendy_inventoryMovements', []);
    const storedActivityLog = safeGetLocalStorage<any[]>('spendy_activitylog', []);

    if (storedAuth === 'true' && storedUser) {
      setIsAuthenticated(true);
      setCurrentUser(storedUser);
    }

    setTransactions(storedTransactions);
    setInventoryMovements(storedMovements);
    setActivityLog(storedActivityLog);
  }, []);

  // ==========================================================================
  // REFRESH ALL DATA
  // ==========================================================================

  const refresh = () => {
    eventsHook.refresh();
    walletsHook.refresh();
    expensesHook.refresh();
    paymentsHook.refresh();
    requestsHook.refresh();
    suppliersHook.refresh();
    inventoryHook.refresh();
    usersHook.refresh();
    notificationsHook.refresh();
    systemDataHook.refresh();
  };

  // ==========================================================================
  // CONTEXT VALUE
  // ==========================================================================

  const value: AppContextType = {
    // Auth
    isAuthenticated,
    currentUser,
    signIn,
    signUp,
    signOut,
    updateProfile,

    // Data
    events: eventsHook.events,
    wallets: walletsHook.wallets,
    expenses: expensesHook.expenses,
    payments: paymentsHook.payments,
    requests: requestsHook.requests,
    suppliers: suppliersHook.suppliers,
    inventory: inventoryHook.inventory,
    users: usersHook.users,
    notifications: notificationsHook.notifications,
    systemData: systemDataHook.systemData,
    transactions,
    inventoryMovements,
    activityLog,

    // Loading states
    loading: {
      events: eventsHook.loading,
      wallets: walletsHook.loading,
      expenses: expensesHook.loading,
      payments: paymentsHook.loading,
      requests: requestsHook.loading,
      suppliers: suppliersHook.loading,
      inventory: inventoryHook.loading,
      users: usersHook.loading,
      notifications: notificationsHook.loading
    },

    // Operations
    addEvent: eventsHook.addEvent,
    updateEvent: eventsHook.updateEvent,
    deleteEvent: eventsHook.deleteEvent,
    addWallet: walletsHook.addWallet,
    updateWallet: walletsHook.updateWallet,
    fundWallet,
    transferBetweenWallets,
    addExpense,
    updateExpense: expensesHook.updateExpense,
    addPayment: paymentsHook.addPayment,
    addRequest: requestsHook.addRequest,
    updateRequest: requestsHook.updateRequest,
    approveRequest,
    rejectRequest,
    addSupplier: suppliersHook.addSupplier,
    deleteSupplier: suppliersHook.deleteSupplier,
    addInventoryItem: inventoryHook.addInventoryItem,
    updateInventoryItem: inventoryHook.updateInventoryItem,
    checkOut,
    checkIn,
    addUser: usersHook.addUser,
    updateUser: usersHook.updateUser,
    deleteUser: usersHook.deleteUser,
    sendNotification,
    markNotificationAsRead,
    updateSystemData,
    refresh,
    showToast
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================================================
// CUSTOM HOOK TO USE CONTEXT
// ============================================================================

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }

  return context;
}
