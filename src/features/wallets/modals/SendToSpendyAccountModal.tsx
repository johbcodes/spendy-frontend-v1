import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { Wallet, User } from '../../../types';
import { SearchIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';

interface SendToSpendyAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: {
    sourceWalletId: string;
    recipientAccountNumber: string;
    amount: number;
    reference: string;
  }) => void;
  wallets: Wallet[];
  onLookupAccount: (accountNumber: string) => Promise<User | null>;
}

export function SendToSpendyAccountModal({
  isOpen,
  onClose,
  onSuccess,
  wallets,
  onLookupAccount
}: SendToSpendyAccountModalProps) {
  // Normalize wallets data - handle both array and API response object
  const walletsArray = Array.isArray(wallets) ? wallets : (wallets as any)?.data || [];

  const [formData, setFormData] = useState({
    sourceWalletId: '',
    recipientAccountNumber: '',
    amount: '',
    reference: ''
  });

  const [recipientInfo, setRecipientInfo] = useState<User | null>(null);
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLookupAccount = async () => {
    if (formData.recipientAccountNumber.length !== 6) {
      setErrors({ ...errors, recipientAccountNumber: 'Account number must be 6 digits' });
      return;
    }

    setLookupStatus('loading');
    setErrors({});

    try {
      const user = await onLookupAccount(formData.recipientAccountNumber);
      if (user) {
        setRecipientInfo(user);
        setLookupStatus('found');
      } else {
        setRecipientInfo(null);
        setLookupStatus('not-found');
        setErrors({ ...errors, recipientAccountNumber: 'Account not found' });
      }
    } catch (err) {
      setLookupStatus('not-found');
      setErrors({ ...errors, recipientAccountNumber: 'Error looking up account' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.sourceWalletId) {
      newErrors.sourceWalletId = 'Please select a wallet';
    }

    if (!formData.recipientAccountNumber) {
      newErrors.recipientAccountNumber = 'Account number is required';
    }

    if (lookupStatus !== 'found') {
      newErrors.recipientAccountNumber = 'Please lookup and verify the account';
    }

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    const sourceWallet = walletsArray.find((w: Wallet) => w.id === formData.sourceWalletId);
    if (sourceWallet && amount > sourceWallet.balance) {
      newErrors.amount = 'Insufficient balance';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSuccess({
      sourceWalletId: formData.sourceWalletId,
      recipientAccountNumber: formData.recipientAccountNumber,
      amount: amount,
      reference: formData.reference || `Transfer to ${recipientInfo?.companyName}`
    });

    // Reset form
    setFormData({
      sourceWalletId: '',
      recipientAccountNumber: '',
      amount: '',
      reference: ''
    });
    setRecipientInfo(null);
    setLookupStatus('idle');
    setErrors({});
  };

  const selectedWallet = walletsArray.find((w: Wallet) => w.id === formData.sourceWalletId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send to Spendy Account" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Source Wallet */}
        <div>
          <Select
            label="From Wallet"
            value={formData.sourceWalletId}
            onChange={(e) => {
              setFormData({ ...formData, sourceWalletId: e.target.value });
              setErrors({ ...errors, sourceWalletId: '' });
            }}
            options={[
              { value: '', label: 'Select wallet' },
              ...walletsArray.map((w: Wallet) => ({
                value: w.id,
                label: `${w.name} (KES ${w.balance.toLocaleString()})`
              }))
            ]}
            required
          />
          {errors.sourceWalletId && (
            <p className="text-red-600 text-sm mt-1">{errors.sourceWalletId}</p>
          )}
        </div>

        {/* Recipient Account Number Lookup */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Account Number
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={formData.recipientAccountNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').substring(0, 6);
                  setFormData({ ...formData, recipientAccountNumber: value });
                  setLookupStatus('idle');
                  setRecipientInfo(null);
                  setErrors({ ...errors, recipientAccountNumber: '' });
                }}
                placeholder="Enter 6-digit account"
                maxLength={6}
                required
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleLookupAccount}
              disabled={formData.recipientAccountNumber.length !== 6 || lookupStatus === 'loading'}
            >
              <SearchIcon className="w-4 h-4" />
            </Button>
          </div>
          {errors.recipientAccountNumber && (
            <p className="text-red-600 text-sm mt-1">{errors.recipientAccountNumber}</p>
          )}

          {/* Lookup Result */}
          {lookupStatus === 'found' && recipientInfo && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-green-900">{recipientInfo.companyName}</p>
                <p className="text-sm text-green-700">
                  {recipientInfo.firstName} {recipientInfo.lastName}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Account: {formData.recipientAccountNumber}
                </p>
              </div>
            </div>
          )}

          {lookupStatus === 'not-found' && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">Account not found. Please check the account number.</p>
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <Input
            label="Amount (KES)"
            type="number"
            value={formData.amount}
            onChange={(e) => {
              setFormData({ ...formData, amount: e.target.value });
              setErrors({ ...errors, amount: '' });
            }}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
          {errors.amount && (
            <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
          )}
          {selectedWallet && (
            <p className="text-sm text-gray-600 mt-1">
              Available: KES {selectedWallet.balance.toLocaleString()}
            </p>
          )}
        </div>

        {/* Reference */}
        <div>
          <Input
            label="Reference (Optional)"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            placeholder="Payment reference"
          />
        </div>

        {/* Info Banner */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Spendy Account Transfer</strong> - No fees, instant delivery
          </p>
          <p className="text-xs text-blue-600 mt-1">
            💡 Money will be instantly credited to {recipientInfo?.companyName || "the recipient's"} Main Wallet
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={lookupStatus !== 'found'}>
            Send Money
          </Button>
        </div>
      </form>
    </Modal>
  );
}
