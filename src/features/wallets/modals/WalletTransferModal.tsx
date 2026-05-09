import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import type { Wallet } from '../../../types';

interface WalletTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedWallets: Wallet[], transferData?: { fromWalletId: string; toWalletId: string; amount: number }) => void;
  wallets?: Wallet[];
}

export function WalletTransferModal({
  isOpen,
  onClose,
  onSuccess,
  wallets = []
}: WalletTransferModalProps) {
  // Normalize wallets data - handle both array and API response object
  const walletsArray = Array.isArray(wallets) ? wallets : (wallets as any)?.data || [];

  const [formData, setFormData] = useState({
    fromWallet: '',
    toWallet: '',
    amount: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fromWallet || !formData.toWallet || !formData.amount) {
      return;
    }

    const transferAmount = parseFloat(formData.amount);
    const fromWallet = walletsArray.find((w: Wallet) => w.id === formData.fromWallet);

    if (!fromWallet || fromWallet.balance < transferAmount) {
      return;
    }

    // Update both wallets
    const updatedWallets = walletsArray.map((w: Wallet) => {
      if (w.id === formData.fromWallet) {
        return { ...w, balance: w.balance - transferAmount };
      }
      if (w.id === formData.toWallet) {
        return { ...w, balance: w.balance + transferAmount };
      }
      return w;
    });

    onSuccess(updatedWallets, {
      fromWalletId: formData.fromWallet,
      toWalletId: formData.toWallet,
      amount: transferAmount
    });

    // Reset form
    setFormData({
      fromWallet: '',
      toWallet: '',
      amount: '',
      notes: ''
    });
  };

  const walletOptions = walletsArray.map((w: Wallet) => ({
    value: w.id,
    label: `${w.name} (KES ${w.balance.toLocaleString()})`
  }));
  return <Modal isOpen={isOpen} onClose={onClose} title="Wallet Transfer" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select 
          label="From Wallet" 
          options={[{
            value: '',
            label: 'Select wallet'
          }, ...walletOptions]} 
          value={formData.fromWallet} 
          onChange={e => setFormData({
            ...formData,
            fromWallet: e.target.value
          })} 
          required 
        />

        <Select 
          label="To Wallet" 
          options={[{
            value: '',
            label: 'Select wallet'
          }, ...walletOptions]} 
          value={formData.toWallet} 
          onChange={e => setFormData({
            ...formData,
            toWallet: e.target.value
          })} 
          required 
        />

        <Input label="Amount (KES)" type="number" value={formData.amount} onChange={e => setFormData({
        ...formData,
        amount: e.target.value
      })} required />

        <div>
          <label className="block text-sm font-medium text-dark-gray mb-1">
            Notes (Optional)
          </label>
          <textarea className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure focus:border-transparent" rows={3} value={formData.notes} onChange={e => setFormData({
          ...formData,
          notes: e.target.value
        })} placeholder="Add any notes about this transfer..." />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Transfer</Button>
        </div>
      </form>
    </Modal>;
}