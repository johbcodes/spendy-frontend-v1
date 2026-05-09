import { Invoice, InvoiceStatus, DocumentType, InvoiceLineItem, InvoicePayment } from '../../types';

export interface InvoiceFilters {
  searchTerm: string;
  statusFilter: 'all' | InvoiceStatus;
  documentTypeFilter?: DocumentType;
}

export interface InvoiceStats {
  total: number;
  draft: number;
  unpaid: number;
  paid: number;
  overdue: number;
  totalRevenue: number;
  outstandingAmount: number;
}

export interface QuoteStats {
  total: number;
  draft: number;
  sent: number;
  converted: number;
  totalValue: number;
}

export { Invoice, InvoiceStatus, DocumentType, InvoiceLineItem, InvoicePayment };
