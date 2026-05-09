import { 
  Event, 
  Expense, 
  Payment, 
  Wallet, 
  Request,
  Invoice,
  BusinessMetrics,
  ApprovalMetrics,
  WalletMetrics,
  SupplierPaymentMetrics,
  EventProfitLoss
} from './types';

export function calculateBusinessMetrics(
  expenses: Expense[],
  totalBudget: number,
  totalEventSpent: number,
  totalExpenses: number,
  walletMetrics: WalletMetrics
): BusinessMetrics {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses: number[] = [];

  for (let i = 0; i < 3; i++) {
    const monthToCheck = currentMonth - i;
    const monthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.startDate);
      return expDate.getMonth() === monthToCheck && expDate.getFullYear() === currentYear;
    }).reduce((sum, exp) => sum + exp.amount, 0);
    monthlyExpenses.push(monthExpenses);
  }

  const avgMonthlyBurnRate = monthlyExpenses.length > 0
    ? monthlyExpenses.reduce((a, b) => a + b, 0) / monthlyExpenses.length
    : 0;

  const budgetVariance = totalBudget > 0 ? ((totalBudget - totalEventSpent) / totalBudget) * 100 : 0;

  const cashflowRunway = avgMonthlyBurnRate > 0
    ? walletMetrics.available / avgMonthlyBurnRate
    : 0;

  const expenseToBudgetRatio = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  return {
    avgMonthlyBurnRate,
    budgetVariance,
    cashflowRunway,
    expenseToBudgetRatio
  };
}

export function calculateApprovalMetrics(requests: Request[]): ApprovalMetrics {
  const pending = requests.filter(r => r.status === 'Pending').length;
  const approved = requests.filter(r => r.status === 'Approved').length;
  const rejected = requests.filter(r => r.status === 'Rejected').length;
  const pendingAmount = requests
    .filter(r => r.status === 'Pending')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  return { pending, approved, rejected, pendingAmount };
}

export function calculateWalletMetrics(wallets: Wallet[], expenses: Expense[]): WalletMetrics {
  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
  const totalAllocated = expenses
    .filter(e => e.walletId && e.status === 'Approved')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  return {
    totalBalance,
    totalAllocated,
    available: totalBalance - totalAllocated
  };
}

export function calculateSupplierPaymentMetrics(
  requests: Request[],
  expenses: Expense[]
): SupplierPaymentMetrics {
  const pendingRequests = requests.filter(r =>
    r.status === 'Approved' &&
    r.supplier &&
    r.supplierId
  );
  
  const pendingExpenses = expenses.filter(e =>
    e.status === 'Approved' &&
    e.supplier &&
    !e.walletId
  );

  const totalAmount = pendingRequests.reduce((sum, r) => sum + (r.amount || 0), 0) +
                      pendingExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return {
    count: pendingRequests.length + pendingExpenses.length,
    amount: totalAmount
  };
}

export function calculatePaymentStatusBreakdown(payments: Payment[]) {
  const completed = payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + (p.amount || 0), 0);
  const pending = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (p.amount || 0), 0);
  const failed = payments.filter(p => p.status === 'Failed').reduce((sum, p) => sum + (p.amount || 0), 0);

  return [
    { name: 'Completed', value: completed },
    { name: 'Pending', value: pending },
    { name: 'Failed', value: failed }
  ].filter(item => item.value > 0);
}

export function calculateEventProfitLoss(
  eventId: string,
  eventName: string | undefined,
  allInvoices: Invoice[],
  allExpenses: Expense[]
): EventProfitLoss {
  const eventInvoices = allInvoices.filter(
    invoice =>
      invoice.documentType !== 'Quote' &&
      (invoice.eventId === eventId ||
      (eventName && invoice.eventName === eventName))
  );

  const eventExpenses = allExpenses.filter(
    expense => expense.eventId === eventId
  );

  const totalRevenue = eventInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidRevenue = eventInvoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.amountPaid, 0);
  const pendingRevenue = eventInvoices
    .filter(inv => inv.status === 'Sent' || inv.status === 'Partially Paid' || inv.status === 'Overdue')
    .reduce((sum, inv) => sum + inv.balance, 0);
  const paidInvoiceCount = eventInvoices.filter(inv => inv.status === 'Paid').length;

  const totalExpenses = eventExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const approvedExpenses = eventExpenses
    .filter(exp => exp.status === 'Approved' || exp.status === 'Completed')
    .reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = eventExpenses
    .filter(exp => exp.status === 'Pending')
    .reduce((sum, exp) => sum + exp.amount, 0);

  const grossProfit = totalRevenue - totalExpenses;
  const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
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

export function formatCurrency(amount: number, currency: string = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function getProfitLossColor(amount: number): 'success' | 'danger' | 'default' {
  if (amount > 0) return 'success';
  if (amount < 0) return 'danger';
  return 'default';
}
