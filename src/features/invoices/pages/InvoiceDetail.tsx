import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { Invoice, User } from '../../../types';
import {
  ArrowLeftIcon,
  DownloadIcon,
  SendIcon,
  DollarSignIcon,
  CheckCircleIcon,
  XCircleIcon,
  EditIcon,
  CopyIcon,
  CheckIcon,
  XIcon,
} from 'lucide-react';
import { DateTimeDisplay } from '../../../utils/dateFormatter';
import { generateInvoicePDF } from '../../../utils/invoicePDF';

interface InvoiceDetailProps {
  invoice: Invoice | null;
  onNavigate: (page: string) => void;
  onUpdateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void;
  onRecordPayment: (invoiceId: string, payment: any) => void;
  onOpenModal: (modal: string, data?: any) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  currentUser: User | null;
  onDuplicateInvoice: (invoiceId: string) => void;
  onApproveInvoice: (invoiceId: string) => void;
  onRejectInvoice: (invoiceId: string) => void;
  onConvertQuote: (quoteId: string, targetType: 'Invoice' | 'Proforma') => void;
  companyLogo?: string;
  companyName?: string;
  companyPhone?: string;
  companyOfficialEmail?: string;
  companyOfficeAddress?: string;
  spendyPaybillNumber?: string;
  spendyAccountNumber?: string;
}

export function InvoiceDetail({ invoice, onNavigate, onUpdateInvoice, onRecordPayment, onOpenModal, onDeleteInvoice, currentUser, onDuplicateInvoice, onApproveInvoice, onRejectInvoice, onConvertQuote, companyLogo, companyName, companyPhone, companyOfficialEmail, companyOfficeAddress, spendyPaybillNumber, spendyAccountNumber }: InvoiceDetailProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'Other'>('M-Pesa');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  if (!invoice) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => onNavigate('invoices')}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Invoices
        </Button>
        <Card className="p-8 text-center">
          <p className="text-gray-500">Invoice not found</p>
        </Card>
      </div>
    );
  }

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Sent':
      case 'Partially Paid':
      case 'Pending Approval':
        return 'warning';
      case 'Overdue':
      case 'Cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (amount > (invoice.balance || 0)) {
      alert('Payment amount cannot exceed the outstanding balance');
      return;
    }

    const payment = {
      date: new Date().toISOString().split('T')[0],
      amount,
      paymentMethod,
      reference: paymentReference,
      notes: paymentNotes,
    };

    onRecordPayment(invoice.id, payment);
    setShowPaymentForm(false);
    setPaymentAmount('');
    setPaymentReference('');
    setPaymentNotes('');
  };

  const handleStatusChange = (newStatus: string) => {
    onUpdateInvoice(invoice.id, { status: newStatus as any });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('invoices')}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-dark-gray">{invoice.documentType} {invoice.invoiceNumber}</h1>
            <p className="text-gray-600 mt-1">{invoice.clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>

          {/* Approve/Reject buttons for Pending Approval (Admin only) */}
          {invoice.status === 'Pending Approval' && currentUser?.role === 'Admin' && (
            <>
              <Button variant="primary" size="sm" onClick={() => onApproveInvoice(invoice.id)}>
                <CheckIcon className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button variant="danger" size="sm" onClick={() => onRejectInvoice(invoice.id)}>
                <XIcon className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </>
          )}

          {/* Send Invoice button for Draft status */}
          {invoice.status === 'Draft' && (
            <Button variant="primary" size="sm" onClick={() => handleStatusChange('Sent')}>
              <SendIcon className="w-4 h-4 mr-2" />
              Send Invoice
            </Button>
          )}

          {/* Edit button - always available */}
          <Button variant="secondary" size="sm" onClick={() => onOpenModal('edit-invoice', invoice)}>
            <EditIcon className="w-4 h-4 mr-2" />
            Edit
          </Button>

          {/* Duplicate button - only for Quotes */}
          {invoice.documentType === 'Quote' && (
            <Button variant="secondary" size="sm" onClick={() => onDuplicateInvoice(invoice.id)}>
              <CopyIcon className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
          )}

          {/* Convert Quote button - only for Quotes that haven't been converted */}
          {invoice.documentType === 'Quote' && !invoice.convertedTo && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const target = window.confirm('Convert to Invoice? Click OK for Invoice, Cancel for Proforma') ? 'Invoice' : 'Proforma';
                onConvertQuote(invoice.id, target);
              }}
            >
              Convert to Invoice/Proforma
            </Button>
          )}

          {/* Download PDF button */}
          <Button variant="secondary" size="sm" onClick={() => generateInvoicePDF(invoice, companyLogo, companyName, companyPhone, companyOfficialEmail, companyOfficeAddress, spendyPaybillNumber, spendyAccountNumber)}>
            <DownloadIcon className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Header Card */}
          <Card className="p-6">
            {(companyLogo || companyName || companyPhone || companyOfficialEmail || companyOfficeAddress) && (
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-start gap-4">
                  {companyLogo && <img src={companyLogo} alt="Company Logo" className="h-12 w-auto object-contain" />}
                  <div>
                    {companyName && <p className="font-semibold text-lg text-dark-gray">{companyName}</p>}
                    {(companyPhone || companyOfficialEmail || companyOfficeAddress) && (
                      <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                        {companyPhone && <div>Tel: {companyPhone}</div>}
                        {companyOfficialEmail && <div>Email: {companyOfficialEmail}</div>}
                        {companyOfficeAddress && <div>Address: {companyOfficeAddress}</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Bill To:</h3>
                <p className="font-semibold text-dark-gray">{invoice.clientName}</p>
                <p className="text-sm text-gray-600">{invoice.clientEmail}</p>
                <p className="text-sm text-gray-600">{invoice.clientPhone}</p>
                {invoice.clientAddress && <p className="text-sm text-gray-600 mt-2">{invoice.clientAddress}</p>}
              </div>
              <div className="text-right">
                <div className="mb-4">
                  <p className="text-xs text-gray-600">Number</p>
                  <p className="font-semibold text-dark-gray">{invoice.invoiceNumber}</p>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-gray-600">Issue Date</p>
                  <DateTimeDisplay date={invoice.issueDate} />
                </div>
                <div className="mb-4">
                  <p className="text-xs text-gray-600">Due Date</p>
                  <DateTimeDisplay date={invoice.dueDate} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Payment Terms</p>
                  <p className="font-medium text-sm text-dark-gray">{invoice.paymentTerms}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Line Items */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-dark-gray mb-4">Line Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-xs font-semibold text-gray-600 uppercase">Item/Product</th>
                    <th className="text-left py-3 text-xs font-semibold text-gray-600 uppercase">Description</th>
                    <th className="text-right py-3 text-xs font-semibold text-gray-600 uppercase">Qty</th>
                    <th className="text-right py-3 text-xs font-semibold text-gray-600 uppercase">Unit Price</th>
                    <th className="text-right py-3 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 text-sm font-medium text-dark-gray">{item.itemName}</td>
                      <td className="py-3 text-sm text-gray-600">{item.description}</td>
                      <td className="py-3 text-sm text-right text-gray-600">{item.quantity}</td>
                      <td className="py-3 text-sm text-right text-gray-600">
                        {invoice.currency} {item.unitPrice.toLocaleString()}
                      </td>
                      <td className="py-3 text-sm text-right font-semibold text-dark-gray">
                        {invoice.currency} {item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      {invoice.currency} {invoice.subtotal.toLocaleString()}
                    </span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-green-600">
                        - {invoice.currency} {invoice.discount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
                    <span className="font-medium">
                      {invoice.currency} {invoice.taxAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between">
                    <span className="font-semibold text-dark-gray">Total:</span>
                    <span className="font-bold text-xl text-azure">
                      {invoice.currency} {invoice.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-medium text-green-600">
                      {invoice.currency} {(invoice.amountPaid || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-700">Balance Due:</span>
                    <span className="font-bold text-lg text-yellow-600">
                      {invoice.currency} {(invoice.balance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Notes and Terms */}
          {(invoice.notes || invoice.terms) && (
            <Card className="p-6 space-y-4">
              {invoice.notes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Terms & Conditions</h4>
                  <p className="text-sm text-gray-600">{invoice.terms}</p>
                </div>
              )}
            </Card>
          )}

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-dark-gray mb-4">Payment History</h3>
              <div className="space-y-3">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-dark-gray">
                        {invoice.currency} {payment.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        <DateTimeDisplay date={payment.date} /> • {payment.paymentMethod}
                        {payment.reference && ` • Ref: ${payment.reference}`}
                      </p>
                      {payment.notes && <p className="text-xs text-gray-500 mt-1">{payment.notes}</p>}
                    </div>
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - Actions & Info */}
        <div className="space-y-4">
          {/* Quick Actions */}
          {(invoice.balance || 0) > 0 && invoice.status !== 'Cancelled' && invoice.status !== 'Draft' && (
            <Card className="p-4">
              <h4 className="font-semibold text-dark-gray mb-3">Record Payment</h4>
              {!showPaymentForm ? (
                <Button
                  variant="success"
                  className="w-full"
                  onClick={() => setShowPaymentForm(true)}
                >
                  <DollarSignIcon className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              ) : (
                <form onSubmit={handleRecordPayment} className="space-y-3">
                  <Input
                    label="Amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    max={invoice.balance || 0}
                    required
                  />
                  <Select
                    label="Payment Method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    options={[
                      { value: 'M-Pesa', label: 'M-Pesa' },
                      { value: 'Bank Transfer', label: 'Bank Transfer' },
                      { value: 'Cash', label: 'Cash' },
                      { value: 'Cheque', label: 'Cheque' },
                      { value: 'Other', label: 'Other' },
                    ]}
                  />
                  <Input
                    label="Reference (Optional)"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Transaction ID, Cheque #, etc."
                  />
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Payment notes (optional)"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure"
                  />
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => setShowPaymentForm(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" variant="success" size="sm" className="flex-1">
                      Record
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          )}

          {/* Invoice Info */}
          <Card className="p-4">
            <h4 className="font-semibold text-dark-gray mb-3">Invoice Information</h4>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Created By</p>
                <p className="font-medium text-dark-gray">
                  {typeof invoice.createdBy === 'string'
                    ? invoice.createdBy
                    : invoice.createdBy?.firstName && invoice.createdBy?.lastName
                      ? `${invoice.createdBy.firstName} ${invoice.createdBy.lastName}`
                      : invoice.createdBy?.email || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Created At</p>
                <DateTimeDisplay date={invoice.createdAt} showTime />
              </div>
              {invoice.sentAt && (
                <div>
                  <p className="text-gray-600">Sent At</p>
                  <DateTimeDisplay date={invoice.sentAt} showTime />
                </div>
              )}
              {invoice.paidAt && (
                <div>
                  <p className="text-gray-600">Paid At</p>
                  <DateTimeDisplay date={invoice.paidAt} showTime />
                </div>
              )}
              {invoice.eventName && (
                <div>
                  <p className="text-gray-600">Linked Event</p>
                  <p className="font-medium text-dark-gray">{invoice.eventName}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Status Management */}
          <Card className="p-4">
            <h4 className="font-semibold text-dark-gray mb-3">Actions</h4>
            <div className="space-y-3">
              {/* Edit Status */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">Change Status</label>
                <Select
                  value={invoice.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full text-sm"
                  options={[
                    { value: 'Draft', label: 'Draft' },
                    { value: 'Sent', label: 'Sent' },
                    { value: 'Partially Paid', label: 'Partially Paid' },
                    { value: 'Paid', label: 'Paid' },
                    { value: 'Overdue', label: 'Overdue' },
                    { value: 'Cancelled', label: 'Cancelled' }
                  ]}
                />
              </div>

              {invoice.status !== 'Cancelled' && (
                <div className="space-y-3">
                  {invoice.status === 'Draft' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => handleStatusChange('Sent')}
                    >
                      <SendIcon className="w-4 h-4 mr-2" />
                      Mark as Sent
                    </Button>
                  )}
                  {invoice.status !== 'Draft' && (invoice.balance || 0) === 0 && (
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-900">Fully Paid</p>
                    </div>
                  )}
                  {(invoice.amountPaid || 0) === 0 && (
                    <Button
                      variant="danger"
                      size="sm"
                      className="w-full"
                      onClick={() => onDeleteInvoice(invoice.id)}
                    >
                      <XCircleIcon className="w-4 h-4 mr-2" />
                      Delete Invoice
                    </Button>
                  )}
                  {(invoice.amountPaid || 0) === 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this invoice?')) {
                          handleStatusChange('Cancelled');
                        }
                      }}
                    >
                      <XCircleIcon className="w-4 h-4 mr-2" />
                      Cancel Invoice
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
