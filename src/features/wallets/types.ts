import type { Wallet, Transaction, User } from '../../types';

export type { Wallet, Transaction };

export type WalletType =
  | 'Main Wallet'
  | 'Operations Wallet'
  | 'Events Wallet'
  | 'Event Wallet'
  | 'Company Wallet'
  | 'USER'
  | 'SYSTEM';

export interface WalletDTO {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  status: 'Active' | 'Frozen';
  currency?: string;
  createdAt: string;
  companyId?: string;
  ownerId?: string;
  linkedEvent?: string;
  isDefault?: boolean;
}

export interface TransactionDTO {
  id: string;
  walletId: string;
  date: string;
  time: string;
  user: string;
  recipient: string;
  reference: string;
  amount: number;
  status: 'Pending' | 'Completed' | 'Failed';
  type: 'Fund' | 'Transfer' | 'Withdrawal';
  sourceWallet?: string;
}

export interface FundWalletPayload {
  walletId: string;
  amount: number;
  paymentMethod: 'stk' | 'paybill' | 'till';
  phoneNumber?: string;
}

export interface TransferPayload {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  notes?: string;
}

export interface SendToSpendyPayload {
  sourceWalletId: string;
  recipientAccountNumber: string;
  amount: number;
  reference: string;
}

export interface WalletFilters {
  searchTerm: string;
  type: string;
}

export interface WalletSummary {
  totalWallets: number;
  totalBalance: number;
  activeWallets: number;
}

export type { User };
