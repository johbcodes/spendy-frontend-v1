import { walletsApi } from '../../lib/api';
import type { WalletDTO, TransactionDTO, FundWalletPayload, TransferPayload } from './types';

export const walletFeatureApi = {
  list: () => walletsApi.list() as Promise<WalletDTO[]>,

  get: (walletId: string) => walletsApi.get(walletId) as Promise<WalletDTO>,

  transactions: (walletId: string) =>
    walletsApi.transactions(walletId) as Promise<TransactionDTO[]>,

  create: (payload: { name: string; linkedEvent?: string }) =>
    walletsApi.create({ name: payload.name, type: 'SYSTEM' }) as Promise<WalletDTO>,

  update: (walletId: string, payload: Partial<Pick<WalletDTO, 'name' | 'status'>>) =>
    walletsApi.update(walletId, payload) as Promise<WalletDTO>,

  delete: (walletId: string) => walletsApi.delete(walletId),

  fund: (payload: FundWalletPayload) =>
    walletsApi.fund(payload.walletId, {
      amount: payload.amount,
      description: `Fund via ${payload.paymentMethod}`,
    }),

  topup: (walletId: string, phone: string, amount: number) =>
    walletsApi.topup(walletId, { phone, amount }),

  transfer: (payload: TransferPayload) =>
    walletsApi.transfer({
      fromWalletId: payload.fromWalletId,
      toWalletId: payload.toWalletId,
      amount: payload.amount,
      description: payload.notes,
    }),
};
