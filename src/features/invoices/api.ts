import { Invoice, InvoiceLineItem } from './types';

export function filterInvoices(
  invoices: Invoice[],
  searchTerm: string,
  statusFilter: string
): Invoice[] {
  return invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
}

export function separateInvoicesAndQuotes(invoices: Invoice[]) {
  return {
    invoices: invoices.filter(inv => inv.documentType !== 'Quote'),
    quotes: invoices.filter(inv => inv.documentType === 'Quote')
  };
}

export function calculateInvoiceTotal(lineItems: InvoiceLineItem[], taxRate: number, discount: number, discountType: 'percentage' | 'fixed'): {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
} {
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * discount) / 100 
    : discount;
  
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = (subtotalAfterDiscount * taxRate) / 100;
  const total = subtotalAfterDiscount + taxAmount;

  return {
    subtotal,
    taxAmount,
    discountAmount,
    total
  };
}

export function generateInvoiceNumber(documentType: string, lastNumber: number): string {
  const prefix = documentType === 'Quote' ? 'QT' : documentType === 'Proforma' ? 'PF' : 'INV';
  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `${prefix}-${nextNumber}`;
}

export function createInvoice(data: Partial<Invoice>): Invoice {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    invoiceNumber: data.invoiceNumber || '',
    documentType: data.documentType || 'Invoice',
    clientId: data.clientId || '',
    clientName: data.clientName || '',
    clientEmail: data.clientEmail || '',
    clientPhone: data.clientPhone || '',
    issueDate: data.issueDate || now,
    dueDate: data.dueDate || now,
    paymentTerms: data.paymentTerms || 'Due on Receipt',
    lineItems: data.lineItems || [],
    subtotal: data.subtotal || 0,
    taxRate: data.taxRate || 0,
    taxAmount: data.taxAmount || 0,
    discount: data.discount || 0,
    discountType: data.discountType || 'fixed',
    total: data.total || 0,
    amountPaid: data.amountPaid || 0,
    balance: data.balance || 0,
    status: data.status || 'Draft',
    payments: data.payments || [],
    currency: data.currency || 'KES',
    createdBy: data.createdBy || '',
    createdAt: now,
    updatedAt: now,
    ...data
  } as Invoice;
}

export function updateInvoice(invoice: Invoice, updates: Partial<Invoice>): Invoice {
  return {
    ...invoice,
    ...updates,
    updatedAt: new Date().toISOString()
  };
}

export function duplicateInvoice(invoice: Invoice): Invoice {
  return createInvoice({
    ...invoice,
    id: crypto.randomUUID(),
    invoiceNumber: '', // Will be generated
    status: 'Draft',
    isDuplicate: true,
    duplicatedFrom: invoice.id,
    amountPaid: 0,
    balance: invoice.total,
    payments: [],
    sentAt: undefined,
    paidAt: undefined,
    approvedBy: undefined,
    approvedAt: undefined
  });
}

export function convertQuoteToInvoice(quote: Invoice, targetType: 'Invoice' | 'Proforma'): Invoice {
  return createInvoice({
    ...quote,
    id: crypto.randomUUID(),
    documentType: targetType,
    invoiceNumber: '', // Will be generated
    status: 'Draft',
    convertedFrom: quote.id,
    amountPaid: 0,
    balance: quote.total,
    payments: []
  });
}
