import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Invoice, User } from '../types';
import { PlusIcon, SearchIcon, FileTextIcon, DollarSignIcon, AlertCircleIcon, CheckCircleIcon, FilterIcon, EyeIcon, DownloadIcon, CopyIcon, CheckIcon, XIcon, RefreshCwIcon } from 'lucide-react';
import { DateTimeDisplay } from '../utils/dateFormatter';
import { generateInvoicePDF } from '../utils/invoicePDF';

interface QuotationsProps {
  invoices: Invoice[];
  onNavigate: (page: string, id?: string) => void;
  onOpenModal: (modal: string, data?: any) => void;
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
}

export function Quotations({ invoices, onNavigate, onOpenModal, currentUser, onDuplicateInvoice, onApproveInvoice, onRejectInvoice, onConvertQuote, companyLogo, companyName, companyPhone, companyOfficialEmail, companyOfficeAddress }: QuotationsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Draft' | 'Pending Approval' | 'Sent' | 'Paid' | 'Overdue'>('all');

  // Filter to only show quotes
  const quotes = invoices.filter(invoice => invoice.documentType === 'Quote');

  // Further filter by search and status
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch =
      quote.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalQuotes = quotes.length;
  const draftQuotes = quotes.filter(i => i.status === 'Draft').length;
  const sentQuotes = quotes.filter(i => i.status === 'Sent').length;
  const acceptedQuotes = quotes.filter(i => i.status === 'Paid').length;
  const convertedQuotes = quotes.filter(i => i.convertedTo).length;

  const totalValue = quotes.reduce((sum, i) => sum + i.total, 0);

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
      case 'Draft':
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">Quotations</h1>
          <p className="text-gray-600 mt-1">Manage and track your quotes</p>
        </div>
        <Button onClick={() => onOpenModal('add-invoice')}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Quote
        </Button>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-azure bg-opacity-10 rounded-lg">
              <FileTextIcon className="w-6 h-6 text-azure" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Quotes</p>
          <p className="text-3xl font-bold text-dark-gray">{totalQuotes}</p>
          <p className="text-xs text-gray-500 mt-1">
            {draftQuotes} drafts
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSignIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Value</p>
          <p className="text-3xl font-bold text-blue-600">{totalQuotes}</p>
          <p className="text-xs text-gray-500 mt-1">
            KES {totalValue.toLocaleString()}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertCircleIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Sent Quotes</p>
          <p className="text-3xl font-bold text-yellow-600">{sentQuotes}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <RefreshCwIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Converted</p>
          <p className="text-3xl font-bold text-green-600">{convertedQuotes}</p>
          <p className="text-xs text-gray-500 mt-1">
            {acceptedQuotes} accepted
          </p>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by quote number or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const statuses: Array<'all' | 'Draft' | 'Pending Approval' | 'Sent' | 'Paid' | 'Overdue'> = ['all', 'Draft', 'Pending Approval', 'Sent', 'Paid', 'Overdue'];
              const currentIndex = statuses.indexOf(filterStatus);
              const nextIndex = (currentIndex + 1) % statuses.length;
              setFilterStatus(statuses[nextIndex]);
            }}
          >
            <FilterIcon className="w-4 h-4 mr-2" />
            {filterStatus === 'all' ? 'All Status' : filterStatus}
          </Button>
        </div>
      </Card>

      {/* Quotes Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-gray">All Quotes</h3>
          <p className="text-sm text-gray-500">{filteredQuotes.length} quote{filteredQuotes.length !== 1 ? 's' : ''}</p>
        </div>

        {filteredQuotes.length === 0 ? (
          <div className="text-center py-12">
            <FileTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No quotes found</p>
            <p className="text-sm text-gray-400">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Create your first quote to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Quote #</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Client</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Issue Date</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Valid Until</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Converted</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">
                      <p className="font-medium text-sm text-dark-gray">{quote.invoiceNumber}</p>
                      {quote.eventName && (
                        <p className="text-xs text-gray-500">{quote.eventName}</p>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <p className="text-sm text-dark-gray">{quote.clientName}</p>
                      <p className="text-xs text-gray-500">{quote.clientEmail}</p>
                    </td>
                    <td className="py-3 px-2">
                      <DateTimeDisplay dateTime={quote.issueDate} />
                    </td>
                    <td className="py-3 px-2">
                      <DateTimeDisplay dateTime={quote.dueDate} />
                    </td>
                    <td className="py-3 px-2 text-right">
                      <p className="font-semibold text-sm text-dark-gray">
                        {quote.currency} {quote.total.toLocaleString()}
                      </p>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Badge variant={getStatusVariant(quote.status)}>
                        {quote.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-center">
                      {quote.convertedTo ? (
                        <Badge variant="success">Yes</Badge>
                      ) : (
                        <Badge variant="default">No</Badge>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end gap-1">
                        {/* Show Approve/Reject for Pending Approval (Admin only) */}
                        {quote.status === 'Pending Approval' && currentUser?.role === 'Admin' && (
                          <>
                            <Button
                              variant="ghost"
                              size="xs"
                              title="Approve Quote"
                              onClick={() => onApproveInvoice(quote.id)}
                            >
                              <CheckIcon className="w-3 h-3 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              title="Reject Quote"
                              onClick={() => onRejectInvoice(quote.id)}
                            >
                              <XIcon className="w-3 h-3 text-red-600" />
                            </Button>
                          </>
                        )}

                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => onNavigate('invoice-detail', quote.id)}
                        >
                          <EyeIcon className="w-3 h-3" />
                          View
                        </Button>

                        {/* Duplicate button */}
                        <Button
                          variant="ghost"
                          size="xs"
                          title="Duplicate Quote"
                          onClick={() => onDuplicateInvoice(quote.id)}
                        >
                          <CopyIcon className="w-3 h-3 text-azure" />
                        </Button>

                        {/* Convert button - only if not already converted */}
                        {!quote.convertedTo && (
                          <Button
                            variant="ghost"
                            size="xs"
                            title="Convert to Invoice/Proforma"
                            onClick={() => {
                              const target = window.confirm('Convert to Invoice? Click OK for Invoice, Cancel for Proforma') ? 'Invoice' : 'Proforma';
                              onConvertQuote(quote.id, target);
                            }}
                          >
                            <RefreshCwIcon className="w-3 h-3 text-green-600" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="xs"
                          title="Download PDF"
                          onClick={() => generateInvoicePDF(quote, companyLogo, companyName, companyPhone, companyOfficialEmail, companyOfficeAddress)}
                        >
                          <DownloadIcon className="w-3 h-3 text-azure" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
