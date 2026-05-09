import { useMemo } from 'react';
import { Invoice, InvoiceStats, QuoteStats } from './types';
import { filterInvoices, separateInvoicesAndQuotes } from './api';

export function useInvoiceFilters(
  invoices: Invoice[],
  searchTerm: string,
  statusFilter: string
) {
  return useMemo(() => {
    const { invoices: actualInvoices, quotes } = separateInvoicesAndQuotes(invoices);
    return {
      invoices: filterInvoices(actualInvoices, searchTerm, statusFilter),
      quotes: filterInvoices(quotes, searchTerm, statusFilter),
      allInvoices: actualInvoices,
      allQuotes: quotes
    };
  }, [invoices, searchTerm, statusFilter]);
}

export function useInvoiceStats(invoices: Invoice[]): InvoiceStats {
  return useMemo(() => {
    const { invoices: actualInvoices } = separateInvoicesAndQuotes(invoices);
    
    const total = actualInvoices.length;
    const draft = actualInvoices.filter(i => i.status === 'Draft').length;
    const unpaid = actualInvoices.filter(i => 
      i.status === 'Sent' || i.status === 'Overdue' || i.status === 'Partially Paid'
    ).length;
    const paid = actualInvoices.filter(i => i.status === 'Paid').length;
    const overdue = actualInvoices.filter(i => i.status === 'Overdue').length;
    
    const totalRevenue = actualInvoices
      .filter(i => i.status === 'Paid')
      .reduce((sum, i) => sum + i.total, 0);
    
    const outstandingAmount = actualInvoices
      .filter(i => i.status !== 'Paid' && i.status !== 'Draft' && i.status !== 'Cancelled')
      .reduce((sum, i) => sum + i.balance, 0);

    return {
      total,
      draft,
      unpaid,
      paid,
      overdue,
      totalRevenue,
      outstandingAmount
    };
  }, [invoices]);
}

export function useQuoteStats(invoices: Invoice[]): QuoteStats {
  return useMemo(() => {
    const { quotes } = separateInvoicesAndQuotes(invoices);
    
    const total = quotes.length;
    const draft = quotes.filter(q => q.status === 'Draft').length;
    const sent = quotes.filter(q => q.status === 'Sent').length;
    const converted = quotes.filter(q => q.convertedTo).length;
    const totalValue = quotes.reduce((sum, q) => sum + q.total, 0);

    return {
      total,
      draft,
      sent,
      converted,
      totalValue
    };
  }, [invoices]);
}
