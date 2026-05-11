import { useState, useMemo } from 'react';
import { Card } from '../../../components/ui/Card';
import { LineChart } from '../../../components/charts/LineChart';
import { BarChart } from '../../../components/charts/BarChart';
import { DonutChart } from '../../../components/charts/DonutChart';

import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { ExportButton } from '../../../components/ui/ExportButton';
import { exportToCSV, exportToPDF, exportToExcel } from '../../../utils/exportUtils';
import { Event, Expense, Payment, Wallet, Request } from '../../../types';

// Helper function to format currency with commas
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

interface AnalyticsProps {
  events: Event[];
  expenses: Expense[];
  wallets: Wallet[];
  payments: Payment[];
  requests?: Request[];
}

export function Analytics({ events, expenses, payments, wallets = [], requests = [] }: AnalyticsProps) {
  // Normalize wallets prop
  const walletsArray = Array.isArray(wallets) ? wallets : (wallets as any)?.data || [];

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  // Filter expenses based on date range
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      if (startDate && new Date(exp.startDate) < new Date(startDate)) return false;
      if (endDate && new Date(exp.startDate) > new Date(endDate)) return false;
      return true;
    });
  }, [expenses, startDate, endDate]);

  // Filter events based on type and client
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (eventTypeFilter !== 'all' && event.type !== eventTypeFilter) return false;
      if (clientFilter !== 'all' && event.client !== clientFilter) return false;
      return true;
    });
  }, [events, eventTypeFilter, clientFilter]);

  // Calculate KPIs
  const operationalExpenses = useMemo(() => {
    return filteredExpenses
      .filter(exp => !exp.eventId) // Expenses not linked to events are operational
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredExpenses]);

  const eventExpenses = useMemo(() => {
    return filteredExpenses
      .filter(exp => exp.eventId) // Expenses linked to events
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredExpenses]);

  const totalExpenses = operationalExpenses + eventExpenses;

  const totalBudget = useMemo(() => {
    return filteredEvents.reduce((sum, event) => sum + event.budget, 0);
  }, [filteredEvents]);

  const totalEventSpent = useMemo(() => {
    return filteredEvents.reduce((sum, event) => sum + event.spent, 0);
  }, [filteredEvents]);

  const budgetUtilization = totalBudget > 0 ? Math.round((totalEventSpent / totalBudget) * 100) : 0;

  // Approval metrics
  const approvalMetrics = useMemo(() => {
    const pending = requests.filter(r => r.status === 'Pending').length;
    const approved = requests.filter(r => r.status === 'Approved').length;
    const rejected = requests.filter(r => r.status === 'Rejected').length;
    const pendingAmount = requests
      .filter(r => r.status === 'Pending')
      .reduce((sum, r) => sum + (r.amount || 0), 0);
    return { pending, approved, rejected, pendingAmount };
  }, [requests]);

  // Wallet analytics - MOVED BEFORE businessMetrics to fix dependency order
  const walletMetrics = useMemo(() => {
    const totalBalance = walletsArray.reduce((sum, w) => sum + (w.balance || 0), 0);
    const totalAllocated = expenses
      .filter(e => e.walletId && e.status === 'Approved')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    return {
      totalBalance,
      totalAllocated,
      available: totalBalance - totalAllocated
    };
  }, [walletsArray, expenses]);

  // Business Performance Metrics
  const businessMetrics = useMemo(() => {
    // Monthly burn rate (average monthly expenses)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyExpenses: number[] = [];

    for (let i = 0; i < 3; i++) { // Last 3 months
      const monthToCheck = currentMonth - i;
      const monthExpenses = filteredExpenses.filter(exp => {
        const expDate = new Date(exp.startDate);
        return expDate.getMonth() === monthToCheck && expDate.getFullYear() === currentYear;
      }).reduce((sum, exp) => sum + exp.amount, 0);
      monthlyExpenses.push(monthExpenses);
    }

    const avgMonthlyBurnRate = monthlyExpenses.length > 0
      ? monthlyExpenses.reduce((a, b) => a + b, 0) / monthlyExpenses.length
      : 0;

    // Budget variance (actual vs planned)
    const budgetVariance = totalBudget > 0 ? ((totalBudget - totalEventSpent) / totalBudget) * 100 : 0;

    // Cashflow runway (months of operations possible with current balance)
    const cashflowRunway = avgMonthlyBurnRate > 0
      ? walletMetrics.available / avgMonthlyBurnRate
      : 0;

    // Expense to budget ratio
    const expenseToBudgetRatio = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

    return {
      avgMonthlyBurnRate,
      budgetVariance,
      cashflowRunway,
      expenseToBudgetRatio
    };
  }, [filteredExpenses, totalBudget, totalEventSpent, totalExpenses, walletMetrics]);

  // Supplier payment analytics
  const pendingSupplierPayments = useMemo(() => {
    const pendingRequests = requests.filter(r =>
      r.status === 'Approved' &&
      r.assignedToSupplier === true &&
      r.supplierId
    );
    const pendingExpenses = expenses.filter(e =>
      e.status === 'Approved' &&
      e.supplierId &&
      !e.walletId
    );
    const totalAmount = pendingRequests.reduce((sum, r) => sum + (r.amount || 0), 0) +
                        pendingExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    return {
      count: pendingRequests.length + pendingExpenses.length,
      amount: totalAmount
    };
  }, [requests, expenses]);

  // Payment status breakdown
  const paymentStatusBreakdown = useMemo(() => {
    const completed = payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + (p.amount || 0), 0);
    const pending = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (p.amount || 0), 0);
    const failed = payments.filter(p => p.status === 'Failed').reduce((sum, p) => sum + (p.amount || 0), 0);

    return [
      { name: 'Completed', value: completed },
      { name: 'Pending', value: pending },
      { name: 'Failed', value: failed }
    ].filter(item => item.value > 0);
  }, [payments]);

  // Monthly expense trend
  const monthlyExpenseTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const data: any[] = [];

    months.forEach((month, idx) => {
      const monthNum = idx + 1;
      const monthExpenses = filteredExpenses.filter(exp => {
        const expDate = new Date(exp.startDate);
        return expDate.getFullYear() === currentYear && expDate.getMonth() === idx;
      });

      const opsSum = monthExpenses
        .filter(exp => !exp.eventId)
        .reduce((sum, exp) => sum + exp.amount, 0);

      const eventSum = monthExpenses
        .filter(exp => exp.eventId)
        .reduce((sum, exp) => sum + exp.amount, 0);

      data.push({ month, ops: opsSum, events: eventSum });
    });

    return data;
  }, [filteredExpenses]);

  // Expense category breakdown
  const categoryBreakdown = useMemo(() => {
    const categories: { [key: string]: number } = {
      'Transport': 0,
      'Manpower': 0,
      'Venue/Production': 0,
      'Marketing': 0,
      'Admin': 0,
      'Misc.': 0
    };

    filteredExpenses.forEach(exp => {
      const category = exp.category || 'Misc.';
      if (Object.prototype.hasOwnProperty.call(categories, category)) {
        categories[category] += exp.amount;
      } else {
        categories['Misc.'] += exp.amount;
      }
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  // Event-wise cost breakdown
  const eventCostBreakdown = useMemo(() => {
    return filteredEvents.map(event => {
      const eventExpenses = filteredExpenses.filter(exp => exp.eventId === event.id);
      
      const categoryTotals: { [key: string]: number } = {
        venue: 0,
        manpower: 0,
        transport: 0,
        marketing: 0,
        misc: 0
      };

      eventExpenses.forEach(exp => {
        const category = (exp.category || 'misc').toLowerCase();
        if (Object.prototype.hasOwnProperty.call(categoryTotals, category)) {
          categoryTotals[category] += exp.amount;
        } else {
          categoryTotals['misc'] += exp.amount;
        }
      });

      return {
        event: event.name,
        venue: categoryTotals['venue/production'] || categoryTotals['venue'] || 0,
        manpower: categoryTotals['manpower'] || 0,
        transport: categoryTotals['transport'] || 0,
        marketing: categoryTotals['marketing'] || 0,
        misc: categoryTotals['misc'] || 0
      };
    });
  }, [filteredEvents, filteredExpenses]);

  // Budget vs Actual Spend
  const budgetVsActual = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const data: any[] = [];

    months.forEach((month, idx) => {
      const monthEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.getFullYear() === currentYear && eventDate.getMonth() === idx;
      });

      const budgetSum = monthEvents.reduce((sum, event) => sum + event.budget, 0);
      const actualSum = monthEvents.reduce((sum, event) => sum + event.spent, 0);

      data.push({ month, budget: budgetSum, actual: actualSum });
    });

    return data;
  }, [filteredEvents]);

  // Expense by Event Type breakdown
  const expenseByEventType = useMemo(() => {
    const eventExpenseTotal = filteredExpenses
      .filter(exp => exp.eventId && events.find(e => e.id === exp.eventId && e.type === 'Event'))
      .reduce((sum, exp) => sum + exp.amount, 0);

    const activationExpenseTotal = filteredExpenses
      .filter(exp => exp.eventId && events.find(e => e.id === exp.eventId && e.type === 'Activation'))
      .reduce((sum, exp) => sum + exp.amount, 0);

    const operationExpenseTotal = filteredExpenses
      .filter(exp => !exp.eventId)
      .reduce((sum, exp) => sum + exp.amount, 0);

    return [
      { name: 'Events', value: eventExpenseTotal },
      { name: 'Activations', value: activationExpenseTotal },
      { name: 'Operations', value: operationExpenseTotal }
    ].filter(item => item.value > 0);
  }, [filteredExpenses, events]);

  // Get unique clients for filter
  const uniqueClients = useMemo(() => {
    const clients = events.map(e => e.client).filter(Boolean);
    return [...new Set(clients)];
  }, [events]);

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    const exportData = monthlyExpenseTrend;
    switch (format) {
      case 'csv':
        exportToCSV(exportData, 'analytics');
        break;
      case 'pdf':
        exportToPDF(exportData, 'analytics', 'Analytics Report');
        break;
      case 'excel':
        exportToExcel(exportData, 'analytics');
        break;
    }
  };
  return <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-dark-gray">Analytics</h1>
        <p className="text-gray-600 mt-1">Financial insights and reporting</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input type="datetime-local" label="Start Date & Time" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <Input type="datetime-local" label="End Date & Time" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <Select label="Event Type" options={[
            { value: 'all', label: 'All Types' },
            { value: 'Project', label: 'Project' },
            { value: 'Activation', label: 'Activation' },
            { value: 'Operation', label: 'Operation' }
          ]} value={eventTypeFilter} onChange={e => setEventTypeFilter(e.target.value)} />
          <Select label="Client" options={[
            { value: 'all', label: 'All Clients' },
            ...uniqueClients.map(client => ({ value: client, label: client }))
          ]} value={clientFilter} onChange={e => setClientFilter(e.target.value)} />
          <div className="flex items-end">
            <ExportButton onExport={handleExport} />
          </div>
        </div>
      </Card>

      {/* Business Performance Section */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <h3 className="text-lg font-semibold text-dark-gray mb-4">Business Health Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-gray-600 mb-1">Monthly Burn Rate</p>
            <p className="text-xl font-bold text-orange-600">{formatCurrency(businessMetrics.avgMonthlyBurnRate)}</p>
            <p className="text-xs text-gray-500 mt-1">Avg last 3 months</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Budget Variance</p>
            <p className={`text-xl font-bold ${businessMetrics.budgetVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {businessMetrics.budgetVariance.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {businessMetrics.budgetVariance >= 0 ? 'Under budget' : 'Over budget'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Cashflow Runway</p>
            <p className={`text-xl font-bold ${businessMetrics.cashflowRunway >= 3 ? 'text-green-600' : businessMetrics.cashflowRunway >= 1 ? 'text-orange-600' : 'text-red-600'}`}>
              {businessMetrics.cashflowRunway.toFixed(1)} months
            </p>
            <p className="text-xs text-gray-500 mt-1">At current burn rate</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Expense Efficiency</p>
            <p className={`text-xl font-bold ${businessMetrics.expenseToBudgetRatio <= 100 ? 'text-green-600' : 'text-red-600'}`}>
              {businessMetrics.expenseToBudgetRatio.toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Expense to budget ratio</p>
          </div>
        </div>
      </Card>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-gray-600 text-sm mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-dark-gray">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Ops: {formatCurrency(operationalExpenses)}<br />
            Events: {formatCurrency(eventExpenses)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-gray-600 text-sm mb-1">Budget Utilization</p>
          <p className="text-3xl font-bold text-dark-gray">{budgetUtilization}%</p>
          <p className="text-xs text-gray-500 mt-1">
            Spent: {formatCurrency(totalEventSpent)}<br />
            Budget: {formatCurrency(totalBudget)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-gray-600 text-sm mb-1">Pending Approvals</p>
          <p className="text-2xl font-bold text-orange-600">{approvalMetrics.pending}</p>
          <p className="text-xs text-gray-500 mt-1">
            Amount: {formatCurrency(approvalMetrics.pendingAmount)}<br />
            Approved: {approvalMetrics.approved} | Rejected: {approvalMetrics.rejected}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-gray-600 text-sm mb-1">Total Wallet Balance</p>
          <p className="text-2xl font-bold text-azure">{formatCurrency(walletMetrics.totalBalance)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Allocated: {formatCurrency(walletMetrics.totalAllocated)}<br />
            Available: {formatCurrency(walletMetrics.available)}
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Line Graph: Monthly Expense Trend */}
        <Card className="p-6">
          <h3 className="font-semibold text-dark-gray mb-4">Monthly Expense Trend (Ops + Events)</h3>
          {monthlyExpenseTrend.length > 0 ? (
            <LineChart
              data={monthlyExpenseTrend}
              xKey="month"
              yKeys={[
                { key: 'ops', label: 'Operational Expenses', color: '#3b82f6' },
                { key: 'events', label: 'Event/Activation Expenses', color: '#f59e42' }
              ]}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>

        {/* 2. Pie Chart: Expense Category Breakdown */}
        <Card className="p-6">
          <h3 className="font-semibold text-dark-gray mb-4">Expense Distribution by Category</h3>
          {categoryBreakdown.some(c => c.value > 0) ? (
            <DonutChart
              data={categoryBreakdown}
              nameKey="name"
              valueKey="value"
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>

        {/* Expense by Event Type Breakdown */}
        <Card className="p-6">
          <h3 className="font-semibold text-dark-gray mb-4">Expenses by Type</h3>
          {expenseByEventType.length > 0 ? (
            <DonutChart
              data={expenseByEventType}
              nameKey="name"
              valueKey="value"
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No expense data available</p>
          )}
        </Card>

        {/* Wallet Balance Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold text-dark-gray mb-4">Wallet Balance Distribution</h3>
          {walletsArray.length > 0 ? (
            <DonutChart
              data={walletsArray.map(w => ({ name: w.name, value: w.balance || 0 }))}
              nameKey="name"
              valueKey="value"
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No wallet data available</p>
          )}
        </Card>
      </div>

      {/* 3. Stacked Bar Graph: Event-wise Cost Breakdown (Stacked) */}
      <Card className="p-6">
        <h3 className="font-semibold text-dark-gray mb-4">Event-wise Expense Breakdown</h3>
        {eventCostBreakdown.length > 0 ? (
          <BarChart
            data={eventCostBreakdown}
            xKey="event"
            yKeys={[
              { key: 'venue', label: 'Venue', color: '#6366f1' },
              { key: 'manpower', label: 'Manpower', color: '#f59e42' },
              { key: 'transport', label: 'Transport', color: '#3b82f6' },
              { key: 'marketing', label: 'Marketing', color: '#10b981' },
              { key: 'misc', label: 'Misc.', color: '#f43f5e' }
            ]}
            stacked
          />
        ) : (
          <p className="text-gray-500 text-center py-8">No events with expenses</p>
        )}
      </Card>

      {/* 4. Second Line Graph: Budget vs Actual Spend */}
      <Card className="p-6">
        <h3 className="font-semibold text-dark-gray mb-4">Budget vs Actual Spend</h3>
        {budgetVsActual.length > 0 && budgetVsActual.some(b => b.budget > 0 || b.actual > 0) ? (
          <LineChart
            data={budgetVsActual}
            xKey="month"
            yKeys={[
              { key: 'budget', label: 'Budgeted Amount', color: '#6366f1' },
              { key: 'actual', label: 'Actual Amount', color: '#f59e42' }
            ]}
          />
        ) : (
          <p className="text-gray-500 text-center py-8">No data available</p>
        )}
      </Card>
    </div>;
}
