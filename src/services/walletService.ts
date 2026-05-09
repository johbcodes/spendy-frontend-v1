/**
 * Wallet Service
 * Handles all wallet-related data operations using backend API
 */

import { Wallet } from '../types';
import { walletAPI, Wallet as BackendWallet } from './backendAPI';

class WalletService {
  /**
   * Convert backend wallet to app wallet format
   */
  private convertToAppWallet(backendWallet: BackendWallet): Wallet {
    return {
      id: backendWallet.id,
      name: backendWallet.name,
      type: backendWallet.type,
      balance: backendWallet.balance,
      status: backendWallet.status,
      currency: backendWallet.currency || 'KES',
      createdAt: backendWallet.createdAt,
      companyId: backendWallet.companyId,
      ownerId: backendWallet.ownerId,
      isDefault: backendWallet.type.includes('Main')
    };
  }

  /**
   * Get all wallets from backend
   */
  async getAllWallets(): Promise<Wallet[]> {
    try {
      const response = await walletAPI.getAll();
      return response.data.map(w => this.convertToAppWallet(w));
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      return [];
    }
  }

  /**
   * Get wallets for a specific company (handled by backend automatically via token)
   */
  async getCompanyWallets(companyId: string): Promise<Wallet[]> {
    return this.getAllWallets();
  }

  /**
   * Get wallet by ID
   */
  async getWalletById(walletId: string): Promise<Wallet | undefined> {
    try {
      const response = await walletAPI.getById(walletId);
      return this.convertToAppWallet(response.data);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
      return undefined;
    }
  }

  /**
   * Get user's personal wallet
   */
  async getUserWallet(userId: string, companyId: string): Promise<Wallet | undefined> {
    const wallets = await this.getAllWallets();
    return wallets.find(wallet => wallet.type === 'USER' && wallet.ownerId === userId);
  }

  /**
   * Save wallets - Not needed with backend API (handled server-side)
   */
  saveCompanyWallets(companyId: string, companyWallets: Wallet[]): void {
    console.warn('saveCompanyWallets is deprecated with backend API');
  }

  /**
   * Create a new wallet - Not directly supported, wallets are auto-created
   */
  createWallet(wallet: Wallet): Wallet {
    console.warn('createWallet is deprecated with backend API - wallets are auto-created');
    return wallet;
  }

  /**
   * Update a wallet - Limited support
   */
  async updateWallet(walletId: string, updates: Partial<Wallet>): Promise<Wallet | null> {
    console.warn('updateWallet has limited support with backend API');
    return null;
  }

  /**
   * Delete a wallet - Not supported
   */
  deleteWallet(walletId: string): boolean {
    console.warn('deleteWallet is not supported with backend API');
    return false;
  }

  /**
   * Update wallet balance via funding
   */
  async updateBalance(walletId: string, amount: number): Promise<Wallet | null> {
    try {
      if (amount > 0) {
        await walletAPI.fund(walletId, amount, 'Balance update');
      }
      const response = await walletAPI.getById(walletId);
      return this.convertToAppWallet(response.data);
    } catch (error) {
      console.error('Failed to update balance:', error);
      return null;
    }
  }

  /**
   * Transfer funds between wallets
   */
  async transferFunds(fromWalletId: string, toWalletId: string, amount: number): Promise<{ success: boolean; error?: string }> {
    try {
      await walletAPI.transfer(fromWalletId, toWalletId, amount, 'Wallet transfer');
      return { success: true };
    } catch (error: any) {
      console.error('Transfer failed:', error);
      return { success: false, error: error.message || 'Transfer failed' };
    }
  }

  /**
   * Get wallet by type
   */
  async getWalletByType(companyId: string, walletType: string): Promise<Wallet | undefined> {
    const wallets = await this.getAllWallets();
    return wallets.find(wallet => wallet.type === walletType);
  }

  /**
   * Get wallet for event
   */
  async getEventWallet(companyId: string, eventId: string): Promise<Wallet | undefined> {
    const wallets = await this.getAllWallets();
    return wallets.find(wallet =>
      wallet.type === 'Events Wallet' && wallet.linkedEvent === eventId
    );
  }
}

export const walletService = new WalletService();
