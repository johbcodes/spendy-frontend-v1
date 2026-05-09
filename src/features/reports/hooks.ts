import { useMemo } from 'react';
import {
  Event,
  Expense,
  Payment,
  Wallet,
  Request,
  BusinessMetrics,
  ApprovalMetrics,
  WalletMetrics
} from './types';
import {
  filterExpensesByDateRange,
  filterEventsByTypeAndClient,
  calculateMonthlyExpenseTrend,
  calculateCategoryBreakdown,
  calculateEventCostBreakdown,
  calculateBudgetVsActual,
  calculateExpenseByEventType,
  getUniqueClients
} from './api';
import {
  calculateBusinessMetrics,
  calculateApprovalMetrics,
  calculateWalletMetrics,
  calculateSupplierPaymentMetrics,
  calculatePaymentStatusBreakdown
} from './rules';

export function useFilteredData(
  events: Event[],
  expenses: Expense[],
  startDate?: string,
  endDate?: string,
  eventTypeFilter?: string,
  clientFilter?: string
) {
  return useMemo(() => {
    const filteredExpenses = filterExpensesByDateRange(expenses, startDate, endDate);
    const filteredEvents = filterEventsByTypeAndClient(events, eventTypeFilter, clientFilter);

    return {
      filteredExpenses,
      filteredEvents
    };
  }, [events, expenses, startDate, endDate, eventTypeFilter, clientFilter]);
}

export function useReportMetrics(
  filteredExpenses: Expense[],
  filteredEvents: Event[],
  wallets: Wallet[],
  requests: Request[],
  payments: Payment[]
) {
  return useMemo(() => {
    const operationalExpenses = filteredExpenses
      .filter(exp => !exp.eventId)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const eventExpenses = filteredExpenses
      .filter(exp => exp.eventId)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const totalExpenses = operationalExpenses + eventExpenses;
    const totalBudget = filteredEvents.reduce((sum, event) => sum + event.budget, 0);
    const totalEventSpent = filteredEvents.reduce((sum, event) => sum + event.spent, 0);
    const budgetUtilization = totalBudget > 0 ? Math.round((totalEventSpent / totalBudget) * 100) : 0;

    const walletMetrics = calculateWalletMetrics(wallets, filteredExpenses);
    const approvalMetrics = calculateApprovalMetrics(requests);
    const businessMetrics = calculateBusinessMetrics(
      filteredExpenses,
      totalBudget,
      totalEventSpent,
      totalExpenses,
      walletMetrics
    );
    const supplierPaymentMetrics = calculateSupplierPaymentMetrics(requests, filteredExpenses);
    const paymentStatusBreakdown = calculatePaymentStatusBreakdown(payments);

    return {
      operationalExpenses,
      eventExpenses,
      totalExpenses,
      totalBudget,
      totalEventSpent,
      budgetUtilization,
      walletMetrics,
      approvalMetrics,
      businessMetrics,
      supplierPaymentMetrics,
      paymentStatusBreakdown
    };
  }, [filteredExpenses, filteredEvents, wallets, requests, payments]);
}

export function useChartData(
  filteredExpenses: Expense[],
  filteredEvents: Event[],
  events: Event[],
  wallets: Wallet[]
) {
  return useMemo(() => {
    const monthlyExpenseTrend = calculateMonthlyExpenseTrend(filteredExpenses, events);
    const categoryBreakdown = calculateCategoryBreakdown(filteredExpenses);
    const eventCostBreakdown = calculateEventCostBreakdown(filteredEvents, filteredExpenses);
    const budgetVsActual = calculateBudgetVsActual(filteredEvents);
    const expenseByEventType = calculateExpenseByEventType(filteredExpenses, events);
    const walletBalanceDistribution = wallets.map(w => ({ name: w.name, value: w.balance || 0 }));

    return {
      monthlyExpenseTrend,
      categoryBreakdown,
      eventCostBreakdown,
      budgetVsActual,
      expenseByEventType,
      walletBalanceDistribution
    };
  }, [filteredExpenses, filteredEvents, events, wallets]);
}

export function useReportFilters(events: Event[]) {
  return useMemo(() => {
    const uniqueClients = getUniqueClients(events);
    return { uniqueClients };
  }, [events]);
}
