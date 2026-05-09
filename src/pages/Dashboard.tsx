import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LineChart } from '../components/charts/LineChart';
import { DonutChart } from '../components/charts/DonutChart';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../utils/currency';
import { CalendarIcon, WalletIcon, TrendingUpIcon, CheckCircleIcon, ClockIcon, PlusIcon, ArrowUpIcon, XIcon, TruckIcon } from 'lucide-react';
import { User, Event, Wallet, Expense, Payment, Request, Supplier } from '../types';

interface DashboardProps {
  onNavigate: (page: string, id?: string) => void;
  onOpenModal: (modal: string) => void;
  currentUser: User;
  events?: Event[];
  wallets?: Wallet[];
  expenses?: Expense[];
  payments?: Payment[];
  requests?: Request[];
  suppliers?: Supplier[];
  activityLog?: Array<{ id: string; action: string; user: string; timestamp: string; details?: string }>;
}
export function Dashboard({
  onNavigate,
  onOpenModal,
  currentUser,
  events = [],
  wallets = [],
  expenses = [],
  payments = [],
  requests = [],
  suppliers = [],
  activityLog = []
}: DashboardProps) {
  // Normalize wallets prop
  const walletsArray = Array.isArray(wallets) ? wallets : (wallets as any)?.data || [];

  const [showWelcome, setShowWelcome] = useState(true);
  const companyName = currentUser.companyName || `${currentUser.firstName} ${currentUser.lastName}`;

  // Helper to check if user has access to a module
  const hasModuleAccess = (moduleName: string): boolean => {
    if (currentUser.role === 'Admin') return true;
    return currentUser.modulesAssigned?.includes(moduleName as any) || false;
  };
  // Auto-dismiss welcome notification after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Compute dashboard data from live system data
  const activeEvents = events.filter(e => e.status === 'Planning' || e.status === 'In Progress');
  const activeEventCount = activeEvents.length;
  const totalWallets = walletsArray.length;
  const totalWalletBalance = walletsArray.reduce((sum, w) => sum + (w.balance || 0), 0);
  const totalBudget = events.reduce((sum, e) => sum + (e.budget || 0), 0);
  const totalSpent = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingApprovals = requests.filter(r => r.status === 'Pending').length;

  // Calculate pending supplier payments (approved requests assigned to suppliers)
  const pendingSupplierRequests = requests.filter(r =>
    r.status === 'Approved' &&
    r.assignedToSupplier === true &&
    r.supplierId
  );
  const pendingSupplierExpenses = expenses.filter(e =>
    e.status === 'Approved' &&
    e.supplierId &&
    !e.walletId
  );
  const totalPendingSupplierPayments =
    pendingSupplierRequests.reduce((sum, r) => sum + (r.amount || 0), 0) +
    pendingSupplierExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const pendingSupplierPaymentCount = pendingSupplierRequests.length + pendingSupplierExpenses.length;

  // Generate expense trend data from last 7 days of expenses
  const expenseTrendData = generateExpenseTrend(expenses);
  
  // Get top suppliers by profit/loss (payments received - expenses paid)
  const topSuppliersData = getTopSuppliers(payments, expenses, suppliers);
  
  // Get requests overview data
  const requestsData = [{
    name: 'Total',
    value: requests.length
  }, {
    name: 'Pending',
    value: requests.filter(r => r.status === 'Pending').length
  }, {
    name: 'Completed',
    value: requests.filter(r => r.status === 'Completed').length
  }, {
    name: 'Declined',
    value: requests.filter(r => r.status === 'Rejected').length
  }];
  
  // Get recent activity from activity log
  const recentActivity = activityLog.slice(0, 4).map(log => ({
    id: log.id,
    action: log.action,
    user: log.user,
    time: formatTimestamp(log.timestamp)
  }));
  
  // Get top events with expenses
  const eventExpenses = activeEvents.slice(0, 3).map(event => {
    const eventExpenseTotal = expenses.filter(e => e.eventId === event.id).reduce((sum, e) => sum + (e.amount || 0), 0);
    return {
      id: event.id,
      eventName: event.name,
      totalBudget: event.budget || 0,
      totalSpent: eventExpenseTotal,
      balance: (event.budget || 0) - eventExpenseTotal,
      status: event.status
    };
  });

  // Helper function to generate expense trend from last 7 days
  function generateExpenseTrend(expenses: Expense[]) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const trendData: Array<{ day: string; amount: number }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.startDate || new Date());
        return expenseDate >= dayStart && expenseDate <= dayEnd;
      });
      const amount = dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      trendData.push({ day: dayName, amount });
    }

    return trendData;
  }

  // Helper function to get top suppliers by profit/loss
  function getTopSuppliers(payments: Payment[], expenses: Expense[], suppliers: Supplier[]) {
    const supplierPnL: Record<string, { payments: number; expenses: number; profitLoss: number }> = {};

    // Track payments received from suppliers (revenue)
    payments.forEach(payment => {
      const key = payment.recipient || 'Unknown';
      if (!supplierPnL[key]) {
        supplierPnL[key] = { payments: 0, expenses: 0, profitLoss: 0 };
      }
      supplierPnL[key].payments += payment.amount || 0;
    });

    // Track expenses paid to suppliers (costs)
    expenses.forEach(expense => {
      const key = expense.supplier || 'Unknown';
      if (!supplierPnL[key]) {
        supplierPnL[key] = { payments: 0, expenses: 0, profitLoss: 0 };
      }
      supplierPnL[key].expenses += expense.amount || 0;
    });

    // Calculate profit/loss for each supplier
    Object.keys(supplierPnL).forEach(key => {
      supplierPnL[key].profitLoss = supplierPnL[key].payments - supplierPnL[key].expenses;
    });

    return Object.entries(supplierPnL)
      .sort((a, b) => Math.abs(b[1].profitLoss) - Math.abs(a[1].profitLoss)) // Sort by absolute P&L
      .slice(0, 5)
      .map(([name, data]) => ({
        name,
        profitLoss: data.profitLoss,
        payments: data.payments,
        expenses: data.expenses
      }))
      .filter(item => item.payments > 0 || item.expenses > 0);
  }

  // Helper function to format timestamp to relative time
  function formatTimestamp(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    // Convert to Nairobi timezone (UTC+3)
    const nairobiTime = new Date(date.getTime() + (3 * 60 * 60 * 1000));

    // Format date as dd-mm-yyyy (standard format)
    const day = nairobiTime.getDate().toString().padStart(2, '0');
    const month = (nairobiTime.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const year = nairobiTime.getFullYear();

    return `${day}-${month}-${year}`;
  }

  return <div className="space-y-6">
      {/* Welcome Alert - Auto-dismisses after 5 seconds */}
      {showWelcome && <div className="bg-azure bg-opacity-10 border border-azure rounded-lg p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm hover:shadow-md hover:shadow-green-200/50 transition-shadow">
          <div>
            <p className="text-azure font-semibold">
              Welcome back, {companyName}!
            </p>
            <p className="text-sm text-gray-600 mt-1">
              You have {pendingApprovals} pending approvals and {activityLog.length} activities logged
            </p>
          </div>
          <button onClick={() => setShowWelcome(false)} className="text-gray-500 hover:text-azure hover:scale-110 hover:rotate-90 transition-all duration-200">
            <XIcon className="w-5 h-5" />
          </button>
        </div>}

      {/* Page Title */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <h1 className="text-2xl font-bold text-dark-gray">Admin Dashboard</h1>
        <p className="text-base text-gray-600 mt-1">
          Welcome to Spendy, {companyName}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Events Card - only show if user has Events module */}
        {hasModuleAccess('Events') && <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{animationDelay: '0ms'}}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <CalendarIcon className="w-8 h-8 text-azure" />
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" className="text-xs">+{activeEventCount}</Badge>
              <Button variant="ghost" size="xs" onClick={() => onNavigate('events')}>View →</Button>
            </div>
          </div>
          <div>
            <p className="text-gray-600 mb-2">Active Events</p>
            <p className="text-4xl font-bold text-dark-gray mb-1">{activeEventCount}</p>
            <div className="flex items-center text-green-600 text-sm">
              <ArrowUpIcon className="w-4 h-4 mr-1" />
              <span>Current period</span>
            </div>
          </div>
        </Card>}

        {/* Wallets Card - only show if user has Wallets module */}
        {hasModuleAccess('Wallets') && <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{animationDelay: '100ms'}}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-azure bg-opacity-10 rounded-xl">
              <WalletIcon className="w-8 h-8 text-azure" />
            </div>
            <Button variant="ghost" size="xs" onClick={() => onNavigate('wallets')}>
              View →
            </Button>
          </div>
          <div>
            <p className="text-gray-600 mb-2">Active Wallets</p>
            <p className="text-4xl font-bold text-dark-gray mb-1">{totalWallets}</p>
            <p className="text-sm text-gray-500">
              {formatCurrency(totalWalletBalance)} total balance
            </p>
          </div>
        </Card>}

        {/* Budget Card - only show if user has Events module */}
        {hasModuleAccess('Events') && <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{animationDelay: '200ms'}}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <TrendingUpIcon className="w-8 h-8 text-green-600" />
            </div>
            <Badge variant="success" className="text-xs">
              ↑ {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
            </Badge>
          </div>
          <div>
            <p className="text-gray-600 mb-2">Total Budget</p>
            <p className="text-4xl font-bold text-dark-gray mb-1">{formatCurrency(totalBudget)}</p>
            <p className="text-sm text-gray-500">Spent: {formatCurrency(totalSpent)}</p>
          </div>
        </Card>}

        {/* Pending Approvals Card - only show if user has Approvals module */}
        {hasModuleAccess('Approvals') && <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{animationDelay: '300ms'}}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-xl">
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <Button variant="info" size="xs" onClick={() => onNavigate('approvals')}>
              Review
            </Button>
          </div>
          <div>
            <p className="text-gray-600 mb-2">Pending Approvals</p>
            <p className="text-4xl font-bold text-dark-gray mb-1">{pendingApprovals}</p>
            <p className="text-sm text-gray-500">Requires attention</p>
          </div>
        </Card>}

        {/* Pending Supplier Payments Card - only show if user has Suppliers module and there are pending payments */}
        {hasModuleAccess('Suppliers') && pendingSupplierPaymentCount > 0 && <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{animationDelay: '400ms'}}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <TruckIcon className="w-8 h-8 text-orange-600" />
            </div>
            <Button variant="warning" size="xs" onClick={() => onNavigate('suppliers')}>
              View
            </Button>
          </div>
          <div>
            <p className="text-gray-600 mb-2">Pending Supplier Payments</p>
            <p className="text-4xl font-bold text-dark-gray mb-1">{formatCurrency(totalPendingSupplierPayments)}</p>
            <p className="text-sm text-gray-500">{pendingSupplierPaymentCount} {pendingSupplierPaymentCount === 1 ? 'payment' : 'payments'} awaiting processing</p>
          </div>
        </Card>}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-dark-gray mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {hasModuleAccess('Events') && currentUser.role === 'Admin' && <Button variant="primary" onClick={() => onOpenModal('new-event')} className="w-full">
            <PlusIcon className="w-4 h-4" />
            New Event
          </Button>}
          {hasModuleAccess('Wallets') && <Button variant="secondary" onClick={() => onOpenModal('new-wallet')} className="w-full">
            <PlusIcon className="w-4 h-4" />
            New Wallet
          </Button>}
          {hasModuleAccess('Expenses') && <Button variant="info" onClick={() => onOpenModal('add-expense')} className="w-full">
            <PlusIcon className="w-4 h-4" />
            New Expense
          </Button>}
          {hasModuleAccess('Wallets') && <Button variant="success" onClick={() => onOpenModal('fund-wallet')} className="w-full">
            <WalletIcon className="w-4 h-4" />
            Fund Wallet
          </Button>}
        </div>
      </Card>

      {/* Active Events - only show if user has Events module */}
      {hasModuleAccess('Events') && activeEvents.length > 0 && <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-gray">Active Events</h3>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('events')}>
            View All →
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeEvents.slice(0, 6).map(event => <div key={event.id} className="p-5 border-2 border-gray-200 rounded-xl hover:border-azure transition-all hover:shadow-md cursor-pointer" onClick={() => onNavigate('event-detail', event.id)}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-dark-gray text-base truncate">
                  {event.name}
                </h4>
                <Badge variant={
                  event.status === 'Planning' ? 'info' :
                  event.status === 'In Progress' ? 'warning' :
                  event.status === 'Completed' ? 'success' :
                  'default'
                }>{event.status}</Badge>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium text-dark-gray truncate ml-2">
                    {event.client || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-semibold text-azure">
                    {formatCurrency(event.budget)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium text-dark-gray">
                    {new Date(event.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-medium text-dark-gray">
                    {new Date(event.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button variant="secondary" size="xs" className="w-full" onClick={e => {
            e.stopPropagation();
            onNavigate('event-detail', event.id);
          }}>
                View Details →
              </Button>
            </div>)}
        </div>
      </Card>}

      {/* Expenses Snapshot - only show if user has Events module */}
      {hasModuleAccess('Events') && <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-gray">Expenses Snapshot</h3>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('expenses')}>
            View All →
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {eventExpenses.map(expense => <div key={expense.id} className="p-5 border-2 border-gray-200 rounded-xl hover:border-primary transition-all hover:shadow-md cursor-pointer" onClick={() => onNavigate('event-detail', expense.id)}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-dark-gray text-sm">
                  {expense.eventName}
                </h4>
                <Badge variant="success">{expense.status}</Badge>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-semibold">
                    {formatCurrency(expense.totalBudget)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Spent:</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(expense.totalSpent)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Balance:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(expense.balance)}
                  </span>
                </div>
              </div>
              <Button variant="secondary" size="xs" className="w-full" onClick={e => {
            e.stopPropagation();
            onNavigate('event-detail', expense.id);
          }}>
                View Details →
              </Button>
            </div>)}
        </div>
      </Card>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses Trend - only show if user has Expenses module */}
        {hasModuleAccess('Expenses') && <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="font-semibold text-dark-gray mb-4">
              Expenses Trend (Last 7 Days)
            </h3>
            <LineChart data={expenseTrendData} xKey="day" yKey="amount" />
          </Card>
        </div>}

        {/* Requests Overview - only show if user has Approvals module */}
        {hasModuleAccess('Approvals') && <Card className="p-6">
          <h3 className="font-semibold text-dark-gray mb-4">
            Requests Overview
          </h3>
          <DonutChart data={requestsData} nameKey="name" valueKey="value" />
        </Card>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Suppliers - only show if user has Suppliers module */}
        {hasModuleAccess('Suppliers') && <Card className="p-6">
          <h3 className="font-semibold text-dark-gray mb-4">
            Top 5 Suppliers (Profit/Loss)
          </h3>
          {topSuppliersData.length > 0 ? (
            <div className="space-y-3">
              {topSuppliersData.map((supplier, idx) => (
                <div key={idx} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-dark-gray">{supplier.name}</p>
                    <p className="text-xs text-gray-600">Payments: {formatCurrency(supplier.payments)} | Expenses: {formatCurrency(supplier.expenses)}</p>
                  </div>
                  <div className={`text-right font-semibold ${supplier.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {supplier.profitLoss >= 0 ? '+' : ''}{formatCurrency(supplier.profitLoss)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No supplier data available</p>
          )}
        </Card>}

        {/* Recent Activity - always show for all users */}
        <Card className="p-6">
          <h3 className="font-semibold text-dark-gray mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map(activity => <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="p-2 bg-light-gray rounded-lg">
                  <CheckCircleIcon className="w-4 h-4 text-azure" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-dark-gray">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    by {activity.user} • {activity.time}
                  </p>
                </div>
              </div>)}
          </div>
        </Card>
      </div>
    </div>;
}
