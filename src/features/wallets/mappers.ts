import type { Wallet, Transaction } from '../../types';
import type { WalletDTO, TransactionDTO } from './types';

export function toWallet(dto: WalletDTO): Wallet {
  return {
    id: dto.id,
    name: dto.name,
    type: dto.type,
    balance: dto.balance,
    status: dto.status,
    currency: dto.currency ?? 'KES',
    createdAt: dto.createdAt,
    companyId: dto.companyId,
    ownerId: dto.ownerId,
    linkedEvent: dto.linkedEvent,
    isDefault: dto.isDefault ?? dto.type === 'Main Wallet',
  };
}

export function toTransaction(dto: TransactionDTO): Transaction {
  return {
    id: dto.id,
    walletId: dto.walletId,
    date: dto.date,
    time: dto.time,
    user: dto.user,
    recipient: dto.recipient,
    reference: dto.reference,
    amount: dto.amount,
    status: dto.status,
    type: dto.type,
    sourceWallet: dto.sourceWallet,
  };
}
