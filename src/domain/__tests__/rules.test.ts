import { describe, expect, it } from 'vitest';
import { canAccessModule } from '../accessRules';
import { canApproveExpense, shouldAutoApproveExpense } from '../expenseRules';
import { getOutboundPaymentTariff } from '../tariffRules';
import { getDefaultSourceWalletType, hasSufficientBalance } from '../walletRules';

describe('Spendy business rules', () => {
  it('maps event types to the correct default source wallet', () => {
    expect(getDefaultSourceWalletType('Project')).toBe('Events');
    expect(getDefaultSourceWalletType('Operation')).toBe('Operations');
    expect(getDefaultSourceWalletType('Activation')).toBe('Activation');
  });

  it('blocks approver self approval and approver-on-approver approval', () => {
    expect(canApproveExpense({ id: 'u1', role: 'Approver' }, { createdById: 'u1', createdByRole: 'Staff', amount: 1000 })).toBe(false);
    expect(canApproveExpense({ id: 'u1', role: 'Approver' }, { createdById: 'u2', createdByRole: 'Approver', amount: 1000 })).toBe(false);
    expect(canApproveExpense({ id: 'admin', role: 'Admin' }, { createdById: 'admin', createdByRole: 'Admin', amount: 1000 })).toBe(true);
  });

  it('auto-approves only positive amounts within the user threshold', () => {
    expect(shouldAutoApproveExpense(500, 1000)).toBe(true);
    expect(shouldAutoApproveExpense(1500, 1000)).toBe(false);
    expect(shouldAutoApproveExpense(0, 1000)).toBe(false);
  });

  it('charges outbound tariffs to the source wallet only for external payees', () => {
    expect(getOutboundPaymentTariff({
      amount: 1000,
      sourceWalletId: 'wallet-1',
      isExternalPayee: true,
      config: { tariffRate: 0.02, tariffFlat: 10 },
    })).toEqual({ applies: true, fee: 30, chargedToWalletId: 'wallet-1' });

    expect(getOutboundPaymentTariff({
      amount: 1000,
      sourceWalletId: 'wallet-1',
      isExternalPayee: false,
      config: { tariffRate: 0.02, tariffFlat: 10 },
    })).toEqual({ applies: false, fee: 0 });
  });

  it('checks balances without allowing zero or invalid payments', () => {
    expect(hasSufficientBalance(1000, 1000)).toBe(true);
    expect(hasSufficientBalance(999, 1000)).toBe(false);
    expect(hasSufficientBalance(1000, 0)).toBe(false);
  });

  it('enforces module access by role and assignment', () => {
    expect(canAccessModule('Admin', 'Wallets')).toBe(true);
    expect(canAccessModule('Staff', 'Wallets')).toBe(false);
    expect(canAccessModule('Staff', 'Expenses')).toBe(true);
  });
});
