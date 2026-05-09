import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { AlertCircleIcon, WalletIcon, DollarSignIcon, UserIcon } from 'lucide-react';
interface InsufficientBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredAmount: number;
  currentBalance: number;
  walletName: string;
  availableWallets: any[];
  onFundWallet: () => void;
  onSelectWallet: (walletId: string) => void;
  onBillSupplier: () => void;
}
export function InsufficientBalanceModal({
  isOpen,
  onClose,
  requiredAmount,
  currentBalance,
  walletName,
  availableWallets,
  onFundWallet,
  onSelectWallet,
  onBillSupplier
}: InsufficientBalanceModalProps) {
  const [selectedOption, setSelectedOption] = useState<'fund' | 'select' | 'bill'>('fund');
  const [selectedWallet, setSelectedWallet] = useState('');
  const shortage = requiredAmount - currentBalance;
  const handleProceed = () => {
    if (selectedOption === 'fund') {
      onFundWallet();
    } else if (selectedOption === 'select' && selectedWallet) {
      onSelectWallet(selectedWallet);
    } else if (selectedOption === 'bill') {
      onBillSupplier();
    }
    onClose();
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Insufficient Wallet Balance" size="md">
      <div className="space-y-6">
        {/* Alert Section */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">
                Insufficient Balance
              </h3>
              <p className="text-sm text-red-700">
                The selected wallet "{walletName}" does not have sufficient
                funds to approve this expense.
              </p>
            </div>
          </div>
        </div>

        {/* Balance Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-light-gray p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Required Amount</p>
            <p className="text-xl font-bold text-dark-gray">
              KES {requiredAmount.toLocaleString()}
            </p>
          </div>
          <div className="bg-light-gray p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Current Balance</p>
            <p className="text-xl font-bold text-red-600">
              KES {currentBalance.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">Shortage:</span> KES{' '}
            {shortage.toLocaleString()}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <h3 className="font-semibold text-dark-gray">Choose an option:</h3>

          {/* Option 1: Fund Wallet */}
          <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedOption === 'fund' ? 'border-azure bg-azure bg-opacity-5' : 'border-gray-200 hover:border-gray-300'}`}>
            <input type="radio" name="option" value="fund" checked={selectedOption === 'fund'} onChange={() => setSelectedOption('fund')} className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <WalletIcon className="w-5 h-5 text-azure" />
                <span className="font-medium text-dark-gray">
                  Fund This Wallet
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Add funds to "{walletName}" to cover the shortage
              </p>
            </div>
          </label>

          {/* Option 2: Select Different Wallet */}
          <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedOption === 'select' ? 'border-azure bg-azure bg-opacity-5' : 'border-gray-200 hover:border-gray-300'}`}>
            <input type="radio" name="option" value="select" checked={selectedOption === 'select'} onChange={() => setSelectedOption('select')} className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <DollarSignIcon className="w-5 h-5 text-azure" />
                <span className="font-medium text-dark-gray">
                  Use Different Wallet
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Select another wallet with sufficient balance
              </p>
              {selectedOption === 'select' && <Select options={[{
              value: '',
              label: 'Select wallet'
            }, ...availableWallets.filter(w => w.balance >= requiredAmount).map(w => ({
              value: w.id,
              label: `${w.name} (KES ${w.balance.toLocaleString()})`
            }))]} value={selectedWallet} onChange={e => setSelectedWallet(e.target.value)} />}
            </div>
          </label>

          {/* Option 3: Bill Supplier */}
          <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedOption === 'bill' ? 'border-azure bg-azure bg-opacity-5' : 'border-gray-200 hover:border-gray-300'}`}>
            <input type="radio" name="option" value="bill" checked={selectedOption === 'bill'} onChange={() => setSelectedOption('bill')} className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <UserIcon className="w-5 h-5 text-azure" />
                <span className="font-medium text-dark-gray">
                  Bill Supplier
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Create a payable to the supplier instead of using wallet funds
              </p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleProceed} disabled={selectedOption === 'select' && !selectedWallet}>
            Proceed
          </Button>
        </div>
      </div>
    </Modal>;
}