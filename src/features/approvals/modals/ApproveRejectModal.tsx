import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { CheckCircleIcon, XCircleIcon, AlertCircleIcon, PlusIcon } from 'lucide-react';
import type { Request, Supplier, Wallet } from '../types';

const OPERATIONAL_CATEGORIES = [
  'Logistics',
  'Setup',
  'Breakdown',
  'Transportation',
  'Staff Costs',
  'Office Supplies',
  'Utilities',
  'Rent',
  'Insurance',
  'Maintenance',
  'Other'
];

interface ApproveRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
  onApprove: (walletId: string, category?: string, supplierId?: string, supplierName?: string) => void;
  onReject: (reason: string) => void;
  wallets: Wallet[];
  suppliers?: Supplier[];
  onInsufficientBalance: (requiredAmount: number, walletId: string) => void;
  currentUser?: any;
  onAddCategory?: (category: string) => void;
}
export function ApproveRejectModal({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
  wallets,
  suppliers = [],
  onInsufficientBalance,
  currentUser,
  onAddCategory
}: ApproveRejectModalProps) {
  // Normalize wallets data - handle both array and API response object
  const walletsArray: Wallet[] = Array.isArray(wallets)
    ? wallets
    : ((wallets as { data?: Wallet[] })?.data || []);
  const suppliersArray: Supplier[] = Array.isArray(suppliers)
    ? suppliers
    : ((suppliers as { data?: Supplier[] })?.data || []);

  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'supplier'>('wallet');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  if (!request) return null;
  const selectedWalletData = walletsArray.find(w => w.id === selectedWallet);
  const hasSufficientBalance = selectedWalletData ? selectedWalletData.balance >= request.amount : false;
  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      alert('Please enter a category name');
      return;
    }
    if (onAddCategory) {
      onAddCategory(newCategory.trim());
    }
    setSelectedCategory(newCategory.trim());
    setNewCategory('');
    setShowAddCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (action === 'approve') {
      if (paymentMethod === 'wallet') {
        if (!selectedWallet) {
          alert('Please select a wallet');
          return;
        }
        if (request.type === 'Operation' && !selectedCategory) {
          alert('Please select a category for this operational expense');
          return;
        }
        if (!hasSufficientBalance) {
          onInsufficientBalance(request.amount, selectedWallet);
          return;
        }
        onApprove(selectedWallet, request.type === 'Operation' ? selectedCategory : undefined);
      } else {
        // Supplier payment
        if (!selectedSupplier) {
          alert('Please select a supplier');
          return;
        }
        const supplier = suppliersArray.find(s => s.id === selectedSupplier);
        if (!supplier) {
          alert('Supplier not found');
          return;
        }
        // Pass empty wallet ID but include supplier info
        onApprove('', request.type === 'Operation' ? selectedCategory : undefined, supplier.id, supplier.name);
      }
    } else {
      if (!rejectReason.trim()) {
        alert('Please provide a reason for rejection');
        return;
      }
      onReject(rejectReason);
    }
    // Reset form
    setAction('approve');
    setPaymentMethod('wallet');
    setSelectedWallet('');
    setSelectedSupplier('');
    setRejectReason('');
    setSelectedCategory('');
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Review Request" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Request Details */}
        <div className="bg-light-gray p-4 rounded-lg">
          <h3 className="font-semibold text-dark-gray mb-3">Request Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Requested By</p>
              <p className="text-sm font-medium text-dark-gray">
                {request.requestedBy}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Type</p>
              <Badge variant="info">{request.type}</Badge>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Name</p>
              <p className="text-sm font-medium text-dark-gray">
                {request.name}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-600 mb-1">Category</p>
              {request.type === 'Operation' ? (
                <div className="space-y-2">
                  <Select
                    label=""
                    options={[
                      { value: '', label: 'Select operational category' },
                      ...OPERATIONAL_CATEGORIES.map(cat => ({ value: cat, label: cat }))
                    ]}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    required
                  />
                  {currentUser?.role === 'Admin' && (
                    <>
                      {!showAddCategory ? (
                        <button
                          type="button"
                          onClick={() => setShowAddCategory(true)}
                          className="text-xs text-azure hover:text-blue-700 flex items-center gap-1"
                        >
                          <PlusIcon className="w-3 h-3" />
                          Add new category
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            label=""
                            placeholder="New category name"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                          />
                          <Button type="button" size="sm" onClick={handleAddCategory}>
                            Add
                          </Button>
                          <Button type="button" size="sm" variant="secondary" onClick={() => {
                            setShowAddCategory(false);
                            setNewCategory('');
                          }}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm font-medium text-dark-gray">
                  {request.category}
                </p>
              )}
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-600 mb-1">Amount</p>
              <p className="text-2xl font-bold text-azure">
                KES {(request.amount || 0).toLocaleString()}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-600 mb-1">Description</p>
              <p className="text-sm text-dark-gray">{request.description}</p>
            </div>
          </div>
        </div>

        {/* Action Selection */}
        <div className="space-y-3">
          <h3 className="font-semibold text-dark-gray">Decision</h3>
          <div className="flex gap-3">
            <label className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${action === 'approve' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="action" value="approve" checked={action === 'approve'} onChange={() => setAction('approve')} className="hidden" />
              <CheckCircleIcon className={`w-5 h-5 ${action === 'approve' ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`font-medium ${action === 'approve' ? 'text-green-700' : 'text-gray-600'}`}>
                Approve
              </span>
            </label>

            <label className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${action === 'reject' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="action" value="reject" checked={action === 'reject'} onChange={() => setAction('reject')} className="hidden" />
              <XCircleIcon className={`w-5 h-5 ${action === 'reject' ? 'text-red-600' : 'text-gray-400'}`} />
              <span className={`font-medium ${action === 'reject' ? 'text-red-700' : 'text-gray-600'}`}>
                Reject
              </span>
            </label>
          </div>
        </div>

        {/* Conditional Fields */}
        {action === 'approve' ? <div className="space-y-4">
            {/* Payment Method Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-gray">Payment Method</label>
              <div className="flex gap-3">
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'wallet' ? 'border-azure bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="paymentMethod" value="wallet" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="hidden" />
                  <span className={`text-sm font-medium ${paymentMethod === 'wallet' ? 'text-azure' : 'text-gray-600'}`}>
                    Pay from Wallet
                  </span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'supplier' ? 'border-azure bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="paymentMethod" value="supplier" checked={paymentMethod === 'supplier'} onChange={() => setPaymentMethod('supplier')} className="hidden" />
                  <span className={`text-sm font-medium ${paymentMethod === 'supplier' ? 'text-azure' : 'text-gray-600'}`}>
                    Assign to Supplier
                  </span>
                </label>
              </div>
            </div>

            {/* Wallet Selection */}
            {paymentMethod === 'wallet' && (
              <>
                <Select label="Select Wallet" options={[{
                  value: '',
                  label: 'Select wallet to deduct from'
                }, ...walletsArray.filter(w => w.status === 'Active').map(w => ({
                  value: w.id,
                  label: `${w.name} - KES ${w.balance.toLocaleString()}`
                }))]} value={selectedWallet} onChange={e => setSelectedWallet(e.target.value)} required />

                {selectedWallet && selectedWalletData && <div className={`p-4 rounded-lg border-2 ${hasSufficientBalance ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start gap-3">
                      {hasSufficientBalance ? <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> : <AlertCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${hasSufficientBalance ? 'text-green-800' : 'text-red-800'}`}>
                          {hasSufficientBalance ? 'Sufficient Balance' : 'Insufficient Balance'}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Current Balance:</p>
                            <p className="font-semibold">
                              KES {selectedWalletData.balance.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">After Approval:</p>
                            <p className={`font-semibold ${hasSufficientBalance ? 'text-green-700' : 'text-red-700'}`}>
                              KES{' '}
                              {(selectedWalletData.balance - request.amount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>}
              </>
            )}

            {/* Supplier Selection */}
            {paymentMethod === 'supplier' && (
              <>
                <Select
                  label="Select Supplier"
                  options={[
                    { value: '', label: 'Select supplier to assign expense' },
                    ...suppliersArray
                      .filter(s => s.status === 'Active')
                      .map(s => ({
                        value: s.id,
                        label: `${s.name} - ${s.category || 'No Category'}`
                      }))
                  ]}
                  value={selectedSupplier}
                  onChange={e => setSelectedSupplier(e.target.value)}
                  required
                />
                {selectedSupplier && (
                  <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-3">
                      <AlertCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800">
                          Expense will be assigned to supplier
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          No wallet deduction will occur. The expense will be marked as payable to the supplier.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div> : <div>
            <label className="block text-sm font-medium text-dark-gray mb-2">
              Reason for Rejection *
            </label>
            <textarea className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure" rows={4} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Provide a clear reason for rejecting this request..." required />
          </div>}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant={action === 'approve' ? 'success' : 'danger'}>
            {action === 'approve' ? <>
                <CheckCircleIcon className="w-4 h-4" />
                Approve Request
              </> : <>
                <XCircleIcon className="w-4 h-4" />
                Reject Request
              </>}
          </Button>
        </div>
      </form>
    </Modal>;
}
