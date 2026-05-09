import { describe, expect, it } from 'vitest';
import { toTransaction, toWallet } from '../mappers';
import type { TransactionDTO, WalletDTO } from '../types';

describe('wallet mappers', () => {
  it('maps wallet DTO fields and applies currency/default fallbacks', () => {
    const dto: WalletDTO = {
      id: 'w-main',
      name: 'Main Wallet',
      type: 'Main Wallet',
      balance: 125000,
      status: 'Active',
      createdAt: '2026-05-01T09:00:00.000Z',
    };

    expect(toWallet(dto)).toEqual({
      id: 'w-main',
      name: 'Main Wallet',
      type: 'Main Wallet',
      balance: 125000,
      status: 'Active',
      currency: 'KES',
      createdAt: '2026-05-01T09:00:00.000Z',
      companyId: undefined,
      ownerId: undefined,
      linkedEvent: undefined,
      isDefault: true,
    });
  });

  it('preserves explicit currency and default flags', () => {
    const dto: WalletDTO = {
      id: 'w-user',
      name: 'User Wallet',
      type: 'USER',
      balance: 8000,
      status: 'Frozen',
      currency: 'USD',
      createdAt: '2026-05-01T09:00:00.000Z',
      ownerId: 'u-1',
      isDefault: false,
    };

    expect(toWallet(dto).currency).toBe('USD');
    expect(toWallet(dto).isDefault).toBe(false);
  });

  it('maps transaction DTOs to UI transaction shape', () => {
    const dto: TransactionDTO = {
      id: 't-1',
      walletId: 'w-main',
      date: '2026-05-01',
      time: '10:45',
      user: 'Alice',
      recipient: 'Supplier',
      reference: 'INV-445',
      amount: 3500,
      status: 'Completed',
      type: 'Transfer',
      sourceWallet: 'Main Wallet',
    };

    expect(toTransaction(dto)).toEqual({
      id: 't-1',
      walletId: 'w-main',
      date: '2026-05-01',
      time: '10:45',
      user: 'Alice',
      recipient: 'Supplier',
      reference: 'INV-445',
      amount: 3500,
      status: 'Completed',
      type: 'Transfer',
      sourceWallet: 'Main Wallet',
    });
  });
});
