import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { Supplier, Wallet } from '../../../types';
import { ArrowLeftIcon, DollarSignIcon, CheckCircleIcon } from 'lucide-react';

interface PaySupplierProps {
  supplier: Supplier | null;
  wallets: Wallet[];
  onNavigate: (page: string) => void;
  onPaySupplier: (paymentData: any) => void;
  pendingAmount?: number;
}

export function PaySupplier({ supplier, wallets, onNavigate, onPaySupplier, pendingAmount }: PaySupplierProps) {
  // Normalize wallets data - handle both array and API response object
  const walletsArray = Array.isArray(wallets) ? wallets : (wallets as any)?.data || [];

  const [selectedWallet, setSelectedWallet] = useState('');
  const [customAmount, setCustomAmount] = useState(pendingAmount?.toString() || '');
  const [requestApproval, setRequestApproval] = useState(true);
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!supplier) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => onNavigate('suppliers')}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Suppliers
        </Button>
        <Card className="p-8 text-center">
          <p className="text-gray-500">Supplier not found</p>
        </Card>
      </div>
    );
  }

  const paymentAmount = Number(customAmount) || 0;
  const selectedWalletData = walletsArray.find(w => w.id === selectedWallet);
  const isValid = selectedWallet && paymentAmount > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !selectedWalletData) return;

    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      onPaySupplier({
        supplierId: supplier.id,
        supplierName: supplier.name,
        amount: paymentAmount,
        walletId: selectedWallet,
        walletName: selectedWalletData.name,
        description: description || `Payment for ${supplier.name}`,
        requestApproval: requestApproval,
        initiatedBy: 'Current User',
        eventId: supplier.event || ''
      });
      
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => {
        onNavigate('suppliers');
      }, 1500);
    }, 1500);
  };

  if (showSuccess) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => onNavigate('suppliers')}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Suppliers
        </Button>
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircleIcon className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            {requestApproval ? 'Approval Request Sent' : 'Payment Processed'}
          </h2>
          <p className="text-gray-600">
            {requestApproval 
              ? `Your payment request for ${supplier.name} has been sent for approval.`
              : `Payment of KES ${paymentAmount.toLocaleString()} has been processed successfully.`}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('suppliers')} className="p-0">
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-dark-gray">Pay Supplier</h1>
          <p className="text-gray-600 mt-1">Process payment for {supplier.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Supplier Info */}
              <div className="bg-light-gray p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-dark-gray">{supplier.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{supplier.category}</p>
                  </div>
                  <Badge variant="info">{supplier.paymentMethod || 'N/A'}</Badge>
                </div>
              </div>

              {/* Amount Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-dark-gray mb-4">Payment Amount</h3>

                <div className="space-y-4">
                  {pendingAmount && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-3">
                      <p className="text-sm text-orange-900 mb-1">Pending Amount</p>
                      <p className="text-2xl font-bold text-orange-700">KES {pendingAmount.toLocaleString()}</p>
                      <p className="text-xs text-orange-600 mt-1">This is the amount from the pending request/expense</p>
                    </div>
                  )}

                  <Input
                    label="Amount to Pay (KES)"
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder={pendingAmount ? pendingAmount.toString() : "Enter amount"}
                    required
                  />

                  {paymentAmount > 0 && (
                    <Card className="p-4 bg-green-50 border border-green-200">
                      <p className="text-sm text-gray-600 mb-1">Total Payment Amount</p>
                      <p className="text-2xl font-bold text-green-600">KES {paymentAmount.toLocaleString()}</p>
                    </Card>
                  )}
                </div>
              </div>

              {/* Wallet Selection */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-dark-gray mb-4">Payment Source</h3>
                
                <Select
                  label="Select Wallet"
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  options={[
                    { value: '', label: 'Select a wallet' },
                    ...walletsArray.map(w => ({
                      value: w.id,
                      label: `${w.name} - KES ${w.balance.toLocaleString()}`
                    }))
                  ]}
                  required
                />

                {selectedWalletData && (
                  <Card className="mt-4 p-4 bg-light-gray">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                        <p className="text-2xl font-bold text-dark-gray">
                          KES {selectedWalletData.balance.toLocaleString()}
                        </p>
                      </div>
                      {paymentAmount > selectedWalletData.balance && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-600">Insufficient Balance</p>
                          <p className="text-xs text-red-500">
                            Short by KES {(paymentAmount - selectedWalletData.balance).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>

              {/* Approval */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-dark-gray mb-4">Approval</h3>
                
                <div className="flex items-center gap-4 p-4 bg-light-gray rounded-lg">
                  <input
                    type="checkbox"
                    id="request-approval"
                    checked={requestApproval}
                    onChange={(e) => setRequestApproval(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="request-approval" className="text-sm font-medium text-gray-700">
                    Request approval before payment
                  </label>
                </div>
                
                {supplier.approvalRequired !== false && !requestApproval && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      ⚠️ This supplier requires approval. Processing without approval may be blocked.
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-dark-gray mb-2">
                  Description (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add payment description or notes..."
                />
              </div>

              {/* Processing State */}
              {isProcessing && (
                <Card className="p-4 bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                    <p className="text-sm font-medium text-yellow-800">Processing payment...</p>
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onNavigate('suppliers')}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isValid || isProcessing || (paymentAmount > (selectedWalletData?.balance || 0))}
                  className={(!isValid || isProcessing || (paymentAmount > (selectedWalletData?.balance || 0))) ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <DollarSignIcon className="w-4 h-4 mr-2" />
                  {requestApproval ? 'Request Approval' : 'Process Payment'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          <Card className="p-6 bg-gradient-to-br from-azure to-blue-700 text-white">
            <h3 className="font-semibold mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-white border-opacity-20">
                <span className="text-sm opacity-90">Supplier:</span>
                <span className="font-medium text-sm">{supplier.name}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white border-opacity-20">
                <span className="text-sm opacity-90">Amount:</span>
                <span className="font-bold text-lg">KES {paymentAmount.toLocaleString()}</span>
              </div>
              {selectedWalletData && (
                <div className="flex justify-between items-center pb-3 border-b border-white border-opacity-20">
                  <span className="text-sm opacity-90">From Wallet:</span>
                  <span className="font-medium text-sm">{selectedWalletData.name}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-90">Requires Approval:</span>
                <span className="font-medium text-sm">{supplier.approvalRequired !== false ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </Card>

          {/* Contact Details */}
          <Card className="p-4">
            <h4 className="font-semibold text-dark-gray mb-3">Contact</h4>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600 text-xs mb-1">Contact Person</p>
                <p className="font-medium text-dark-gray">{supplier.contactPerson}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Phone</p>
                <p className="font-medium text-dark-gray">{supplier.phone}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Email</p>
                <p className="font-medium text-dark-gray">{supplier.email}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
