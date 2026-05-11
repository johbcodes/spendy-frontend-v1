import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, Column } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Payment, Expense, Request, User, Wallet } from '../../../types';
import { SearchIcon, FilterIcon, CreditCardIcon, DollarSignIcon, CheckCircleIcon, ClockIcon, PlusIcon } from 'lucide-react';
import { exportToCSV, exportToPDF, exportToExcel } from '../../../utils/exportUtils';
import { ExportButton } from '../../../components/ui/ExportButton';
import { DateTimeDisplay } from '../../../utils/dateFormatter.tsx';
import { calculateTotalWithFee } from '../../../utils/transactionFees';

interface PaymentsProps {
  onOpenModal: (modal: string, data?: any) => void;
  onNavigate?: (page: string, id?: string) => void;
  payments?: Payment[];
  expenses?: Expense[];
  requests?: Request[];
  approvals?: Request[];
  wallets?: Wallet[];
  currentUser: User;
  onPayExpense?: (expenseId: string, walletId: string) => Promise<void>;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}
export function Payments({
  onOpenModal,
  onNavigate,
  payments = [],
  expenses = [],
  requests = [],
  approvals = [],
  wallets = [],
  currentUser,
  onPayExpense,
  showToast
}: PaymentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // For staff users, filter to show only their own expenses/payments
  const isStaff = currentUser.role === 'Staff';
  const userFullName = `${currentUser.firstName} ${currentUser.lastName}`;

  // Combine payments and approved expenses for display
  const approvedExpenses = expenses.filter(expense => {
    const isApproved = expense.status === 'Approved' &&
                      !payments.some(payment => payment.expenseId === expense.id);

    // For staff users, only show their own expenses
    if (isStaff) {
      return isApproved && expense.createdBy === userFullName;
    }

    return isApproved;
  });

  // Convert approved expenses to payment-like objects for consistent display
  const pendingPaymentsFromApprovals = approvedExpenses.map(expense => {
    // Check if this is a batch expense
    const isBatchExpense = expense.expenseRequestType === 'batch' ||
                         (expense.batchCategories && expense.batchCategories.length > 0) ||
                         (expense.expenses && expense.expenses.length > 0) ||
                         (expense.csvData && expense.csvData.length > 0);

    let recipientCount = 0;
    if (isBatchExpense) {
      // Count recipients from all sources
      if (expense.batchCategories) {
        expense.batchCategories.forEach(category => {
          recipientCount += category.items.length;
        });
      }
      if (expense.expenses) {
        recipientCount += expense.expenses.length;
      }
      if (expense.csvData) {
        recipientCount += expense.csvData.length;
      }
    }

    return {
      id: expense.id,
      eventId: expense.eventId,
      eventName: expense.eventName,
      expenseId: expense.id,
      initiatedBy: expense.createdBy,
      recipient: isBatchExpense ? `Batch Expense (${recipientCount} recipients)` : expense.title,
      amount: expense.totalAmount || expense.amount,
      mpesaCode: undefined,
      type: 'M-Pesa' as const,
      status: 'Pending' as const,
      dateTime: expense.startDate || new Date().toISOString(),
      description: `Approved expense: ${expense.title}`,
      isFromApproval: true,
      isBatchPayment: isBatchExpense,
      batchRecipientCount: recipientCount
    };
  });

  // Filter actual payments for staff users
  const filteredActualPayments = isStaff
    ? payments.filter(payment => payment.initiatedBy === userFullName)
    : payments;

  // Combine real payments with pending payments from approvals
  const allPayments = [...filteredActualPayments, ...pendingPaymentsFromApprovals];

  // Identify batch payments in the existing payments array
  const updatedPayments = allPayments.map(payment => {
    // Check if this payment is related to a batch expense
    if (payment.expenseId) {
      const expense = expenses.find(e => e.id === payment.expenseId);
      if (expense) {
        const isBatchExpense = expense.expenseRequestType === 'batch' ||
                             (expense.batchCategories && expense.batchCategories.length > 0) ||
                             (expense.expenses && expense.expenses.length > 0) ||
                             (expense.csvData && expense.csvData.length > 0);

        if (isBatchExpense) {
          let recipientCount = 0;
          if (expense.batchCategories) {
            expense.batchCategories.forEach(category => {
              recipientCount += category.items.length;
            });
          }
          if (expense.expenses) {
            recipientCount += expense.expenses.length;
          }
          if (expense.csvData) {
            recipientCount += expense.csvData.length;
          }

          return {
            ...payment,
            isBatchPayment: true,
            batchRecipientCount: recipientCount,
            recipient: payment.recipient.includes('Batch') ? payment.recipient : `Batch Payment (${recipientCount} recipients)`
          };
        }
      }
    }
    return payment;
  });

  // Filter combined payments based on status and search
  const filteredPayments = updatedPayments.filter(payment => {
    const matchesStatus = statusFilter === 'all' || payment.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      payment.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.initiatedBy.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Failed':
        return 'danger';
      default:
        return 'default';
    }
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    const exportData = filteredPayments.map(p => ({
      'Initiated By': p.initiatedBy,
      Recipient: p.recipient,
      Amount: p.amount,
      'M-Pesa Code': p.mpesaCode || 'N/A',
      Type: p.type,
      Status: p.status,
      'Date Time': p.dateTime
    }));
    switch (format) {
      case 'csv':
        exportToCSV(exportData, 'payments');
        break;
      case 'pdf':
        exportToPDF(exportData, 'payments', 'Payments Report');
        break;
      case 'excel':
        exportToExcel(exportData, 'payments');
        break;
    }
  };

  const isAdmin = currentUser?.role === 'Admin';

  const columns: Column<any>[] = [{
    key: 'initiatedBy',
    label: 'Initiated By'
  }, {
    key: 'recipient',
    label: 'Recipient',
    render: payment => (
      <div>
        <span>{payment.recipient}</span>
        {payment.isBatchPayment && payment.batchRecipientCount > 0 && (
          <Badge variant="info" className="ml-2 text-xs">
            {payment.batchRecipientCount} recipients
          </Badge>
        )}
      </div>
    )
  }, {
    key: 'amount',
    label: 'Amount',
    sortable: true,
    render: payment => `KES ${payment.amount.toLocaleString()}`
  }, ...(isAdmin ? [{
    key: 'transactionFee',
    label: 'Transaction Fee',
    render: payment => {
      const feeInfo = calculateTotalWithFee(payment.amount, payment.type);
      return (
        <span className={feeInfo.isExternal ? 'text-orange-600' : 'text-green-600'}>
          {feeInfo.isExternal ? `KES ${feeInfo.fee.toLocaleString()}` : 'Free'}
        </span>
      );
    }
  }, {
    key: 'totalAmount',
    label: 'Total Amount',
    render: payment => {
      const feeInfo = calculateTotalWithFee(payment.amount, payment.type);
      return (
        <span className="font-semibold">
          KES {feeInfo.total.toLocaleString()}
        </span>
      );
    }
  }] : []), {
    key: 'mpesaCode',
    label: 'M-Pesa Code'
  }, {
    key: 'dateTime',
    label: 'Date & Time',
    sortable: true,
    render: payment => <DateTimeDisplay dateTime={payment.dateTime} />
  }, {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: payment => <Badge variant={getStatusVariant(payment.status)}>
          {payment.status}
        </Badge>
      }, {
    key: 'actions',
    label: 'Actions',
    render: payment => {
      // Staff users: Show Pay button for their approved expenses (pending payments from approvals)
      if (payment.status === 'Pending' && isStaff && payment.isFromApproval && payment.expenseId) {
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={async () => {
              // Find staff wallet
              const staffWallet = wallets.find(w => w.type === 'USER' && w.ownerId === currentUser.id);

              if (!staffWallet) {
                showToast?.('Wallet not found. Please contact admin.', 'error');
                return;
              }

              // Check if staff has sufficient balance
              if (staffWallet.balance < payment.amount) {
                showToast?.('Insufficient balance in your wallet.', 'error');
                return;
              }

              // Confirm payment
              if (!confirm(`Pay KES ${payment.amount.toLocaleString()} for "${payment.recipient}"?`)) {
                return;
              }

              // Call backend API to pay expense
              if (onPayExpense) {
                try {
                  await onPayExpense(payment.expenseId, staffWallet.id);
                  showToast?.('Payment successful!', 'success');
                } catch (error) {
                  console.error('Payment failed:', error);
                  showToast?.('Payment failed. Please try again.', 'error');
                }
              }
            }}
          >
            Pay
          </Button>
        );
      }

      // For non-staff or already completed payments
      return (
        <Button
          variant="primary"
          size="sm"
          className={payment.status === 'Pending' ? "" : "!bg-azure !text-white !shadow-none hover:!bg-azure/90"}
          onClick={() => {
            // Handle action based on payment status
            if (payment.status === 'Pending') {
              // Admin/non-staff: navigate to make payment page
              if (payment.expenseId) {
                const expense = expenses.find(e => e.id === payment.expenseId);
                if (expense) {
                  onNavigate?.('make-payment-page', expense.id);
                } else {
                  onNavigate?.('make-payment-page');
                }
              } else {
                onNavigate?.('make-payment-page');
              }
            } else if (payment.status === 'Completed') {
              onNavigate?.('payment-details-readonly', payment.id);
            }
          }}
        >
          {payment.status === 'Pending' ? 'Pay' : 'View'}
        </Button>
      );
    }
  }];

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const completedCount = filteredPayments.filter(p => p.status === 'Completed').length;
  const pendingCount = filteredPayments.filter(p => p.status === 'Pending').length;
  const cancelledCount = filteredPayments.filter(p => p.status === 'Failed').length;

  // Calculate amounts for each status
  const completedAmount = filteredPayments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = filteredPayments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
  const cancelledAmount = filteredPayments.filter(p => p.status === 'Failed').reduce((sum, p) => sum + p.amount, 0);

  // Calculate total transaction fees (only for external payments)
  const totalTransactionFees = filteredPayments.reduce((sum, p) => {
    const feeInfo = calculateTotalWithFee(p.amount, p.type);
    return sum + feeInfo.fee;
  }, 0);

  // Calculate total with fees
  const totalWithFees = totalAmount + totalTransactionFees;


  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-dark-gray">My Payments</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">View and manage your disbursements</p>
        </div>
        <div className="hidden md:flex gap-3">
          <Button variant="primary" onClick={() => onOpenModal(isStaff ? 'add-expense' : 'make-payment')}>
            <PlusIcon className="w-4 h-4 mr-2" />
            {isStaff ? 'Request Payment' : 'Make Payment'}
          </Button>
        </div>
      </div>

      {/* Stats Cards - Compact for Mobile */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <Card className="p-3 md:p-5">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <div className="p-1.5 md:p-2 bg-primary bg-opacity-10 rounded-lg">
              <CreditCardIcon className="w-4 h-4 md:w-6 md:h-6 text-azure" />
            </div>
            <Badge variant="primary" className="text-xs">{filteredPayments.length}</Badge>
          </div>
          <p className="text-gray-600 text-xs md:text-sm mb-1">Total</p>
          <p className="text-lg md:text-3xl font-bold text-dark-gray">KES {totalAmount.toLocaleString()}</p>
        </Card>
      </div>

      {/* Summary Section */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          icon={<CheckCircleIcon className="w-5 h-5 text-success" />} 
          label="Completed" 
          count={completedCount} 
          amount={completedAmount} 
          variant="success"
        />
        <SummaryCard 
          icon={<ClockIcon className="w-5 h-5 text-warning" />} 
          label="Pending" 
          count={pendingCount} 
          amount={pendingAmount} 
          variant="warning"
        />
        <SummaryCard 
          icon={<DollarSignIcon className="w-5 h-5 text-error" />} 
          label="Failed" 
          count={cancelledCount} 
          amount={cancelledAmount} 
          variant="danger"
        />
        {isAdmin && (
          <SummaryCard 
            icon={<DollarSignIcon className="w-5 h-5 text-orange-600" />} 
            label="Transaction Fees" 
            count={filteredPayments.filter(p => calculateTotalWithFee(p.amount, p.type).isExternal).length} 
            amount={totalTransactionFees} 
            variant="default"
          />
        )}
      </div>

      {/* Tabs Section */}
      <div className="bg-white p-1.5 rounded-2xl inline-flex gap-1 shadow-sm border border-gray-100 overflow-x-auto max-w-full">
        {[
          ['all', 'All', filteredPayments.length],
          ['completed', 'Completed', filteredPayments.filter(p => p.status === 'Completed').length],
          ['pending', 'Pending', filteredPayments.filter(p => p.status === 'Pending').length],
          ['failed', 'Failed', filteredPayments.filter(p => p.status === 'Failed').length],
        ].map(([value, label, count]) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value as any)}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 flex items-center gap-2 whitespace-nowrap uppercase tracking-wider ${
              statusFilter === value 
                ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            {label}
            <span className={`px-2 py-0.5 rounded-lg text-[10px] ${
              statusFilter === value ? 'bg-black/10 text-black' : 'bg-gray-100 text-gray-500'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search payments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
              <FilterIcon className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {showFilters && <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <Select label="Event" options={[{
            value: 'all',
            label: 'All Events'
          }, {
            value: '1',
            label: 'Product Launch 2025'
          }]} />
              <Select label="Status" options={[{
            value: 'all',
            label: 'All Statuses'
          }, {
            value: 'completed',
            label: 'Completed'
          }, {
            value: 'pending',
            label: 'Pending'
          }]} />
              <Select label="Type" options={[{
            value: 'all',
            label: 'All Types'
          }, {
            value: 'mpesa',
            label: 'M-Pesa'
          }, {
            value: 'wallet',
            label: 'Wallet Transfer'
          }]} />
              <Input type="datetime-local" label="Date & Time" />
            </div>}
        </div>
      </Card>

        {/* Payments Table */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-gray">All Payments</h3>
          <ExportButton onExport={handleExport} />
        </div>
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCardIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">You haven't made any payments yet</h3>
            <p className="text-sm md:text-base text-gray-600 mb-6 px-4">
              Your payment transactions will show up here once you start making disbursements.
            </p>
            <Button variant="primary" onClick={() => onOpenModal('make-payment')} size="sm" className="md:text-base">
              <PlusIcon className="w-4 h-4 mr-2" />
              Make My First Payment
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table
                columns={columns}
                data={filteredPayments}
                defaultSortKey="dateTime"
              />
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredPayments.map((payment) => (
                <Card key={payment.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-dark-gray text-sm">{payment.recipient}</p>
                        {payment.isBatchPayment && payment.batchRecipientCount > 0 && (
                          <Badge variant="info" className="text-xs">
                            {payment.batchRecipientCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{payment.eventName}</p>
                    </div>
                    <Badge variant={getStatusVariant(payment.status)} className="text-xs">
                      {payment.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Amount</p>
                      <p className="font-bold text-dark-gray">KES {payment.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Date & Time</p>
                      <DateTimeDisplay dateTime={payment.dateTime} className="text-xs" />
                    </div>
                  </div>

                  {payment.mpesaCode && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600">M-Pesa Code</p>
                      <p className="text-sm font-mono text-dark-gray">{payment.mpesaCode}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 flex-1">By {payment.initiatedBy}</p>
                    <Button
                      variant="primary"
                      size="xs"
                      className="!bg-azure !text-white !shadow-none hover:!bg-azure/90"
                      onClick={() => {
                        if (payment.status === 'Pending') {
                          if (payment.isFromApproval) {
                            const expense = expenses.find(e => e.id === payment.expenseId);
                            if (expense) {
                              onNavigate?.('make-payment-page', expense.id);
                            }
                          } else if (payment.expenseId) {
                            const expense = expenses.find(e => e.id === payment.expenseId);
                            if (expense) {
                              onNavigate?.('make-payment-page', expense.id);
                            } else {
                              onNavigate?.('make-payment-page');
                            }
                          } else {
                            onNavigate?.('make-payment-page');
                          }
                        } else if (payment.status === 'Completed') {
                          onNavigate?.('payment-details-readonly', payment.id);
                        }
                      }}
                    >
                      {payment.status === 'Pending' ? 'Pay Now' : 'View Details'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-6 right-4 z-50">
        <button
          onClick={() => onOpenModal('make-payment')}
          className="flex items-center gap-2 bg-azure text-white px-5 py-3 rounded-full shadow-lg hover:bg-azure/90 transition-all active:scale-95 border border-white/10"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="font-semibold">Make Payment</span>
        </button>
      </div>
    </div>
  );
}

