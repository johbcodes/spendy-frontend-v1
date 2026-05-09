import { Invoice, Expense } from '../types';

export interface EventProfitLoss {
  // Revenue (Income)
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  invoiceCount: number;
  paidInvoiceCount: number;

  // Expenses (Costs)
  totalExpenses: number;
  approvedExpenses: number;
  pendingExpenses: number;
  expenseCount: number;

  // Profit/Loss
  grossProfit: number;
  grossProfitMargin: number; // percentage
  netProfit: number; // Based on paid invoices vs approved expenses
  isProfit: boolean;

  // Breakdown
  invoices: Invoice[];
  expenses: Expense[];
}

/**
 * Calculate Profit & Loss for an event based on linked invoices and expenses
 *
 * @param eventId - The ID of the event to calculate P&L for
 * @param eventName - The name of the event (optional, for filtering by name)
 * @param allInvoices - All invoices in the system
 * @param allExpenses - All expenses in the system
 * @returns EventProfitLoss object with detailed P&L calculations
 */
export function calculateEventProfitLoss(
  eventId: string,
  eventName: string | undefined,
  allInvoices: Invoice[],
  allExpenses: Expense[]
): EventProfitLoss {
  // Filter invoices linked to this event (by eventId or eventName)
  // Exclude quotations from P&L calculations
  const eventInvoices = allInvoices.filter(
    invoice =>
      invoice.documentType !== 'Quote' &&
      (invoice.eventId === eventId ||
      (eventName && invoice.eventName === eventName))
  );

  // Filter expenses linked to this event
  const eventExpenses = allExpenses.filter(
    expense => expense.eventId === eventId
  );

  // Calculate Revenue
  const totalRevenue = eventInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidRevenue = eventInvoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.amountPaid, 0);
  const pendingRevenue = eventInvoices
    .filter(inv => inv.status === 'Sent' || inv.status === 'Partially Paid' || inv.status === 'Overdue')
    .reduce((sum, inv) => sum + inv.balance, 0);
  const paidInvoiceCount = eventInvoices.filter(inv => inv.status === 'Paid').length;

  // Calculate Expenses
  const totalExpenses = eventExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const approvedExpenses = eventExpenses
    .filter(exp => exp.status === 'Approved' || exp.status === 'Completed')
    .reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = eventExpenses
    .filter(exp => exp.status === 'Pending')
    .reduce((sum, exp) => sum + exp.amount, 0);

  // Calculate Profit/Loss
  // Gross Profit = Total Revenue - Total Expenses
  const grossProfit = totalRevenue - totalExpenses;
  const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // Net Profit = Paid Revenue - Approved Expenses (more realistic)
  const netProfit = paidRevenue - approvedExpenses;
  const isProfit = grossProfit >= 0;

  return {
    totalRevenue,
    paidRevenue,
    pendingRevenue,
    invoiceCount: eventInvoices.length,
    paidInvoiceCount,
    totalExpenses,
    approvedExpenses,
    pendingExpenses,
    expenseCount: eventExpenses.length,
    grossProfit,
    grossProfitMargin,
    netProfit,
    isProfit,
    invoices: eventInvoices,
    expenses: eventExpenses
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'KES'): string {
  return `${currency} ${amount.toLocaleString()}`;
}

/**
 * Get profit/loss status color
 */
export function getProfitLossColor(amount: number): 'success' | 'danger' | 'default' {
  if (amount > 0) return 'success';
  if (amount < 0) return 'danger';
  return 'default';
}
