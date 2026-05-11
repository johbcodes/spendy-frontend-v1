import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import { Badge } from '../../../components/ui/Badge';
import { Expense, Payment, Wallet, Request, User } from '../../../types';
import { ArrowLeftIcon, CreditCardIcon, CheckCircleIcon, AlertCircleIcon, InfoIcon } from 'lucide-react';
import { walletsApi } from '../../../lib/api/walletsApi';
import { systemConfigApi } from '../../../lib/api/systemConfigApi';
import { getOutboundPaymentTariff } from '../../../domain/tariffRules';

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
type Step = 'form' | 'success';

export function PaymentDetail({
  expense,
  wallets = [],
  payments = [],
  currentUser,
  onNavigate,
  onMakePayment,
}: PaymentDetailProps) {
  const walletsArray = Array.isArray(wallets) ? wallets : (wallets as any)?.data || [];
  const isStaff = currentUser?.role === 'Staff';

  const userWallet = isStaff && currentUser
    ? walletsArray.find((w: Wallet) => w.type === 'Personal' && w.ownerId === currentUser.id)
      ?? walletsArray.find((w: Wallet) => w.type === 'USER' && w.ownerId === currentUser.id)
    : null;

  const defaultWalletId = isStaff && userWallet
    ? userWallet.id
    : walletsArray.find((w: Wallet) => w.type === 'Main')?.id
      ?? walletsArray[0]?.id
      ?? '';

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa_b2c');
  const [selectedWalletId, setSelectedWalletId] = useState(defaultWalletId);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paybillNumber, setPaybillNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [tillNumber, setTillNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState('');
  const [tariffConfig, setTariffConfig] = useState({ tariffRate: 0, tariffFlat: 0 });

  const amount = expense.amount;

  useEffect(() => {
    systemConfigApi.get()
      .then(data => {
        const cfg = (data as any).data ?? data;
        setTariffConfig({ tariffRate: cfg.tariffRate ?? 0, tariffFlat: cfg.tariffFlat ?? 0 });
      })
      .catch(() => {/* non-fatal */});
  }, []);

  const existingPayment = payments.find(p => p.expenseId === expense.id);
  const selectedWalletData = walletsArray.find((w: Wallet) => w.id === selectedWalletId);
  const displayWallet = isStaff ? userWallet : selectedWalletData;

  const tariff = getOutboundPaymentTariff({
    amount,
    sourceWalletId: selectedWalletId,
    isExternalPayee: true,
    config: tariffConfig,
  });

  const totalDeducted = amount + (tariff.applies ? tariff.fee : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWalletId) return;

    setIsProcessing(true);
    setError('');

    try {
      if (paymentMethod === 'mpesa_b2c') {
        if (!phoneNumber) {
          setError('Please enter the recipient phone number');
          return;
        }
        await walletsApi.payoutB2C({
          fromWalletId: selectedWalletId,
          phone: phoneNumber,
          amount,
          remarks: `Payment for ${expense.title}`,
          expenseId: expense.id,
        });
      } else if (paymentMethod === 'paybill_b2b') {
        if (!paybillNumber || !accountNumber) {
          setError('Please enter both paybill number and account number');
          return;
        }
        await walletsApi.payoutB2B({
          fromWalletId: selectedWalletId,
          type: 'B2B_PAYBILL',
          recipient: paybillNumber,
          amount,
          accountReference: accountNumber,
          remarks: `Payment for ${expense.title}`,
          expenseId: expense.id,
        });
      } else {
        if (!tillNumber) {
          setError('Please enter the till number');
          return;
        }
        await walletsApi.payoutB2B({
          fromWalletId: selectedWalletId,
          type: 'B2B_TILL',
          recipient: tillNumber,
          amount,
          accountReference: expense.id,
          remarks: `Payment for ${expense.title}`,
          expenseId: expense.id,
        });
      }

      onMakePayment({ expenseId: expense.id, status: 'Processing' });
      setStep('success');
      setTimeout(() => onNavigate('payments'), 2500);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Payment failed. Please try again.';
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-dark-gray mb-2">Payment Initiated</h2>
            <p className="text-gray-600 mb-4">
              Your payment of <strong>KES {amount.toLocaleString()}</strong> is being processed via M-Pesa.
            </p>
            <p className="text-sm text-gray-500">Redirecting to payments...</p>
          </Card>
        </div>
      </div>
    );
  }

  const nonSystemWallets = walletsArray.filter((w: Wallet) =>
    w.type !== 'Personal' && w.type !== 'USER'
  );
  const walletOptions = (isStaff ? (userWallet ? [userWallet] : []) : nonSystemWallets).map((w: Wallet) => ({
    label: `${w.name} (KES ${w.balance.toLocaleString()})`,
    value: w.id,
  }));

  const insufficientBalance = displayWallet && displayWallet.balance < totalDeducted;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('payments')}>
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-dark-gray">Make Payment</h1>
        </div>

        {existingPayment && existingPayment.status === 'Completed' && (
          <Card className="p-4 mb-6 bg-yellow-50 border border-yellow-200">
            <div className="flex gap-3">
              <AlertCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">Payment Already Processed</p>
                <p className="text-sm text-yellow-800 mt-1">
                  A payment of KES {existingPayment.amount.toLocaleString()} was already made for this expense.
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Expense Details */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-dark-gray mb-4">Expense Details</h2>
              <div className="space-y-2 text-sm">
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
                <div className="flex justify-between pt-3 border-t text-base">
                  <span className="font-semibold">Amount:</span>
                  <span className="font-bold text-primary">KES {amount.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-dark-gray mb-4">Payment Method</h2>
              <div className="space-y-4">
                <Select
                  label="Method"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  options={[
                    { label: 'M-Pesa (B2C — send to phone)', value: 'mpesa_b2c' },
                    { label: 'Paybill (B2B)', value: 'paybill_b2b' },
                    { label: 'Till Number (B2B)', value: 'till_b2b' },
                  ]}
                />

                {paymentMethod === 'mpesa_b2c' && (
                  <PhoneInput
                    label="Recipient M-Pesa Number"
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    placeholder="7XXXXXXXX"
                    required
                  />
                )}

                {paymentMethod === 'paybill_b2b' && (
                  <div className="space-y-3">
                    <Input
                      label="Paybill Number"
                      placeholder="e.g., 400123"
                      value={paybillNumber}
                      onChange={e => setPaybillNumber(e.target.value)}
                      required
                    />
                    <Input
                      label="Account Number"
                      placeholder="e.g., ACC123456"
                      value={accountNumber}
                      onChange={e => setAccountNumber(e.target.value)}
                      required
                    />
                  </div>
                )}

                {paymentMethod === 'till_b2b' && (
                  <Input
                    label="Till Number"
                    placeholder="e.g., 110123"
                    value={tillNumber}
                    onChange={e => setTillNumber(e.target.value)}
                    required
                  />
                )}
              </div>
            </Card>

            {/* Wallet Selection */}
            {!isStaff && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-dark-gray mb-4">Payment Wallet</h2>
                <Select
                  label="Debit From"
                  value={selectedWalletId}
                  onChange={e => setSelectedWalletId(e.target.value)}
                  options={walletOptions}
                  disabled={walletOptions.length === 0}
                />
                {insufficientBalance && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    Insufficient balance. Available: KES {displayWallet?.balance.toLocaleString() ?? 0}, Required: KES {totalDeducted.toLocaleString()}
                  </div>
                )}
              </Card>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isProcessing || !selectedWalletId || !!insufficientBalance}
            >
              {isProcessing ? 'Processing...' : 'Send Payment'}
            </Button>
          </form>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6 space-y-4">
              <h3 className="font-semibold text-dark-gray flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5 text-primary" />
                Payment Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium">KES {amount.toLocaleString()}</span>
                </div>

                {tariff.applies && tariff.fee > 0 && (
                  <div className="flex justify-between text-orange-700">
                    <span className="flex items-center gap-1">
                      <InfoIcon className="w-3.5 h-3.5" /> Platform Fee
                    </span>
                    <span className="font-medium">+ KES {tariff.fee.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t font-semibold text-base">
                  <span>Total Deducted</span>
                  <span className="text-primary">KES {totalDeducted.toLocaleString()}</span>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-gray-600 mb-1">{isStaff ? 'My Wallet' : 'Debit Wallet'}</p>
                  <p className="font-medium">{displayWallet?.name ?? '—'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Balance: KES {(displayWallet?.balance ?? 0).toLocaleString()}
                  </p>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-gray-600 mb-1">Method</p>
                  <Badge variant={paymentMethod === 'mpesa_b2c' ? 'info' : 'default'}>
                    {paymentMethod === 'mpesa_b2c' ? 'M-Pesa B2C' : paymentMethod === 'paybill_b2b' ? 'Paybill B2B' : 'Till B2B'}
                  </Badge>
                </div>

                {tariff.applies && tariff.fee > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500">
                      Platform fee: {tariffConfig.tariffRate > 0
                        ? `${(tariffConfig.tariffRate * 100).toFixed(1)}%`
                        : '—'}
                      {tariffConfig.tariffFlat > 0 ? ` + KES ${tariffConfig.tariffFlat}` : ''}
                    </p>
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
