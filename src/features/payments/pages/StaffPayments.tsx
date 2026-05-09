import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, Column } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Payment, Expense, Request, User, Wallet } from '../../../types';
import { SearchIcon, FilterIcon, CreditCardIcon, DollarSignIcon, CheckCircleIcon, ClockIcon, PlusIcon } from 'lucide-react';
import { DateTimeDisplay } from '../../../utils/dateFormatter.tsx';

interface StaffPaymentsProps {
  onOpenModal: (modal: string, data?: any) => void;
  onNavigate?: (page: string, id?: string) => void;
  payments?: Payment[];
  expenses?: Expense[];
  requests?: Request[];
  approvals?: Request[];
  wallets?: Wallet[];
  currentUser: User;
  onPayExpense?: (expenseId: string, walletId: string) => Promise<void>;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function StaffPayments({
  onOpenModal,
  onNavigate,
  payments = [],
  expenses = [],
  requests = [],
  approvals = [],
  wallets = [],
  currentUser: _currentUser
}: StaffPaymentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Combine payments and approved expenses for display
  const approvedExpenses = expenses.filter(expense =>
    expense.status === 'Approved' &&
    !payments.some(payment => payment.expenseId === expense.id)
  );

  // Convert approved expenses to payment-like objects for consistent display
  const pendingPaymentsFromApprovals = approvedExpenses.map(expense => ({
    id: expense.id,
    eventId: expense.eventId,
    eventName: expense.eventName,
    expenseId: expense.id,
    initiatedBy: expense.createdBy,
    recipient: expense.title,
    amount: expense.amount,
    mpesaCode: undefined,
    type: 'M-Pesa' as const,
    status: 'Pending' as const,
    dateTime: expense.startDate || new Date().toISOString(),
    description: `Approved expense: ${expense.title}`,
    isFromApproval: true
  }));

  // Combine real payments with pending payments from approvals
  const allPayments = [...payments, ...pendingPaymentsFromApprovals];

  // Filter combined payments based on status and search
  const filteredPayments = allPayments.filter(payment => {
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

  const columns: Column<Payment>[] = [{
    key: 'eventName',
    label: 'Event',
    sortable: true
  }, {
    key: 'initiatedBy',
    label: 'Initiated By'
  }, {
    key: 'recipient',
    label: 'Recipient'
  }, {
    key: 'amount',
    label: 'Amount',
    render: payment => `KES ${payment.amount.toLocaleString()}`
  }, {
    key: 'mpesaCode',
    label: 'M-Pesa Code'
  }, {
    key: 'type',
    label: 'Type'
  }, {
    key: 'status',
    label: 'Status',
    render: payment => <Badge variant={getStatusVariant(payment.status)}>
      {payment.status}
    </Badge>
  }, {
    key: 'dateTime',
    label: 'Date & Time',
    sortable: true,
    render: payment => <DateTimeDisplay dateTime={payment.dateTime} />
  }];

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const completedCount = filteredPayments.filter(p => p.status === 'Completed').length;
  const pendingCount = filteredPayments.filter(p => p.status === 'Pending').length;
  const cancelledCount = filteredPayments.filter(p => p.status === 'Failed').length;

  // Calculate amounts for each status
  const completedAmount = filteredPayments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = filteredPayments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
  const cancelledAmount = filteredPayments.filter(p => p.status === 'Failed').reduce((sum, p) => sum + p.amount, 0);

  return <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">Payments</h1>
          <p className="text-gray-600 mt-1">Make and track payment transactions</p>
        </div>
        <Button variant="primary" onClick={() => onOpenModal('make-payment')}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Make Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
              <CreditCardIcon className="w-6 h-6 text-azure" />
            </div>
            <Badge variant="primary">{filteredPayments.length}</Badge>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Amount</p>
          <p className="text-3xl font-bold text-dark-gray">KES {totalAmount.toLocaleString()}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <Badge variant="success">{completedCount}</Badge>
          </div>
          <p className="text-gray-600 text-sm mb-1">Completed</p>
          <p className="text-3xl font-bold text-dark-gray">KES {completedAmount.toLocaleString()}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <Badge variant="warning">{pendingCount}</Badge>
          </div>
          <p className="text-gray-600 text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold text-dark-gray">KES {pendingAmount.toLocaleString()}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <DollarSignIcon className="w-6 h-6 text-red-600" />
            </div>
            <Badge variant="danger">{cancelledCount}</Badge>
          </div>
          <p className="text-gray-600 text-sm mb-1">Cancelled</p>
          <p className="text-3xl font-bold text-dark-gray">KES {cancelledAmount.toLocaleString()}</p>
        </Card>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          All Payments
        </Button>
        <Button
          variant={statusFilter === 'completed' ? 'success' : 'secondary'}
          size="sm"
          onClick={() => setStatusFilter('completed')}
        >
          <CheckCircleIcon className="w-4 h-4" />
          Completed
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'warning' : 'secondary'}
          size="sm"
          onClick={() => setStatusFilter('pending')}
        >
          <ClockIcon className="w-4 h-4" />
          Pending
        </Button>
        <Button
          variant={statusFilter === 'failed' ? 'danger' : 'secondary'}
          size="sm"
          onClick={() => setStatusFilter('failed')}
        >
          Cancelled
        </Button>
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
        </div>
        <Table
          columns={columns}
          data={filteredPayments}
          onRowClick={(row: Payment) => {
            // Handle row click based on payment status
            if (row.status === 'Pending') {
              // For pending payments, navigate to expense detail page (read-only view)
              // Check if this is an approved expense (not yet paid)
              if ('isFromApproval' in row && row.isFromApproval) {
                // Find the original expense
                const expense = expenses.find(e => e.id === row.expenseId);
                if (expense) {
                  // Navigate to expense detail to view expense information
                  onNavigate?.('expense-detail', expense.id);
                }
              } else {
                // For existing pending payments, navigate to expense detail
                onNavigate?.('expense-detail', row.expenseId || row.id);
              }
            } else if (row.status === 'Completed') {
              // For completed payments, navigate to read-only payment details page
              onNavigate?.('payment-details-readonly', row.id);
            }
          }}
        />
      </Card>
    </div>;
}
