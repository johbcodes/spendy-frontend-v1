import type { EventType } from '../types';

export type AgencyWalletType = 'Main' | 'Events' | 'Operations' | 'Activation';

export function getDefaultSourceWalletType(eventType: EventType): AgencyWalletType {
  if (eventType === 'Operation') return 'Operations';
  if (eventType === 'Activation') return 'Activation';
  return 'Events';
}

export function isInternalWalletTransfer(fromWalletType: string, toWalletType: string): boolean {
  return Boolean(fromWalletType && toWalletType);
}

export function canDirectlyTopUpPersonalWallet(): false {
  return false;
}

export function hasSufficientBalance(balance: number, amount: number): boolean {
  return Number.isFinite(balance) && Number.isFinite(amount) && amount > 0 && balance >= amount;
}
