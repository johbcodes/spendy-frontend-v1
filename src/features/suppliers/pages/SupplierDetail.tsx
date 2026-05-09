import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Supplier, Request, Expense } from '../../../types';
import { ArrowLeftIcon, CreditCardIcon, DollarSignIcon, FileIcon, ClockIcon } from 'lucide-react';
import { DateTimeDisplay } from '../../../utils/dateFormatter';

interface SupplierDetailProps {
  supplier: Supplier | null;
  requests?: Request[];
  expenses?: Expense[];
  onNavigate: (page: string, id?: string, params?: Record<string, any>) => void;
  onPaySupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
  onPayPendingExpense?: (requestId: string) => void;
}

export function SupplierDetail({ supplier, requests = [], expenses = [], onNavigate, onPaySupplier, onDeleteSupplier, onPayPendingExpense }: SupplierDetailProps) {
  if (!supplier) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => onNavigate('suppliers')}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Suppliers
        </Button>
        <Card className="p-8 text-center">
          <p className="text-gray-500">Supplier not found</p>
        </Card>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${supplier.name}? This action cannot be undone.`)) {
      onDeleteSupplier(supplier.id);
      onNavigate('suppliers');
    }
  };

  // Find pending payments assigned to this supplier
  console.log('🔍 [SupplierDetail] Filtering for supplier:', supplier.name);
  console.log('🔍 [SupplierDetail] Total requests:', requests.length);
  console.log('🔍 [SupplierDetail] Total expenses:', expenses.length);

  const pendingSupplierRequests = requests.filter(r => {
    const matches = r.supplier === supplier.name &&
      r.status === 'Approved' &&
      r.assignedToSupplier === true;
    if (r.supplier === supplier.name) {
      console.log('🔍 [SupplierDetail] Request matches supplier:', {
        name: r.name,
        supplier: r.supplier,
        status: r.status,
        assignedToSupplier: r.assignedToSupplier,
        matches
      });
    }
    return matches;
  });

  const pendingSupplierExpenses = expenses.filter(e => {
    const matches = e.supplier === supplier.name &&
      e.status === 'Approved' &&
      !e.walletId;
    if (e.supplier === supplier.name) {
      console.log('🔍 [SupplierDetail] Expense matches supplier:', {
        title: e.title,
        supplier: e.supplier,
        status: e.status,
        walletId: e.walletId,
        matches
      });
    }
    return matches;
  });

  console.log('🔍 [SupplierDetail] Pending requests found:', pendingSupplierRequests.length);
  console.log('🔍 [SupplierDetail] Pending expenses found:', pendingSupplierExpenses.length);

  const totalPendingAmount = pendingSupplierRequests.reduce((sum, r) => sum + r.amount, 0) +
                             pendingSupplierExpenses.reduce((sum, e) => sum + e.amount, 0);

  const totalAmount = Array.isArray(supplier.servicesProvided)
    ? supplier.servicesProvided.reduce((sum, s) => sum + (s.amount || 0), 0)
    : supplier.amount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('suppliers')} className="p-0">
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-dark-gray">{supplier.name}</h1>
            <p className="text-gray-600 mt-1">{supplier.category}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="success" onClick={() => onPaySupplier(supplier)}>
            <CreditCardIcon className="w-4 h-4 mr-2" />
            Pay Supplier
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Supplier Payments - Top Section for Easy Access */}
          <Card className="p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-dark-gray flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-orange-500" />
                Pending Payments
              </h2>
              {totalPendingAmount > 0 && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Pending</p>
                    <p className="text-xl font-bold text-orange-600">KES {totalPendingAmount.toLocaleString()}</p>
                  </div>
                  <Badge variant="warning">
                    {pendingSupplierRequests.length + pendingSupplierExpenses.length}
                  </Badge>
                </div>
              )}
            </div>

            {totalPendingAmount > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-2 text-xs font-semibold text-gray-600 uppercase">Description</th>
                      <th className="pb-2 text-xs font-semibold text-gray-600 uppercase">Event</th>
                      <th className="pb-2 text-xs font-semibold text-gray-600 uppercase text-right">Amount</th>
                      <th className="pb-2 text-xs font-semibold text-gray-600 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingSupplierRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-orange-50 transition-colors">
                        <td className="py-3">
                          <p className="text-sm font-medium text-dark-gray">{request.name}</p>
                          <p className="text-xs text-gray-500"><DateTimeDisplay date={request.dateProcessed || request.date} /></p>
                        </td>
                        <td className="py-3">
                          <p className="text-sm text-gray-600">{request.event || '-'}</p>
                        </td>
                        <td className="py-3 text-right">
                          <p className="text-sm font-bold text-orange-600">KES {request.amount.toLocaleString()}</p>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="success"
                              size="xs"
                              onClick={() => onNavigate('pay-supplier', supplier.id, { pendingAmount: request.amount, requestId: request.id })}
                            >
                              Pay Now
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => onNavigate('request-review', request.id)}
                            >
                              Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {pendingSupplierExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-orange-50 transition-colors">
                        <td className="py-3">
                          <p className="text-sm font-medium text-dark-gray">{expense.title}</p>
                          <p className="text-xs text-gray-500"><DateTimeDisplay date={expense.startDate} /></p>
                        </td>
                        <td className="py-3">
                          <p className="text-sm text-gray-600">{expense.eventName || '-'}</p>
                        </td>
                        <td className="py-3 text-right">
                          <p className="text-sm font-bold text-orange-600">KES {expense.amount.toLocaleString()}</p>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="success"
                              size="xs"
                              onClick={() => onNavigate('pay-supplier', supplier.id, { pendingAmount: expense.amount, expenseId: expense.id })}
                            >
                              Pay Now
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => onNavigate('expense-detail', expense.id)}
                            >
                              Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No pending payments</p>
                <p className="text-xs text-gray-400 mt-1">All payments to this supplier are up to date</p>
              </div>
            )}
          </Card>

          {/* Contact Information & Payment Details */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-dark-gray mb-4">Contact Information & Payment Details</h2>

            {/* Contact Info Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Contact Person</p>
                  <p className="text-base font-medium text-dark-gray">{supplier.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="text-base font-medium text-dark-gray">{supplier.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-base font-medium text-dark-gray">{supplier.email}</p>
                </div>
                {supplier.businessType && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Business Type</p>
                    <p className="text-base font-medium text-dark-gray">{supplier.businessType}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Details Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <DollarSignIcon className="w-4 h-4" />
                Payment Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                  <Badge variant="info">{supplier.paymentMethod || 'Not specified'}</Badge>
                </div>

                {/* M-Pesa B2C */}
                {supplier.paymentMethod === 'Mpesa B2C' && (
                  <div className="bg-light-gray p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">M-Pesa Phone Number</p>
                    <p className="text-base font-medium text-dark-gray">{supplier.mpesaPhone || 'N/A'}</p>
                  </div>
                )}

                {/* Paybill B2B */}
                {supplier.paymentMethod === 'Paybill B2B' && (
                  <div className="space-y-3">
                    <div className="bg-light-gray p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Paybill Number</p>
                      <p className="text-base font-medium text-dark-gray">{supplier.paybillNumber || 'N/A'}</p>
                    </div>
                    <div className="bg-light-gray p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Account Number</p>
                      <p className="text-base font-medium text-dark-gray">{supplier.paybillAccount || 'N/A'}</p>
                    </div>
                  </div>
                )}

                {/* Till B2B */}
                {supplier.paymentMethod === 'Till B2B' && (
                  <div className="bg-light-gray p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Till Number</p>
                    <p className="text-base font-medium text-dark-gray">{supplier.tillNumber || 'N/A'}</p>
                  </div>
                )}

                {/* Bank Transfer */}
                {supplier.paymentMethod === 'Bank' && (
                  <div className="space-y-3">
                    <div className="bg-light-gray p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Bank Name</p>
                      <p className="text-base font-medium text-dark-gray">{supplier.bankName || 'N/A'}</p>
                    </div>
                    <div className="bg-light-gray p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Account Name</p>
                      <p className="text-base font-medium text-dark-gray">{supplier.accountName || 'N/A'}</p>
                    </div>
                    <div className="bg-light-gray p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Account Number</p>
                      <p className="text-base font-medium text-dark-gray">{supplier.accountNumber || 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-light-gray p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Branch Name</p>
                        <p className="text-base font-medium text-dark-gray">{supplier.branchName || 'N/A'}</p>
                      </div>
                      <div className="bg-light-gray p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">SWIFT Code</p>
                        <p className="text-base font-medium text-dark-gray">{supplier.swiftCode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Services Provided */}
          {Array.isArray(supplier.servicesProvided) && supplier.servicesProvided.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-dark-gray mb-4">Services Provided</h2>
              <div className="space-y-2">
                {supplier.servicesProvided.map((service, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-light-gray rounded-lg">
                    <p className="text-sm text-gray-900">{service.description}</p>
                    <p className="text-sm font-bold text-azure">KES {Number(service.amount).toLocaleString()}</p>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 bg-azure bg-opacity-10 rounded-lg border-t-2 border-azure mt-4">
                  <p className="text-sm font-semibold text-dark-gray">Total Typical Cost</p>
                  <p className="text-lg font-bold text-azure">KES {totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          )}

          {/* KYC Documents */}
          {supplier.documents && supplier.documents.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-dark-gray mb-4 flex items-center gap-2">
                <FileIcon className="w-5 h-5" />
                KYC Documents
              </h2>
              <div className="space-y-2">
                {supplier.documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-light-gray rounded-lg">
                    <FileIcon className="w-5 h-5 text-azure flex-shrink-0" />
                    <span className="text-sm text-gray-700 flex-1">{doc.name}</span>
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = doc.url;
                        link.download = doc.name;
                        link.click();
                      }}
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - Quick Reference */}
        <div className="space-y-6">
          {/* Quick Contact Card */}
          <Card className="p-5 bg-gradient-to-br from-azure to-blue-700">
            <h3 className="text-white font-semibold mb-4">Quick Contact</h3>
            <div className="space-y-3 text-white">
              <div>
                <p className="text-xs opacity-75 mb-1">Contact Person</p>
                <p className="font-medium">{supplier.contactPerson}</p>
              </div>
              <div className="border-t border-white border-opacity-20 pt-3">
                <p className="text-xs opacity-75 mb-1">Phone</p>
                <p className="font-medium">{supplier.phone}</p>
              </div>
              <div className="border-t border-white border-opacity-20 pt-3">
                <p className="text-xs opacity-75 mb-1">Email</p>
                <p className="font-medium text-xs break-all">{supplier.email}</p>
              </div>
            </div>
          </Card>

          {/* Affiliated Events */}
          {(() => {
            // Find all events this supplier is affiliated with
            const affiliatedEventNames = new Set<string>();

            // From supplier's own event field
            if (supplier.event) {
              affiliatedEventNames.add(supplier.event);
            }

            // From pending requests
            pendingSupplierRequests.forEach(r => {
              if (r.event) affiliatedEventNames.add(r.event);
            });

            // From pending expenses
            pendingSupplierExpenses.forEach(e => {
              if (e.event) affiliatedEventNames.add(e.event);
            });

            const affiliatedEvents = Array.from(affiliatedEventNames);

            return affiliatedEvents.length > 0 ? (
              <Card className="p-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Affiliated Events</p>
                <div className="space-y-2">
                  {affiliatedEvents.map((eventName, index) => (
                    <div key={index} className="p-2 bg-light-gray rounded-lg">
                      <p className="text-sm font-medium text-dark-gray">{eventName}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null;
          })()}

          {/* KRA Pin */}
          {supplier.kraPin && (
            <Card className="p-4 bg-light-gray">
              <p className="text-xs text-gray-600 mb-1">KRA PIN</p>
              <p className="text-sm font-medium text-dark-gray">{supplier.kraPin}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
