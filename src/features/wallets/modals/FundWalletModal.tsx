import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import { InfoIcon, CheckCircleIcon, SmartphoneIcon, CreditCardIcon } from 'lucide-react';
import { walletsApi } from '../../../lib/api/walletsApi';
import type { Wallet } from '../../../types';

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedWallets?: Wallet[]) => void;
  wallets?: Wallet[];
  paybillNumber?: string;
  mpesaAccountRef?: string | null;
}

type Step = 'form' | 'stk-pending' | 'success' | 'failed';

export function FundWalletModal({
  isOpen,
  onClose,
  onSuccess,
  paybillNumber = '247247',
  mpesaAccountRef: propMpesaRef,
}: FundWalletModalProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stk' | 'paybill'>('stk');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mpesaAccountRef, setMpesaAccountRef] = useState<string | null>(propMpesaRef ?? null);
  const [topupRequestId, setTopupRequestId] = useState<string | null>(null);
  const [pollingAttempts, setPollingAttempts] = useState(0);

  // Poll for STK status
  useEffect(() => {
    if (step !== 'stk-pending' || !topupRequestId) return;

    const maxAttempts = 60; // 60 attempts × 2s = 2 minutes
    const pollInterval = 2000;

    const poll = async () => {
      try {
        const response = await walletsApi.topupStatus(topupRequestId);
        const status = (response as any).data?.status ?? (response as any).status;

        if (status === 'Completed') {
          setStep('success');
          onSuccess();
          setTimeout(() => {
            resetForm();
            onClose();
          }, 2000);
        } else if (status === 'Failed') {
          const reason = (response as any).data?.failureReason ?? (response as any).failureReason ?? 'Payment failed';
          setError(reason);
          setStep('failed');
        } else if (pollingAttempts >= maxAttempts) {
          setError('Payment confirmation timed out. Please check your wallet balance.');
          setStep('failed');
        } else {
          setPollingAttempts(prev => prev + 1);
        }
      } catch (err) {
        // Continue polling on error
        if (pollingAttempts >= maxAttempts) {
          setError('Unable to confirm payment status. Please check your wallet.');
          setStep('failed');
        } else {
          setPollingAttempts(prev => prev + 1);
        }
      }
    };

    const timer = setInterval(poll, pollInterval);
    return () => clearInterval(timer);
  }, [step, topupRequestId, pollingAttempts, onSuccess, onClose]);

  useEffect(() => {
    if (isOpen && propMpesaRef === undefined) {
      walletsApi.getMpesaRef()
        .then(data => setMpesaAccountRef((data as any).data?.mpesaAccountRef ?? (data as any).mpesaAccountRef ?? null))
        .catch(() => {/* non-fatal */});
    }
  }, [isOpen]);

  const resetForm = () => {
    setAmount('');
    setPhoneNumber('');
    setStep('form');
    setError('');
    setIsLoading(false);
    setTopupRequestId(null);
    setPollingAttempts(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSTKPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !amount) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await walletsApi.topup({ phone: phoneNumber, amount: numAmount });
      const requestId = (response as any).data?.topupRequestId ?? (response as any).topupRequestId;
      setTopupRequestId(requestId);
      setPollingAttempts(0);
      setStep('stk-pending');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to initiate payment';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaybillDone = () => {
    setStep('success');
    onSuccess();
    setTimeout(() => {
      resetForm();
      onClose();
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Top Up Main Wallet" size="lg">
      {step === 'stk-pending' ? (
        <div className="space-y-6 text-center py-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center animate-pulse">
              <SmartphoneIcon className="w-8 h-8 text-azure" />
            </div>
            <h3 className="text-lg font-semibold text-dark-gray">Check Your Phone</h3>
            <p className="text-gray-600 text-sm max-w-xs">
              An M-Pesa prompt has been sent to <strong>{phoneNumber}</strong>. Enter your PIN to complete the payment of <strong>KES {parseFloat(amount).toLocaleString()}</strong>.
            </p>
            <p className="text-xs text-gray-400">Waiting for confirmation… this will update automatically.</p>
          </div>

          <Card className="bg-blue-50 border border-blue-200 text-left">
            <div className="flex items-start gap-3">
              <InfoIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 space-y-1">
                <p className="font-medium">Payment Instructions</p>
                <p>1. A pop-up will appear on your phone</p>
                <p>2. Enter your M-Pesa PIN</p>
                <p>3. Your Main Wallet will be credited automatically</p>
              </div>
            </div>
          </Card>

          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={handleClose}>
              Close (I'll check later)
            </Button>
          </div>
        </div>
      ) : step === 'success' ? (
        <div className="space-y-4 text-center py-6">
          <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-semibold text-dark-gray">Payment Confirmed!</h3>
          <p className="text-gray-600 text-sm">KES {parseFloat(amount).toLocaleString()} has been added to your Main Wallet.</p>
        </div>
      ) : step === 'failed' ? (
        <div className="space-y-6 text-center py-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <InfoIcon className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-dark-gray">Payment Failed</h3>
            <p className="text-gray-600 text-sm mt-1">{error}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={handleClose}>Close</Button>
            <Button variant="primary" onClick={() => { setStep('form'); setError(''); }}>Try Again</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-gray mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'stk' ? 'border-azure bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="stk"
                  checked={paymentMethod === 'stk'}
                  onChange={() => setPaymentMethod('stk')}
                  className="hidden"
                />
                <SmartphoneIcon className={`w-5 h-5 ${paymentMethod === 'stk' ? 'text-azure' : 'text-gray-400'}`} />
                <div>
                  <p className={`text-sm font-medium ${paymentMethod === 'stk' ? 'text-azure' : 'text-dark-gray'}`}>STK Push</p>
                  <p className="text-xs text-gray-500">Prompt on phone</p>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'paybill' ? 'border-azure bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paybill"
                  checked={paymentMethod === 'paybill'}
                  onChange={() => setPaymentMethod('paybill')}
                  className="hidden"
                />
                <CreditCardIcon className={`w-5 h-5 ${paymentMethod === 'paybill' ? 'text-azure' : 'text-gray-400'}`} />
                <div>
                  <p className={`text-sm font-medium ${paymentMethod === 'paybill' ? 'text-azure' : 'text-dark-gray'}`}>Paybill</p>
                  <p className="text-xs text-gray-500">Manual payment</p>
                </div>
              </label>
            </div>
          </div>

          {paymentMethod === 'stk' ? (
            <form onSubmit={handleSTKPush} className="space-y-4">
              <Input
                label="Amount (KES)"
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="1"
                placeholder="0"
                required
              />
              <PhoneInput
                label="M-Pesa Phone Number"
                value={phoneNumber}
                onChange={value => setPhoneNumber(value)}
                placeholder="7XXXXXXXX"
                helperText="The M-Pesa prompt will be sent to this number"
                required
              />

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !phoneNumber || !amount}>
                  {isLoading ? 'Sending...' : 'Send M-Pesa Request'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <Input
                label="Amount (KES)"
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="1"
                placeholder="0"
              />

              <Card className="bg-light-gray">
                <div className="space-y-3 text-sm">
                  <p className="font-semibold text-dark-gray">Paybill Payment Instructions</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-700">
                    <li>Go to M-Pesa menu on your phone</li>
                    <li>Select <strong>Lipa na M-Pesa → Paybill</strong></li>
                    <li>Business Number: <strong className="text-azure text-base">{paybillNumber}</strong></li>
                    <li>
                      Account Number:{' '}
                      <strong className="text-azure text-base">
                        {mpesaAccountRef ?? <span className="text-gray-400 italic">Loading…</span>}
                      </strong>
                    </li>
                    <li>Amount: <strong>KES {amount || '—'}</strong></li>
                    <li>Enter your M-Pesa PIN and confirm</li>
                  </ol>
                </div>
              </Card>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="button" onClick={handlePaybillDone} disabled={!amount}>
                  I Have Paid
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
