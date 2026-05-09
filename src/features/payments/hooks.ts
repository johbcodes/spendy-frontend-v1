import { useCallback, useEffect, useMemo, useState } from 'react';
import { paymentFeatureApi } from './api';
import { filterPayments, summarizePayments } from './rules';
import type { Payment, User } from '../../types';
import type { PaymentFilters } from './types';

export function usePaymentView(payments: Payment[], filters: PaymentFilters) {
  const filteredPayments = useMemo(() => filterPayments(payments, filters), [payments, filters]);
  const summary = useMemo(() => summarizePayments(filteredPayments), [filteredPayments]);
  return { filteredPayments, summary };
}

export function usePaymentController(currentUser: User | null) {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!currentUser) {
      setPayments([]);
      return;
    }
    paymentFeatureApi.list().then(setPayments).catch(() => setPayments([]));
  }, [currentUser?.id]);

  // Keep localStorage in sync so legacy code that reads it directly still works
  useEffect(() => {
    localStorage.setItem('spendy_payments', JSON.stringify(payments));
  }, [payments]);

  const addPayment = useCallback((payment: Payment) => {
    setPayments(prev => [...prev, payment]);
  }, []);

  const refreshPayments = useCallback(async () => {
    const fresh = await paymentFeatureApi.list();
    setPayments(fresh);
  }, []);

  const clearPayments = useCallback(() => setPayments([]), []);

  return { payments, setPayments, addPayment, refreshPayments, clearPayments };
}
