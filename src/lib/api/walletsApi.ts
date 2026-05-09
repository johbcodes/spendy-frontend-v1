import { apiHttp } from './http';
import type { ListParams, WalletDTO } from './types';

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
  topup: (walletId: string, payload: { phone: string; amount: number }) =>
    apiHttp.post(`/wallets/${walletId}/topup`, payload),
  transfer: (payload: { fromWalletId: string; toWalletId: string; amount: number; description?: string }) =>
    apiHttp.post('/wallets/transfer', payload),
};
