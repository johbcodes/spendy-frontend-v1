import { apiHttp } from './http';
import type { ListParams, WalletDTO } from './types';

export interface TopupResponseDTO {
  checkoutRequestId: string;
  topupRequestId: string;
}

export interface MpesaRefDTO {
  mpesaAccountRef: string | null;
}

export const walletsApi = {
  list: (params?: ListParams) => apiHttp.get<WalletDTO[]>('/wallets', params),
  get: (walletId: string) => apiHttp.get<WalletDTO>(`/wallets/${walletId}`),
  transactions: (walletId: string, params?: ListParams) =>
    apiHttp.get(`/wallets/${walletId}/transactions`, params),
  create: (payload: { name: string; type: string }) => apiHttp.post<WalletDTO>('/wallets', payload),
  update: (walletId: string, payload: Partial<Pick<WalletDTO, 'name' | 'status'>>) =>
    apiHttp.patch<WalletDTO>(`/wallets/${walletId}`, payload),
  delete: (walletId: string) => apiHttp.delete(`/wallets/${walletId}`),
  fund: (walletId: string, payload: { amount: number; description?: string }) =>
    apiHttp.post(`/wallets/${walletId}/fund`, payload),
  topup: (payload: { phone: string; amount: number }) =>
    apiHttp.post<TopupResponseDTO>('/wallets/topup', payload),
  topupStatus: (requestId: string) =>
    apiHttp.get(`/wallets/topup-requests/${requestId}`),
  getMpesaRef: () => apiHttp.get<MpesaRefDTO>('/wallets/mpesa-ref'),
  transfer: (payload: { fromWalletId: string; toWalletId: string; amount: number; description?: string }) =>
    apiHttp.post('/wallets/transfer', payload),
  payoutB2C: (payload: { fromWalletId: string; phone: string; amount: number; remarks?: string; expenseId?: string }) =>
    apiHttp.post('/wallets/payouts/b2c', payload),
  payoutB2B: (payload: { fromWalletId: string; type: string; recipient: string; amount: number; accountReference: string; remarks?: string; expenseId?: string }) =>
    apiHttp.post('/wallets/payouts/b2b', payload),
  payoutStatus: (requestId: string) =>
    apiHttp.get(`/wallets/payout-requests/${requestId}`),
};
