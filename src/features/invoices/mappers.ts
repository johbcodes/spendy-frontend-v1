import { Invoice, InvoiceLineItem } from './types';

export function mapInvoiceToExportData(invoice: Invoice) {
  return {
    'Invoice Number': invoice.invoiceNumber,
    'Document Type': invoice.documentType,
    'Client Name': invoice.clientName,
    'Client Email': invoice.clientEmail,
    'Issue Date': invoice.issueDate,
    'Due Date': invoice.dueDate,
    'Subtotal': invoice.subtotal,
    'Tax': invoice.taxAmount,
    'Discount': invoice.discount,
    'Total': invoice.total,
    'Amount Paid': invoice.amountPaid,
    'Balance': invoice.balance,
    'Status': invoice.status,
    'Currency': invoice.currency
  };
}

export function mapInvoicesToExportData(invoices: Invoice[]) {
  return invoices.map(mapInvoiceToExportData);
}

export function mapLineItemToFormData(item: InvoiceLineItem) {
  return {
    itemName: item.itemName,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    amount: item.amount,
    taxRate: item.taxRate,
    taxAmount: item.taxAmount
  };
}

export function mapInvoiceToFormData(invoice: Invoice) {
  return {
    documentType: invoice.documentType,
    clientId: invoice.clientId,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    clientPhone: invoice.clientPhone,
    clientAddress: invoice.clientAddress,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    paymentTerms: invoice.paymentTerms,
    customPaymentTerms: invoice.customPaymentTerms,
    lineItems: invoice.lineItems.map(mapLineItemToFormData),
    taxRate: invoice.taxRate,
    discount: invoice.discount,
    discountType: invoice.discountType,
    notes: invoice.notes,
    terms: invoice.terms,
    footer: invoice.footer,
    eventId: invoice.eventId,
    eventName: invoice.eventName
  };
}
