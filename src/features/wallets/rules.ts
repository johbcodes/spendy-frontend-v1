import type { Wallet, User } from '../../types';
import type { WalletFilters, WalletSummary } from './types';

const SYSTEM_WALLET_TYPES: Wallet['type'][] = [
  'Main Wallet',
  'Operations Wallet',
  'Events Wallet',
];

export function canDeleteWallet(wallet: Wallet, users: User[]): boolean {
  if (wallet.isDefault) return false;
  if (SYSTEM_WALLET_TYPES.includes(wallet.type)) return false;

  if (wallet.type === 'USER') {
    if (wallet.name?.toLowerCase().includes('admin')) return false;
    if (wallet.ownerId) {
      const owner = users.find(u => u.id === wallet.ownerId);
      if (owner?.role === 'Admin') return false;
    }
  }

  return true;
}

export function getWalletDisplayName(wallet: Wallet, users: User[]): string {
  if (wallet.type === 'USER' && wallet.ownerId) {
    const owner = users.find(u => u.id === wallet.ownerId);
    if (owner) return `${owner.firstName} ${owner.lastName}`;
  }
  return wallet.name;
}

export function getWalletDisplayType(wallet: Wallet, users: User[]): string {
  if (wallet.type === 'USER' && wallet.ownerId) {
    const owner = users.find(u => u.id === wallet.ownerId);
    if (owner) {
      const labels: Record<string, string> = {
        Admin: 'ADMIN WALLET',
        Staff: 'STAFF WALLET',
        Approver: 'APPROVER WALLET',
        'Store Manager': 'STORE MANAGER WALLET',
      };
      return labels[owner.role] ?? wallet.type;
    }
  }
  return wallet.type;
}

export function getVisibleWallets(wallets: Wallet[], currentUser: User): Wallet[] {
  const company = wallets.filter(w => w.companyId === currentUser.companyId);
  if (currentUser.role === 'Staff') {
    return company.filter(w => w.type === 'USER' && w.ownerId === currentUser.id);
  }
  return company;
}

export function filterWallets(wallets: Wallet[], filters: WalletFilters): Wallet[] {
  return wallets.filter(w => {
    const matchesSearch =
      !filters.searchTerm ||
      w.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesType =
      !filters.type ||
      filters.type === 'all' ||
      w.type.toLowerCase().includes(filters.type.toLowerCase());
    return matchesSearch && matchesType;
  });
}

export function summarizeWallets(wallets: Wallet[]): WalletSummary {
  return {
    totalWallets: wallets.length,
    totalBalance: wallets.reduce((sum, w) => sum + w.balance, 0),
    activeWallets: wallets.filter(w => w.status === 'Active').length,
  };
}
