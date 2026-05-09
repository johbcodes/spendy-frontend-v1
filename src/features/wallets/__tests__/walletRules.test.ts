import { describe, expect, it } from 'vitest';
import {
  canDeleteWallet,
  filterWallets,
  getVisibleWallets,
  getWalletDisplayName,
  getWalletDisplayType,
  summarizeWallets,
} from '../rules';
import type { Wallet } from '../../../types';
import type { User } from '../types';

const adminUser: User = {
  id: 'u-admin',
  firstName: 'Alice',
  lastName: 'Admin',
  email: 'alice@co.com',
  phone: '',
  country: 'Kenya',
  role: 'Admin',
  status: 'Active',
  modulesAssigned: ['All'],
  companyId: 'co-1',
  createdAt: new Date().toISOString(),
};

const staffUser: User = {
  id: 'u-staff',
  firstName: 'Bob',
  lastName: 'Staff',
  email: 'bob@co.com',
  phone: '',
  country: 'Kenya',
  role: 'Staff',
  status: 'Active',
  modulesAssigned: ['Expenses', 'Payments'],
  companyId: 'co-1',
  createdAt: new Date().toISOString(),
};

const mainWallet: Wallet = {
  id: 'w-main',
  name: 'Main Wallet',
  type: 'Main Wallet',
  balance: 100000,
  status: 'Active',
  createdAt: new Date().toISOString(),
  companyId: 'co-1',
  isDefault: true,
};

const eventsWallet: Wallet = {
  id: 'w-events',
  name: 'Events Wallet',
  type: 'Events Wallet',
  balance: 50000,
  status: 'Active',
  createdAt: new Date().toISOString(),
  companyId: 'co-1',
  isDefault: false,
};

const adminPersonalWallet: Wallet = {
  id: 'w-admin-personal',
  name: 'Alice Admin',
  type: 'USER',
  balance: 5000,
  status: 'Active',
  createdAt: new Date().toISOString(),
  companyId: 'co-1',
  ownerId: 'u-admin',
  isDefault: false,
};

const staffPersonalWallet: Wallet = {
  id: 'w-staff-personal',
  name: 'Bob Staff',
  type: 'USER',
  balance: 2000,
  status: 'Active',
  createdAt: new Date().toISOString(),
  companyId: 'co-1',
  ownerId: 'u-staff',
  isDefault: false,
};

const customWallet: Wallet = {
  id: 'w-custom',
  name: 'Project X',
  type: 'SYSTEM',
  balance: 10000,
  status: 'Active',
  createdAt: new Date().toISOString(),
  companyId: 'co-1',
  isDefault: false,
};

const otherCompanyWallet: Wallet = {
  id: 'w-other',
  name: 'Other Co Main',
  type: 'Main Wallet',
  balance: 999,
  status: 'Active',
  createdAt: new Date().toISOString(),
  companyId: 'co-2',
  isDefault: true,
};

const allWallets = [mainWallet, eventsWallet, adminPersonalWallet, staffPersonalWallet, customWallet, otherCompanyWallet];
const users = [adminUser, staffUser];

describe('canDeleteWallet', () => {
  it('blocks deletion of isDefault wallets', () => {
    expect(canDeleteWallet(mainWallet, users)).toBe(false);
  });

  it('blocks deletion of system wallet types', () => {
    expect(canDeleteWallet(eventsWallet, users)).toBe(false);
    expect(canDeleteWallet({ ...eventsWallet, type: 'Operations Wallet' }, users)).toBe(false);
  });

  it('blocks deletion of admin-owned USER wallets', () => {
    expect(canDeleteWallet(adminPersonalWallet, users)).toBe(false);
  });

  it('blocks deletion of wallets with "admin" in the name', () => {
    const namedAdmin: Wallet = { ...customWallet, type: 'USER', name: 'Admin Wallet' };
    expect(canDeleteWallet(namedAdmin, users)).toBe(false);
  });

  it('allows deletion of non-admin USER wallets', () => {
    expect(canDeleteWallet(staffPersonalWallet, users)).toBe(true);
  });

  it('allows deletion of custom SYSTEM wallets', () => {
    expect(canDeleteWallet(customWallet, users)).toBe(true);
  });
});

describe('getVisibleWallets', () => {
  it('returns only company wallets for admin', () => {
    const visible = getVisibleWallets(allWallets, adminUser);
    expect(visible.every(w => w.companyId === 'co-1')).toBe(true);
    expect(visible).toHaveLength(5);
  });

  it('returns only the staff user personal wallet for staff role', () => {
    const visible = getVisibleWallets(allWallets, staffUser);
    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe('w-staff-personal');
  });
});

describe('getWalletDisplayName', () => {
  it('returns owner full name for USER wallets', () => {
    expect(getWalletDisplayName(staffPersonalWallet, users)).toBe('Bob Staff');
  });

  it('returns wallet name for non-USER wallets', () => {
    expect(getWalletDisplayName(mainWallet, users)).toBe('Main Wallet');
  });
});

describe('getWalletDisplayType', () => {
  it('returns role-based label for USER wallets', () => {
    expect(getWalletDisplayType(staffPersonalWallet, users)).toBe('STAFF WALLET');
    expect(getWalletDisplayType(adminPersonalWallet, users)).toBe('ADMIN WALLET');
  });

  it('returns wallet type for non-USER wallets', () => {
    expect(getWalletDisplayType(mainWallet, users)).toBe('Main Wallet');
  });
});

describe('filterWallets', () => {
  const wallets = [mainWallet, eventsWallet, customWallet];

  it('filters by search term', () => {
    expect(filterWallets(wallets, { searchTerm: 'main', type: 'all' })).toHaveLength(1);
    expect(filterWallets(wallets, { searchTerm: 'xyz', type: 'all' })).toHaveLength(0);
  });

  it('filters by type', () => {
    expect(filterWallets(wallets, { searchTerm: '', type: 'events' })).toHaveLength(1);
  });

  it('returns all when filters are empty', () => {
    expect(filterWallets(wallets, { searchTerm: '', type: 'all' })).toHaveLength(3);
  });
});

describe('summarizeWallets', () => {
  it('sums balances and counts correctly', () => {
    const wallets = [mainWallet, eventsWallet, { ...customWallet, status: 'Frozen' as const }];
    const summary = summarizeWallets(wallets);
    expect(summary.totalWallets).toBe(3);
    expect(summary.totalBalance).toBe(160000);
    expect(summary.activeWallets).toBe(2);
  });
});
