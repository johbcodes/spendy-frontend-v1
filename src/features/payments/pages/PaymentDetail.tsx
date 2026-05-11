import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import { Badge } from '../../../components/ui/Badge';
import { Expense, Payment, Wallet, Request, User } from '../../../types';
import { ArrowLeftIcon, CreditCardIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';

interface PaymentDetailProps {
  expense: Expense;
  wallets: Wallet[];
  payments: Payment[];
  approvals?: Request[];
  expenses?: Expense[];
  currentUser?: User;
  onNavigate: (page: string, id?: string) => void;
  onMakePayment: (paymentData: any) => void;
}

type PaymentMethod = 'mpesa_b2c' | 'paybill_b2b' | 'till_b2b';

export function PaymentDetail({
  expense,
  wallets = [],
  payments = [],
  expenses = [],
  currentUser,
  onNavigate,
  onMakePayment
}: PaymentDetailProps) {
  // Normalize wallets data - handle both array and API response object
  const walletsArray = Array.isArray(wallets) ? wallets : (wallets as any)?.data || [];

  // Check if user is Staff
  const isStaff = currentUser?.role === 'Staff';

  // For staff users, auto-select their personal wallet
  const userWallet = isStaff && currentUser
    ? walletsArray.find(w => w.type === 'USER' && w.ownerId === currentUser.id)
    : null;

  // Debug logging for wallet balance
  if (isStaff && userWallet) {
    console.log('[PaymentDetail] Staff wallet found:', {
      name: userWallet.name,
      balance: userWallet.balance,
      id: userWallet.id,
      ownerId: userWallet.ownerId
    });
  } else if (isStaff) {
    console.log('[PaymentDetail] No staff wallet found for user:', currentUser?.id);
    console.log('[PaymentDetail] Available wallets:', walletsArray.map(w => ({
      id: w.id,
      name: w.name,
      type: w.type,
      ownerId: w.ownerId,
      balance: w.balance
    })));
  }

  const [amount] = useState(expense.amount.toString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa_b2c');
  const [selectedWallet, setSelectedWallet] = useState(
    isStaff && userWallet ? userWallet.id : (walletsArray[0]?.id || '')
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paybillNumber, setPaybillNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [tillNumber, setTillNumber] = useState('');
  const [mpesaCode, setMpesaCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');

  // Check if payment already exists
  const existingPayment = payments.find(p => p.expenseId === expense.id);

  const selectedWalletData = walletsArray.find(w => w.id === selectedWallet);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet) {
      alert('Please select a wallet');
      return;
    }

    setIsProcessing(true);

    try {
      // Determine payment reference
      let paymentRef = '';
      switch (paymentMethod) {
        case 'mpesa_b2c':
          paymentRef = mpesaCode || `MPESA-${Date.now()}`;
          break;
        case 'paybill_b2b':
          paymentRef = `PAYBILL-${Date.now()}`;
          break;
        case 'till_b2b':
          paymentRef = `TILL-${Date.now()}`;
          break;
      }

      const paymentData: Payment = {
        id: Date.now().toString(),
        eventId: expense.eventId,
        eventName: expense.eventName,
        expenseId: expense.id,
        amount: parseFloat(amount),
        recipient: expense.title,
        initiatedBy: 'Current User',
        mpesaCode: paymentMethod === 'mpesa_b2c' ? paymentRef : undefined,
        type: 'M-Pesa',
        status: requiresApproval ? 'Pending' : 'Completed',
        dateTime: new Date().toISOString(),
        description: `Payment for ${expense.title}`
      };

      // If approval required, create approval request
      if (requiresApproval) {
        const approvalRequest: Request = {
          id: Date.now().toString(),
          type: 'Event',
          name: `Payment Request: ${expense.title}`,
          category: expense.category,
          amount: parseFloat(amount),
          description: `Payment for ${expense.title}`,
          requestedBy: 'Current User',
          dateRequested: new Date().toISOString().split('T')[0],
          status: 'Pending',
          expenseId: expense.id,
          eventId: expense.eventId
        };
        onMakePayment({ payment: paymentData, approval: approvalRequest });
      } else {
        onMakePayment({ payment: paymentData });
      }

      setShowSuccess(true);
      setTimeout(() => {
        onNavigate('payments');
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-light-gray p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-dark-gray mb-2">Payment Successful</h2>
            <p className="text-gray-600 mb-4">Your payment has been {requiresApproval ? 'submitted for approval' : 'processed successfully'}</p>
            <p className="text-lg font-semibold text-primary">KES {parseFloat(amount).toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('payments')}>
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-dark-gray">Make Payment</h1>
        </div>

        {/* Existing Payment Warning */}
        {existingPayment && existingPayment.status === 'Completed' && (
          <Card className="p-4 mb-6 bg-yellow-50 border border-yellow-200">
            <div className="flex gap-3">
              <AlertCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">Payment Already Processed</p>
                <p className="text-sm text-yellow-800 mt-1">
                  A payment of KES {existingPayment.amount.toLocaleString()} was already made for this expense on {( () => {
                    const date = new Date(existingPayment.dateTime);
                    // Convert to Nairobi timezone (UTC+3)
                    const nairobiTime = new Date(date.getTime() + (3 * 60 * 60 * 1000));
                    // Format date as dd/mm/year with short month name
                    const day = nairobiTime.getDate().toString().padStart(2, '0');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const month = monthNames[nairobiTime.getMonth()];
                    const year = nairobiTime.getFullYear();
                    return `${day}/${month}/${year}`;
                  })()}
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Expense Summary */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-dark-gray mb-4">Expense Details</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Description:</span>
                      <span className="font-medium">{expense.title}</span>
                    </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{expense.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event:</span>
                    <span className="font-medium">{expense.eventName}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="font-semibold">Amount:</span>
                    <span className="text-lg font-bold text-primary">KES {parseFloat(amount).toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              {/* Payment Method */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-dark-gray mb-4">Payment Method</h2>
                <div className="space-y-4">
                  <Select
                    label="Payment Method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    options={[
                      { label: 'M-Pesa (B2C)', value: 'mpesa_b2c' },
                      { label: 'Paybill (B2B)', value: 'paybill_b2b' },
                      { label: 'Till (B2B)', value: 'till_b2b' }
                    ]}
                  />

                  {paymentMethod === 'mpesa_b2c' && (
                    <div className="space-y-4">
                      <PhoneInput
                        label="M-Pesa Phone Number"
                        value={phoneNumber}
                        onChange={setPhoneNumber}
                        placeholder="+254 XXX XXX XXX"
                      />
                      {!isStaff && (
                        <Input
                          label="M-Pesa Code (STK Push will be sent)"
                          placeholder="e.g., 123456"
                          value={mpesaCode}
                          onChange={(e) => setMpesaCode(e.target.value)}
                          disabled={isProcessing}
                        />
                      )}
                    </div>
                  )}

                  {paymentMethod === 'paybill_b2b' && (
                    <div className="space-y-4">
                      <Input
                        label="Paybill Number"
                        placeholder="e.g., 400123"
                        value={paybillNumber}
                        onChange={(e) => setPaybillNumber(e.target.value)}
                        disabled={isProcessing}
                      />
                      <Input
                        label="Account Number"
                        placeholder="e.g., ACC123456"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        disabled={isProcessing}
                      />
                    </div>
                  )}

                  {paymentMethod === 'till_b2b' && (
                    <Input
                      label="Till Number"
                      placeholder="e.g., 110123"
                      value={tillNumber}
                      onChange={(e) => setTillNumber(e.target.value)}
                      disabled={isProcessing}
                    />
                  )}
                </div>
              </Card>

              {/* Wallet Selection - Hidden for Staff */}
              {!isStaff && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-dark-gray mb-4">Payment Wallet</h2>
                  <Select
                    label="Select Wallet"
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    options={walletsArray.map(w => ({
                      label: `${w.name} (KES ${w.balance.toLocaleString()})`,
                      value: w.id
                    }))}
                    disabled={isProcessing || walletsArray.length === 0}
                  />
                  {selectedWalletData && selectedWalletData.balance < parseFloat(amount) && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      Insufficient balance in selected wallet
                    </div>
                  )}
                </Card>
              )}

              {/* Approval Option - Hidden for Staff */}
              {!isStaff && (
                <Card className="p-6">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="require-approval"
                      checked={requiresApproval}
                      onChange={(e) => setRequiresApproval(e.target.checked)}
                      className="mt-1"
                      disabled={isProcessing}
                    />
                    <div className="flex-1">
                      <label htmlFor="require-approval" className="font-semibold text-dark-gray cursor-pointer block mb-2">
                        Require Approval
                      </label>
                      <p className="text-sm text-gray-600 mb-3">Send this payment for approval before processing</p>
                      {requiresApproval && (
                        <textarea
                          placeholder="Add a note for approvers..."
                          value={approvalNote}
                          onChange={(e) => setApprovalNote(e.target.value)}
                          disabled={isProcessing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          rows={3}
                        />
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Submit Button */}
              <Button
                variant="primary"
                className="w-full"
                disabled={isProcessing || !selectedWallet || (!isStaff && selectedWalletData && selectedWalletData.balance < parseFloat(amount))}
                onClick={handleSubmit}
              >
                {isProcessing ? 'Processing...' : requiresApproval ? 'Send for Approval' : 'Make Payment'}
              </Button>
            </form>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6 space-y-4">
              <h3 className="font-semibold text-dark-gray flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5 text-primary" />
                Payment Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Amount to Pay</p>
                  <p className="text-xl font-bold text-dark-gray">KES {parseFloat(amount).toLocaleString()}</p>
                </div>

                {/* Show wallet information - personal wallet for staff, selected wallet for others */}
                <div className="pt-3 border-t">
                  <p className="text-gray-600">
                    {isStaff ? 'My Wallet' : 'Selected Wallet'}
                  </p>
                  <p className="font-medium text-dark-gray">
                    {isStaff && userWallet ? userWallet.name : (selectedWalletData?.name || 'Not selected')}
                  </p>
                  {(isStaff ? userWallet : selectedWalletData) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Balance: KES {(isStaff ? userWallet?.balance : selectedWalletData?.balance)?.toLocaleString() || '0'}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t">
                  <p className="text-gray-600">Payment Method</p>
                  <div className="mt-1">
                    <Badge variant={paymentMethod === 'mpesa_b2c' ? 'info' : 'default'}>
                      {paymentMethod === 'mpesa_b2c' ? 'M-Pesa' : paymentMethod === 'paybill_b2b' ? 'Paybill' : 'Till'}
                    </Badge>
                  </div>
                </div>

                {requiresApproval && (
                  <div className="pt-3 border-t">
                    <Badge variant="warning">Requires Approval</Badge>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
