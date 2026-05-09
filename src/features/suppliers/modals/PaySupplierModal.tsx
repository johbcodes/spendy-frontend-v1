import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import { Supplier, Wallet, User } from '../../../types';
import { AlertCircleIcon, CheckCircleIcon, CreditCardIcon, ShieldCheckIcon } from 'lucide-react';

interface PaySupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  wallets?: Wallet[];
  currentUser?: User;
  onSuccess?: (paymentData: any) => void;
}

export function PaySupplierModal({
  isOpen,
  onClose,
  supplier,
  wallets = [],
  currentUser,
  onSuccess
}: PaySupplierModalProps) {
  // Normalize wallets data - handle both array and API response object
  const walletsArray = Array.isArray(wallets) ? wallets : (wallets as any)?.data || [];

  const [selectedWallet, setSelectedWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa_b2c' | 'paybill_b2b' | 'till_b2b' | 'bank'>('mpesa_b2c');
  const [requestApproval, setRequestApproval] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Payment method specific fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paybillNumber, setPaybillNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [tillNumber, setTillNumber] = useState('');

  useEffect(() => {
    if (isOpen && supplier) {
      setAmount(supplier.amount?.toString() || '');
      setDescription(`Payment for ${supplier.name} - ${supplier.category}`);
      
      // Auto-select Company Wallet (Main Wallet) or first wallet
      if (walletsArray.length > 0) {
        const primaryWallet = walletsArray.find(w => w.type === 'Company Wallet' || w.type === 'Main Wallet') || walletsArray[0];
        setSelectedWallet(primaryWallet.id);
      }

      // Pre-fill payment method and details from supplier
      if (supplier.paymentMethod === 'Mpesa B2C') {
        setPaymentMethod('mpesa_b2c');
        setPhoneNumber(supplier.mpesaPhone || '');
      } else if (supplier.paymentMethod === 'Paybill B2B') {
        setPaymentMethod('paybill_b2b');
        setPaybillNumber(supplier.paybillNumber || '');
        setAccountNumber(supplier.paybillAccount || '');
      } else if (supplier.paymentMethod === 'Till B2B') {
        setPaymentMethod('till_b2b');
        setTillNumber(supplier.tillNumber || '');
      } else if (supplier.paymentMethod === 'Bank') {
        setPaymentMethod('bank');
      }

      // Auto-request approval for non-admin users
      if (currentUser && currentUser.role !== 'Admin') {
        setRequestApproval(true);
      } else {
        setRequestApproval(false);
      }
    }
  }, [isOpen, supplier, walletsArray, currentUser]);

  if (!isOpen || !supplier) {
    return null;
  }

  const selectedWalletObj = walletsArray.find(w => w.id === selectedWallet);
  const paymentAmount = Number(amount) || 0;
  const insufficientBalance = selectedWalletObj && selectedWalletObj.balance < paymentAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWallet) {
      alert('Please select a wallet');
      return;
    }
    
    if (!amount || paymentAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!requestApproval && insufficientBalance) {
      alert(`Insufficient balance. Available: KES ${selectedWalletObj?.balance.toLocaleString()}`);
      return;
    }

    // Validate payment method fields
    if (paymentMethod === 'mpesa_b2c' && !phoneNumber) {
      alert('Please enter M-Pesa phone number');
      return;
    }
    if (paymentMethod === 'paybill_b2b' && (!paybillNumber || !accountNumber)) {
      alert('Please enter paybill number and account number');
      return;
    }
    if (paymentMethod === 'till_b2b' && !tillNumber) {
      alert('Please enter till number');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      if (onSuccess) {
        onSuccess({
          supplierId: supplier?.id,
          supplierName: supplier?.name,
          amount: paymentAmount,
          walletId: selectedWallet,
          walletName: selectedWalletObj?.name,
          description,
          paymentMethod,
          phoneNumber: paymentMethod === 'mpesa_b2c' ? phoneNumber : undefined,
          paybillNumber: paymentMethod === 'paybill_b2b' ? paybillNumber : undefined,
          accountNumber: paymentMethod === 'paybill_b2b' ? accountNumber : undefined,
          tillNumber: paymentMethod === 'till_b2b' ? tillNumber : undefined,
          type: 'Supplier Payment',
          requestApproval,
          status: requestApproval ? 'Pending' : 'Completed',
          initiatedBy: currentUser?.firstName + ' ' + currentUser?.lastName || 'Current User'
        });
      }
      
      setIsProcessing(false);
      setShowSuccess(true);
      
      // Reset and close after success
      setTimeout(() => {
        setAmount('');
        setDescription('');
        setSelectedWallet('');
        setPhoneNumber('');
        setPaybillNumber('');
        setAccountNumber('');
        setTillNumber('');
        setRequestApproval(false);
        setShowSuccess(false);
        onClose();
      }, 1500);
    }, 1500);
  };

  const walletOptions = walletsArray.map(w => ({
    value: w.id,
    label: `${w.name} (KES ${w.balance.toLocaleString()})`
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pay Supplier: ${supplier?.name || ''}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier Summary */}
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600">Supplier</p>
              <p className="font-semibold text-dark-gray">{supplier?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Category</p>
              <p className="font-semibold text-dark-gray">{supplier?.category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Status</p>
              <Badge variant={supplier?.paymentStatus === 'Pending' ? 'warning' : 'success'}>
                {supplier?.paymentStatus}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Contact Info */}
        <Card className="p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Contact Person</p>
              <p className="text-sm font-medium">{supplier?.contactPerson}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Phone</p>
              <p className="text-sm font-medium">{supplier?.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Email</p>
              <p className="text-sm font-medium">{supplier?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Business Type</p>
              <p className="text-sm font-medium">{supplier?.businessType || 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* Payment Amount */}
        <Input
          label="Payment Amount (KES)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          step="0.01"
          min="0"
        />

        {/* Wallet Selection */}
        <Select
          label="Select Wallet to Deduct From"
          options={walletOptions}
          value={selectedWallet}
          onChange={(e) => setSelectedWallet(e.target.value)}
          required
        />

        {selectedWalletObj && !requestApproval && (
          <Card className={`p-4 ${insufficientBalance ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-start gap-3">
              {insufficientBalance ? (
                <AlertCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {insufficientBalance ? 'Insufficient Balance' : 'Sufficient Balance'}
                </p>
                <p className={`text-sm ${insufficientBalance ? 'text-red-700' : 'text-green-700'}`}>
                  Available Balance: KES {selectedWalletObj.balance.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('mpesa_b2c')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'mpesa_b2c'
                  ? 'border-azure bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCardIcon className={`w-6 h-6 mx-auto mb-2 ${
                paymentMethod === 'mpesa_b2c' ? 'text-azure' : 'text-gray-400'
              }`} />
              <p className={`text-sm font-medium ${
                paymentMethod === 'mpesa_b2c' ? 'text-azure' : 'text-gray-600'
              }`}>
                M-Pesa B2C
              </p>
              <p className="text-xs text-gray-500 mt-1">Send Money</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('paybill_b2b')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'paybill_b2b'
                  ? 'border-azure bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCardIcon className={`w-6 h-6 mx-auto mb-2 ${
                paymentMethod === 'paybill_b2b' ? 'text-azure' : 'text-gray-400'
              }`} />
              <p className={`text-sm font-medium ${
                paymentMethod === 'paybill_b2b' ? 'text-azure' : 'text-gray-600'
              }`}>
                Paybill B2B
              </p>
              <p className="text-xs text-gray-500 mt-1">Pay Bill</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('till_b2b')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'till_b2b'
                  ? 'border-azure bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCardIcon className={`w-6 h-6 mx-auto mb-2 ${
                paymentMethod === 'till_b2b' ? 'text-azure' : 'text-gray-400'
              }`} />
              <p className={`text-sm font-medium ${
                paymentMethod === 'till_b2b' ? 'text-azure' : 'text-gray-600'
              }`}>
                Till B2B
              </p>
              <p className="text-xs text-gray-500 mt-1">Buy Goods</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('bank')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'bank'
                  ? 'border-azure bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCardIcon className={`w-6 h-6 mx-auto mb-2 ${
                paymentMethod === 'bank' ? 'text-azure' : 'text-gray-400'
              }`} />
              <p className={`text-sm font-medium ${
                paymentMethod === 'bank' ? 'text-azure' : 'text-gray-600'
              }`}>
                Bank Transfer
              </p>
              <p className="text-xs text-gray-500 mt-1">Bank</p>
            </button>
          </div>
        </div>

        {/* Payment Method Specific Fields */}
        <div className="space-y-4">
          {paymentMethod === 'mpesa_b2c' && (
            <PhoneInput
              label="Recipient M-Pesa Phone Number"
              value={phoneNumber}
              onChange={(value) => setPhoneNumber(value)}
              placeholder="7XXXXXXXX"
              required
            />
          )}

          {paymentMethod === 'paybill_b2b' && (
            <>
              <Input
                label="Paybill Number"
                type="text"
                value={paybillNumber}
                onChange={(e) => setPaybillNumber(e.target.value)}
                placeholder="Enter paybill number"
                required
              />
              <Input
                label="Account Number"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                required
              />
            </>
          )}

          {paymentMethod === 'till_b2b' && (
            <Input
              label="Till Number"
              type="text"
              value={tillNumber}
              onChange={(e) => setTillNumber(e.target.value)}
              placeholder="Enter till number"
              required
            />
          )}

          {paymentMethod === 'bank' && supplier?.paymentMethod === 'Bank' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-dark-gray mb-3">Bank Account Details</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-600">Bank</p>
                  <p className="font-medium">{supplier.bankName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Account Name</p>
                  <p className="font-medium">{supplier.accountName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Account Number</p>
                  <p className="font-medium">{supplier.accountNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Branch</p>
                  <p className="font-medium">{supplier.branchName}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-dark-gray mb-1">Description / Reference</label>
          <textarea
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Payment details or reference"
          />
        </div>

        {/* Request Approval Checkbox */}
        {currentUser?.role === 'Admin' ? (
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="requestApproval"
              checked={requestApproval}
              onChange={(e) => setRequestApproval(e.target.checked)}
              className="mt-1 w-4 h-4 text-azure border-gray-300 rounded focus:ring-azure"
            />
            <label htmlFor="requestApproval" className="text-sm text-gray-700 cursor-pointer">
              <span className="font-medium">Request approval before payment</span>
              <p className="text-xs text-gray-500 mt-1">
                Check this to send the payment for approval instead of processing immediately
              </p>
            </label>
          </div>
        ) : (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Approval Required:</span> This supplier payment will be sent for approval before processing.
            </p>
          </div>
        )}

        {/* Processing/Success State */}
        {isProcessing && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
              <p className="text-sm font-medium text-yellow-800">
                {requestApproval ? 'Submitting for approval...' : 'Processing payment...'}
              </p>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                {requestApproval ? 'Request submitted for approval!' : 'Payment processed successfully!'}
              </p>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="w-5 h-5 text-azure flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-dark-gray mb-1">
                Secure Payment Processing
              </p>
              <p className="text-xs text-gray-600">
                All supplier payments are processed securely. Your transaction is encrypted and protected.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={(!requestApproval && insufficientBalance) || isProcessing || !amount}
            className={(!requestApproval && insufficientBalance) ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <CreditCardIcon className="w-4 h-4 mr-2" />
            {isProcessing 
              ? (requestApproval ? 'Submitting...' : 'Processing...') 
              : (requestApproval ? 'Submit for Approval' : `Pay KES ${paymentAmount.toLocaleString()}`)}
          </Button>
        </div>
      </form>
    </Modal>
  );
}