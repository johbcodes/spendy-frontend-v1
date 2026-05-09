import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import { InfoIcon } from 'lucide-react';
import type { Wallet } from '../../../types';

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedWallets: Wallet[]) => void;
  wallets?: Wallet[];
}

export function FundWalletModal({
  isOpen,
  onClose,
  onSuccess,
  wallets = []
}: FundWalletModalProps) {
  // Normalize wallets data - handle both array and API response object
  const walletsArray = Array.isArray(wallets) ? wallets : (wallets as any)?.data || [];

  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stk' | 'paybill' | 'till'>('stk');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWalletId || !amount) {
      return;
    }

    // Update wallet balance
    const fundAmount = parseFloat(amount);
    const updatedWallets = walletsArray.map((w: Wallet) =>
      w.id === selectedWalletId
        ? { ...w, balance: w.balance + fundAmount }
        : w
    );

    onSuccess(updatedWallets);
    
    // Reset form
    setSelectedWalletId('');
    setAmount('');
    setPhoneNumber('');
  };

  const walletOptions = walletsArray.map((w: Wallet) => ({
    value: w.id,
    label: `${w.name} (KES ${w.balance.toLocaleString()})`
  }));

  const selectedWallet = walletsArray.find((w: Wallet) => w.id === selectedWalletId);
  return <Modal isOpen={isOpen} onClose={onClose} title="Fund Wallet" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select 
          label="Select Wallet" 
          options={walletOptions}
          value={selectedWalletId} 
          onChange={e => setSelectedWalletId(e.target.value)} 
          required 
        />

        <Input label="Amount (KES)" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />

        <div>
          <label className="block text-sm font-medium text-dark-gray mb-2">
            Payment Method
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-light-gray">
              <input type="radio" name="paymentMethod" value="stk" checked={paymentMethod === 'stk'} onChange={e => setPaymentMethod(e.target.value as 'stk' | 'paybill' | 'till')} className="text-primary" />
              <span className="text-sm">M-Pesa Direct (STK Push)</span>
            </label>
            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-light-gray">
              <input type="radio" name="paymentMethod" value="paybill" checked={paymentMethod === 'paybill'} onChange={e => setPaymentMethod(e.target.value as 'stk' | 'paybill' | 'till')} className="text-primary" />
              <span className="text-sm">M-Pesa Paybill</span>
            </label>
            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-light-gray">
              <input type="radio" name="paymentMethod" value="till" checked={paymentMethod === 'till'} onChange={e => setPaymentMethod(e.target.value as 'stk' | 'paybill' | 'till')} className="text-primary" />
              <span className="text-sm">M-Pesa Till Number</span>
            </label>
          </div>
        </div>

        {paymentMethod === 'stk' && <div className="space-y-4">
            <PhoneInput 
              label="Mobile Number" 
              value={phoneNumber} 
              onChange={value => setPhoneNumber(value)} 
              placeholder="7XXXXXXXX"
              helperText="Enter your M-Pesa registered number" 
              required 
            />
            <Card className="bg-blue-50 border border-blue-200">
              <div className="flex items-start space-x-3">
                <InfoIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  You'll receive an M-Pesa prompt on your phone. Enter your PIN
                  to complete the payment.
                </p>
              </div>
            </Card>
          </div>}

        {paymentMethod === 'paybill' && <Card className="bg-light-gray">
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-dark-gray">
                Payment Instructions:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Go to M-Pesa menu</li>
                <li>Select Lipa na M-Pesa → Paybill</li>
                <li>
                  Enter Paybill Number: <strong>4283222</strong>
                </li>
                  <li>
                    Enter Account Number: <strong>WALLET{selectedWalletId}</strong>
                  </li>
                <li>
                  Enter Amount: <strong>KES {amount || '0'}</strong>
                </li>
                <li>Enter your M-Pesa PIN</li>
              </ol>
            </div>
          </Card>}

        {paymentMethod === 'till' && <Card className="bg-light-gray">
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-dark-gray">
                Payment Instructions:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Go to M-Pesa menu</li>
                <li>Select Lipa na M-Pesa → Buy Goods and Services</li>
                <li>
                  Enter Till Number: <strong>5847392</strong>
                </li>
                <li>
                  Enter Amount: <strong>KES {amount || '0'}</strong>
                </li>
                <li>Enter your M-Pesa PIN</li>
              </ol>
            </div>
          </Card>}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {paymentMethod === 'stk' ? 'Send Payment Request' : 'I have paid'}
          </Button>
        </div>
      </form>
    </Modal>;
}
