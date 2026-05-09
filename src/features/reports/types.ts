import { Event, Expense, Payment, Wallet, Request, Invoice } from '../../types';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  eventTypeFilter?: 'all' | 'Project' | 'Activation' | 'Operation';
  clientFilter?: string;
}

export interface BusinessMetrics {
  avgMonthlyBurnRate: number;
  budgetVariance: number;
  cashflowRunway: number;
  expenseToBudgetRatio: number;
}

export interface ApprovalMetrics {
  pending: number;
  approved: number;
  rejected: number;
  pendingAmount: number;
}

export interface WalletMetrics {
  totalBalance: number;
  totalAllocated: number;
  available: number;
}

export interface SupplierPaymentMetrics {
  count: number;
  amount: number;
}

export interface MonthlyTrendData {
  month: string;
  ops: number;
  events: number;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
}

export interface EventCostBreakdown {
  event: string;
  venue: number;
  manpower: number;
  transport: number;
  marketing: number;
  misc: number;
}

export interface EventProfitLoss {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  invoiceCount: number;
  paidInvoiceCount: number;
  totalExpenses: number;
  approvedExpenses: number;
  pendingExpenses: number;
  expenseCount: number;
  grossProfit: number;
  grossProfitMargin: number;
  netProfit: number;
  isProfit: boolean;
  invoices: Invoice[];
  expenses: Expense[];
}

export { Event, Expense, Payment, Wallet, Request, Invoice };
