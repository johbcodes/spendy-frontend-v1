import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Tabs } from '../../../components/ui/Tabs';
import { Badge } from '../../../components/ui/Badge';
import { Table, Column } from '../../../components/ui/Table';
import { Select } from '../../../components/ui/Select';
import { User, Event, Expense, Request, Payment, Wallet, InventoryItem, Invoice } from '../../../types';
import { CalendarIcon, UserIcon, MapPinIcon, Trash2Icon, BuildingIcon, PlusIcon, LinkIcon, ActivityIcon, TrendingUpIcon, TrendingDownIcon, DollarSignIcon } from 'lucide-react';
import { DateTimeDisplay } from '../../../utils/dateFormatter';
import { calculateEventProfitLoss, formatCurrency, getProfitLossColor } from '../../../utils/profitLoss';

interface EventDetailProps {
  event: Event;
  expenses?: Expense[];
  requests?: Request[];
  payments?: Payment[];
  wallets?: Wallet[];
  inventory?: InventoryItem[];
  invoices?: Invoice[];
  activityLog?: Array<{ id: string; action: string; user: string; timestamp: string; details?: string }>;
  onNavigate: (page: string, id?: string) => void;
  onOpenModal: (modal: string, data?: any) => void;
  onArchiveEvent?: (eventId: string) => void;
  onUpdateEventStatus?: (eventId: string, newStatus: string) => Promise<void>;
  currentUser: User;
}

export function EventDetail({
  event,
  expenses = [],
  requests = [],
  payments = [],
  wallets = [],
  inventory = [],
  invoices = [],
  activityLog = [],
  onNavigate,
  onOpenModal,
  onArchiveEvent,
  onUpdateEventStatus,
  currentUser
}: EventDetailProps) {
  // Normalize props to ensure they are arrays
  const walletsArray = Array.isArray(wallets) ? wallets : (wallets as any)?.data || [];
  const invoicesArray = Array.isArray(invoices) ? invoices : (invoices as any)?.data || [];
  const expensesArray = Array.isArray(expenses) ? expenses : [];
  const paymentsArray = Array.isArray(payments) ? payments : [];
  const requestsArray = Array.isArray(requests) ? requests : [];
  const inventoryArray = Array.isArray(inventory) ? inventory : [];
  const activityLogArray = Array.isArray(activityLog) ? activityLog : [];

  const canModifyEvents = currentUser.role === 'Admin' ||
    currentUser.modulesAssigned.includes('Events') ||
    currentUser.modulesAssigned.includes('All');

  // Filter data for this specific event
  const eventExpenses = expensesArray.filter(e => e.eventId === event.id);
  const eventRequests = requestsArray.filter(r => r.type === event.type);
  const eventPayments = paymentsArray.filter(p => p.eventId === event.id);
  const eventWallets = walletsArray.filter(w => w.linkedEvent === event.id);
  const eventInventory = inventoryArray.filter(i => i.category === event.category);
  const eventActivityLog = activityLogArray.filter(log => log.action.includes(event.name) || log.action.includes(event.id));

  // Calculate totals
  const totalExpenses = eventExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalWalletBalance = eventWallets.reduce((sum, w) => sum + w.balance, 0);

  const budgetPercentage = totalExpenses / event.budget * 100;
  const isOverBudget = totalExpenses > event.budget;

  // Calculate Profit & Loss
  const profitLoss = calculateEventProfitLoss(event.id, event.name, invoicesArray, expensesArray);

  // Expense Columns
  const expenseColumns: Column<Expense>[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true
    },
    {
      key: 'category',
      label: 'Category'
    },
    {
      key: 'amount',
      label: 'Amount',
      render: item => `KES ${item.amount.toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Status',
      render: item => <Badge variant={item.status === 'Approved' ? 'success' : item.status === 'Pending' ? 'warning' : 'danger'}>
            {item.status}
          </Badge>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: item => <Button variant="secondary" size="xs" onClick={() => onNavigate('expense-detail', item.id)}>
            View
          </Button>
    }
  ];

  // Request Columns
  const requestColumns: Column<Request>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true
    },
    {
      key: 'category',
      label: 'Category'
    },
    {
      key: 'amount',
      label: 'Amount',
      render: item => `KES ${item.amount.toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Status',
      render: item => <Badge variant={item.status === 'Approved' ? 'success' : item.status === 'Pending' ? 'warning' : 'danger'}>
            {item.status}
          </Badge>
    },
    {
      key: 'requestedBy',
      label: 'Requested By'
    }
  ];

  // Payment Columns
  const paymentColumns: Column<Payment>[] = [
    {
      key: 'recipient',
      label: 'Recipient',
      sortable: true
    },
    {
      key: 'amount',
      label: 'Amount',
      render: item => `KES ${item.amount.toLocaleString()}`
    },
    {
      key: 'type',
      label: 'Type'
    },
    {
      key: 'status',
      label: 'Status',
      render: item => <Badge variant={item.status === 'Completed' ? 'success' : item.status === 'Pending' ? 'warning' : 'danger'}>
            {item.status}
          </Badge>
    },
    {
      key: 'dateTime',
      label: 'Date',
      render: item => <DateTimeDisplay dateTime={item.dateTime} />
    }
  ];

  // Wallet Columns
  const walletColumns: Column<Wallet>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true
    },
    {
      key: 'type',
      label: 'Type'
    },
    {
      key: 'balance',
      label: 'Balance',
      render: item => `KES ${item.balance.toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Status',
      render: item => <Badge variant={item.status === 'Active' ? 'success' : 'danger'}>
            {item.status}
          </Badge>
    }
  ];

  // Inventory Columns
  const inventoryColumns: Column<InventoryItem>[] = [
    {
      key: 'name',
      label: 'Item',
      sortable: true
    },
    {
      key: 'quantity',
      label: 'Quantity'
    },
    {
      key: 'totalCost',
      label: 'Total Cost',
      render: item => `KES ${item.totalCost.toLocaleString()}`
    },
    {
      key: 'condition',
      label: 'Condition',
      render: item => <Badge variant={item.condition === 'Excellent' ? 'success' : item.condition === 'Good' ? 'default' : 'warning'}>
            {item.condition}
          </Badge>
    }
  ];
  // Tabs Configuration
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: <div className="space-y-6">
            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-dark-gray mb-4">Budget Overview</h3>
                <div className="flex mb-2 items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-azure">
                    {budgetPercentage.toFixed(0)}% Used
                  </span>
                  {isOverBudget && <Badge variant="danger">Over Budget</Badge>}
                </div>
                <div className="overflow-hidden h-2 mb-4 rounded bg-gray-200">
                  <div 
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                    className={`h-2 rounded ${isOverBudget ? 'bg-red-600' : 'bg-primary'}`}
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spent:</span>
                    <span className="font-semibold">KES {totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-semibold">KES {event.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining:</span>
                    <span className={`font-semibold ${(event.budget - totalExpenses) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      KES {(event.budget - totalExpenses).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-dark-gray mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Total Expenses</span>
                    <span className="font-semibold text-lg">{eventExpenses.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Pending Requests</span>
                    <span className="font-semibold text-lg">{eventRequests.filter(r => r.status === 'Pending').length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Payments Made</span>
                    <span className="font-semibold text-lg">{eventPayments.length}</span>
                  </div>
                </div>
              </Card>

              {/* Brands */}
              {event.brands && event.brands.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-sm font-semibold text-dark-gray mb-4">Associated Brands</h3>
                  <div className="space-y-2">
                    {event.brands.map((brand, idx) => (
                      <Badge key={idx} variant="default" className="inline-block mr-2 mb-2">
                        {brand}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
    },
    {
      id: 'expenses',
      label: 'Expenses',
      content: <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-dark-gray">All Expenses ({eventExpenses.length})</h3>
              <Button variant="primary" size="sm" onClick={() => onOpenModal('add-expense')}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
            {eventExpenses.length > 0 ? (
              <Table columns={expenseColumns} data={eventExpenses} />
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500 mb-4">No expenses added yet</p>
                <Button variant="primary" onClick={() => onOpenModal('add-expense')}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add First Expense
                </Button>
              </Card>
            )}
          </div>
    },
    {
      id: 'requests',
      label: 'Requests',
      content: <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-dark-gray">Payment Requests ({eventRequests.length})</h3>
              <Button variant="primary" size="sm" onClick={() => onOpenModal('request-payment')}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Request Payment
              </Button>
            </div>
            {eventRequests.length > 0 ? (
              <Table columns={requestColumns} data={eventRequests} />
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500 mb-4">No payment requests yet</p>
                <Button variant="primary" onClick={() => onOpenModal('request-payment')}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Request Payment
                </Button>
              </Card>
            )}
          </div>
    },
    {
      id: 'payments',
      label: 'Payments',
      content: <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-dark-gray">Payment Transactions ({eventPayments.length})</h3>
              <Button variant="primary" size="sm" onClick={() => onOpenModal('make-payment')}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Make Payment
              </Button>
            </div>
            {eventPayments.length > 0 ? (
              <Table columns={paymentColumns} data={eventPayments} />
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500 mb-4">No payments made yet</p>
                <Button variant="primary" onClick={() => onOpenModal('make-payment')}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Make Payment
                </Button>
              </Card>
            )}
          </div>
    },
    {
      id: 'inventory',
      label: 'Inventory',
      content: <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-dark-gray">Allocated Inventory ({eventInventory.length})</h3>
              <Button variant="primary" size="sm" onClick={() => onOpenModal('allocate-inventory')}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Allocate Inventory
              </Button>
            </div>
            {eventInventory.length > 0 ? (
              <Table columns={inventoryColumns} data={eventInventory} />
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500 mb-4">No inventory allocated</p>
                <Button variant="primary" onClick={() => onOpenModal('allocate-inventory')}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Allocate Inventory
                </Button>
              </Card>
            )}
          </div>
    },
    {
      id: 'documents',
      label: 'Documents',
      content: <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-dark-gray">Documents ({event.documents?.length || 0})</h3>
              <Button variant="primary" size="sm" onClick={() => onNavigate('upload-document-page', event.id)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
            {event.documents && event.documents.length > 0 ? (
              <div className="space-y-2">
                {event.documents.map((doc, idx) => (
                  <Card key={idx} className="p-4 flex justify-between items-center">
                    <span className="text-sm font-medium">{doc}</span>
                    <Button variant="secondary" size="xs">Download</Button>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No documents uploaded</p>
              </Card>
            )}
          </div>
    },
    {
      id: 'wallets',
      label: 'Wallets',
      content: <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-dark-gray mb-1">Event Wallets ({eventWallets.length})</h3>
                <p className="text-sm text-gray-600">Total Balance: KES {totalWalletBalance.toLocaleString()}</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => onOpenModal('connect-wallet', event)}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
            {eventWallets.length > 0 ? (
              <Table columns={walletColumns} data={eventWallets} />
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500 mb-4">No wallets connected to this event</p>
                <Button variant="primary" onClick={() => onOpenModal('connect-wallet', event)}>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </Card>
            )}
          </div>
    },
    {
      id: 'activity',
      label: 'Activity Log',
      content: <div className="space-y-3">
            {eventActivityLog && eventActivityLog.length > 0 ? (
              eventActivityLog.map((activity) => (
                <Card key={activity.id} className="p-4 border-l-4 border-primary">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-dark-gray flex items-center gap-2">
                        <ActivityIcon className="w-4 h-4" />
                        {activity.action}
                      </p>
                      {activity.details && (
                        <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        by {activity.user} • <DateTimeDisplay dateTime={activity.timestamp} />
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No activity recorded for this event</p>
              </Card>
            )}
          </div>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold text-dark-gray">{event.name}</h1>
            {canModifyEvents && onUpdateEventStatus ? (
              <div className="min-w-[160px]">
                <select
                  value={event.status}
                  onChange={(e) => onUpdateEventStatus(event.id, e.target.value)}
                  className="px-3 py-1.5 text-sm font-medium border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure transition-all"
                  style={{
                    borderColor:
                      event.status === 'Planning' ? '#3b82f6' :
                      event.status === 'In Progress' ? '#f59e0b' :
                      event.status === 'Completed' ? '#10b981' :
                      event.status === 'Archived' ? '#6b7280' :
                      '#9ca3af',
                    color:
                      event.status === 'Planning' ? '#3b82f6' :
                      event.status === 'In Progress' ? '#f59e0b' :
                      event.status === 'Completed' ? '#10b981' :
                      event.status === 'Archived' ? '#6b7280' :
                      '#4b5563'
                  }}
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            ) : (
              <Badge variant={
                event.status === 'Planning' ? 'info' :
                event.status === 'In Progress' ? 'warning' :
                event.status === 'Completed' ? 'success' :
                'default'
              }>{event.status}</Badge>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mt-4">
            <div className="flex items-center space-x-2">
              <BuildingIcon className="w-4 h-4" />
              <span className="font-medium">{event.client}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4" />
              <div className="flex items-center gap-1">
                <DateTimeDisplay dateTime={event.startDate} />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4" />
              <span>{event.projectLead ? `${event.projectLead.firstName} ${event.projectLead.lastName}` : 'Not assigned'}</span>
            </div>
            {event.location && (
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canModifyEvents && (
            <>
              {event.status !== 'Archived' && (
                <Button variant="secondary" size="sm" onClick={() => onNavigate('edit-event', event.id)}>
                  Edit Event
                </Button>
              )}
              {onArchiveEvent && event.status !== 'Archived' && (
                <Button variant="warning" size="sm" onClick={() => onArchiveEvent(event.id)}>
                  <Trash2Icon className="w-4 h-4 mr-2" />
                  Archive
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Event Info Card */}
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-gray-600 mb-1">Type</p>
            <p className="text-sm font-semibold">{event.type}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Category</p>
            <p className="text-sm font-semibold">{event.category}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Budget</p>
            <p className="text-sm font-semibold">KES {event.budget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Project Lead</p>
            <p className="text-sm font-semibold">{event.projectLead ? `${event.projectLead.firstName} ${event.projectLead.lastName}` : 'Not assigned'}</p>
          </div>
        </div>
      </Card>

      {/* Profit & Loss Card */}
      {profitLoss.invoiceCount > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-gray">Profit & Loss Statement</h3>
            <Badge variant={profitLoss.isProfit ? 'success' : 'danger'}>
              {profitLoss.isProfit ? 'Profitable' : 'Loss'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Revenue Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUpIcon className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-700">Revenue</h4>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Revenue (Invoices)</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(profitLoss.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {profitLoss.invoiceCount} invoice{profitLoss.invoiceCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Paid</p>
                <p className="text-sm font-semibold text-green-700">
                  {formatCurrency(profitLoss.paidRevenue)}
                </p>
                <p className="text-xs text-gray-500">
                  {profitLoss.paidInvoiceCount} invoice{profitLoss.paidInvoiceCount !== 1 ? 's' : ''} paid
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Pending</p>
                <p className="text-sm font-semibold text-yellow-600">
                  {formatCurrency(profitLoss.pendingRevenue)}
                </p>
              </div>
            </div>

            {/* Expenses Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <TrendingDownIcon className="w-5 h-5 text-red-600" />
                </div>
                <h4 className="font-semibold text-gray-700">Expenses</h4>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(profitLoss.totalExpenses)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {profitLoss.expenseCount} expense{profitLoss.expenseCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Approved</p>
                <p className="text-sm font-semibold text-red-700">
                  {formatCurrency(profitLoss.approvedExpenses)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Pending</p>
                <p className="text-sm font-semibold text-yellow-600">
                  {formatCurrency(profitLoss.pendingExpenses)}
                </p>
              </div>
            </div>

            {/* Profit/Loss Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${profitLoss.isProfit ? 'bg-blue-50' : 'bg-red-50'}`}>
                  <DollarSignIcon className={`w-5 h-5 ${profitLoss.isProfit ? 'text-blue-600' : 'text-red-600'}`} />
                </div>
                <h4 className="font-semibold text-gray-700">Summary</h4>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Gross Profit/Loss</p>
                <p className={`text-2xl font-bold ${profitLoss.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitLoss.grossProfit >= 0 ? '+' : ''}{formatCurrency(profitLoss.grossProfit)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Margin: {profitLoss.grossProfitMargin.toFixed(1)}%
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Net Profit/Loss</p>
                <p className={`text-sm font-semibold ${profitLoss.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {profitLoss.netProfit >= 0 ? '+' : ''}{formatCurrency(profitLoss.netProfit)}
                </p>
                <p className="text-xs text-gray-500">Paid revenue - Approved expenses</p>
              </div>
              <div className={`p-3 rounded-lg ${profitLoss.isProfit ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-xs text-gray-600 mb-1">Status</p>
                <p className={`text-sm font-semibold ${profitLoss.isProfit ? 'text-green-700' : 'text-red-700'}`}>
                  {profitLoss.isProfit ? 'Event is Profitable' : 'Event is at a Loss'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} />
    </div>
  );
}
