import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import type { Request, Wallet, Supplier } from '../types';
import { CheckCircleIcon, UserIcon } from 'lucide-react';

interface ApproveExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request;
  wallets: Wallet[];
  suppliers: Supplier[];
  onApproveWithFunds: (walletId: string) => void;
  onAssignToSupplier: (supplierId: string, supplierName: string) => void;
}

export function ApproveExpenseModal({
  isOpen,
  onClose,
  request,
  wallets,
  suppliers,
  onApproveWithFunds,
  onAssignToSupplier
}: ApproveExpenseModalProps) {
  // Normalize wallets data - handle both array and API response object
  const walletsArray: Wallet[] = Array.isArray(wallets)
    ? wallets
    : ((wallets as { data?: Wallet[] })?.data || []);

  const [approvalType, setApprovalType] = useState<'funds' | 'supplier'>('funds');
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');

  // Pre-select the default wallet based on event type
  useEffect(() => {
    if (isOpen && walletsArray.length > 0) {
      const eventType = request.type || '';

      let defaultWallet: Wallet | undefined;

      console.log(`[Approval] Event type: "${eventType}"`);

      if (eventType === 'Operation') {
        // Operations use the Operations Wallet.
        defaultWallet = walletsArray.find(w => w.type === 'Operations Wallet');
        console.log('[Approval] Event type "Operation" uses Operations Wallet');
      } else if (eventType === 'Event' || eventType === 'Activation') {
        // Events and activations use the Events Wallet.
        defaultWallet = walletsArray.find(w => w.type === 'Events Wallet');
        console.log(`[Approval] Event type "${eventType}" uses Events Wallet`);
      }

      // Fallback to any available wallet
      if (!defaultWallet) {
        defaultWallet = walletsArray.find(w => w.type === 'Main Wallet' || w.type === 'Operations Wallet' || w.type === 'Events Wallet');
        console.log(`[Approval] No matching wallet, using fallback: ${defaultWallet?.name}`);
      }

      if (defaultWallet) {
        setSelectedWalletId(defaultWallet.id);
        console.log(`[Approval] Pre-selected wallet: ${defaultWallet.name}`);
      }
    }
  }, [isOpen, request.type, walletsArray]);

  const handleApprove = () => {
    if (approvalType === 'funds') {
      if (!selectedWalletId) {
        alert('Please select a wallet');
        return;
      }
      onApproveWithFunds(selectedWalletId);
    } else {
      if (!selectedSupplierId) {
        alert('Please select a supplier');
        return;
      }
      const supplier = suppliers.find(s => s.id === selectedSupplierId);
      if (supplier) {
        onAssignToSupplier(selectedSupplierId, supplier.name);
      }
    }
    onClose();
  };

  const selectedWallet = walletsArray.find(w => w.id === selectedWalletId);
  const hasInsufficientFunds = selectedWallet && selectedWallet.balance < request.amount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Approve Expense"
      size="md"
    >
      <div className="space-y-6">
        {/* Expense Summary */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Expense</span>
            <span className="font-semibold">{request.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="font-semibold text-lg">KES {request.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Category</span>
            <span className="font-medium">{request.category}</span>
          </div>
        </div>

        {/* Approval Type Selection */}
        {/* Hide supplier option for Operation expenses */}
        {request.type === 'Operation' ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Approval Option
            </label>
            <div className="p-4 border-2 border-green-500 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Approve with Funds</span>
              </div>
              <p className="text-xs text-gray-600">
                Make funds available for immediate payment
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Approval Option
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setApprovalType('funds')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  approvalType === 'funds'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircleIcon className={`w-5 h-5 ${approvalType === 'funds' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="font-semibold">Approve with Funds</span>
                </div>
                <p className="text-xs text-gray-600">
                  Make funds available for immediate payment
                </p>
              </button>

              <button
                type="button"
                onClick={() => setApprovalType('supplier')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  approvalType === 'supplier'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon className={`w-5 h-5 ${approvalType === 'supplier' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-semibold">Assign to Supplier</span>
                </div>
                <p className="text-xs text-gray-600">
                  Assign to supplier for payment later
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Wallet Selection (for funds approval) */}
        {approvalType === 'funds' && (
          <div className="space-y-3">
            <Select
              label="Select Wallet"
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              required
              options={[
                { value: '', label: 'Choose a wallet...' },
                ...walletsArray.map((wallet) => ({
                  value: wallet.id,
                  label: `${wallet.name} - KES ${wallet.balance.toLocaleString()} Available`
                }))
              ]}
            />

            {selectedWallet && (
              <div className={`p-3 rounded-lg ${hasInsufficientFunds ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <p className="text-sm font-medium mb-1">
                  {hasInsufficientFunds ? 'Insufficient Funds' : 'Sufficient Funds'}
                </p>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Wallet Balance:</span>
                    <span className="font-semibold">KES {selectedWallet.balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Required Amount:</span>
                    <span className="font-semibold">KES {request.amount.toLocaleString()}</span>
                  </div>
                  {!hasInsufficientFunds && (
                    <div className="flex justify-between text-green-700">
                      <span>Balance After:</span>
                      <span className="font-semibold">
                        KES {(selectedWallet.balance - request.amount).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                {hasInsufficientFunds && (
                  <p className="text-xs text-red-600 mt-2">
                    This wallet doesn't have enough funds. Please select a different wallet or fund this wallet first.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Supplier Selection (for supplier assignment) */}
        {approvalType === 'supplier' && (
          <div className="space-y-3">
            <Select
              label="Select Supplier"
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              required
              options={[
                { value: '', label: 'Choose a supplier...' },
                ...suppliers.map((supplier) => ({
                  value: supplier.id,
                  label: `${supplier.name} - ${supplier.category}`
                }))
              ]}
            />

            {selectedSupplierId && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Supplier Assignment
                </p>
                <p className="text-xs text-blue-700">
                  This expense will be assigned to the selected supplier. Payment will be tracked
                  separately and can be made to the supplier at a later time.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleApprove}
            disabled={
              (approvalType === 'funds' && (!selectedWalletId || hasInsufficientFunds)) ||
              (approvalType === 'supplier' && !selectedSupplierId)
            }
          >
            {approvalType === 'funds' ? 'Approve & Fund' : 'Approve & Assign'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

