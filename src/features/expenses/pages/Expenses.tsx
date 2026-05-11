import { useState } from 'react';
import type React from 'react';
import { CalendarIcon, ClockIcon, FileTextIcon, FilterIcon, PlusIcon, SearchIcon, BadgeCheckIcon, ReceiptIcon } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ExportButton } from '../../../components/ui/ExportButton';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Column, Table } from '../../../components/ui/Table';
import { DateTimeDisplay } from '../../../utils/dateFormatter';
import { exportToCSV, exportToExcel, exportToPDF } from '../../../utils/exportUtils';
import { filterEventsForExpenseType, filterExpenses, getExpenseStatusVariant, summarizeExpenses } from '../rules';
import type { Event, Expense, User } from '../types';

interface ExpensesProps {
  onOpenModal: (modal: string, data?: any) => void;
  onNavigate: (page: string, id?: string) => void;
  expenses: Expense[];
  events: Event[];
  currentUser: User;
}

export function Expenses({ onOpenModal, onNavigate, expenses, events }: ExpensesProps) {
  const expensesArray = Array.isArray(expenses) ? expenses : [];
  const eventsArray = Array.isArray(events) ? events : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const selectedEventData = eventsArray.find(event => event.id === selectedEvent);
  const filteredEventOptions = filterEventsForExpenseType(eventsArray, selectedType);
  const filteredExpenses = filterExpenses(expensesArray, {
    searchTerm,
    eventId: selectedEvent,
    category: selectedCategory,
    status: selectedStatus,
    type: selectedType,
  });
  const summary = summarizeExpenses(filteredExpenses);

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    const data = filteredExpenses.map(expense => ({
      Title: expense.title,
      Event: expense.eventName,
      Category: expense.category,
      Amount: expense.amount,
      'Created By': expense.createdBy,
      Status: expense.status,
      'Start Date': expense.startDate,
    }));
    if (format === 'csv') exportToCSV(data, 'expenses');
    else if (format === 'pdf') exportToPDF(data, 'expenses', 'Expenses Report');
    else exportToExcel(data, 'expenses');
  };

  const columns: Column<Expense>[] = [
    { key: 'eventName', label: 'Event Name' },
    { key: 'category', label: 'Expense Category' },
    { key: 'client', label: 'Client' },
    { key: 'amount', label: 'Budget', render: expense => `KES ${expense.amount.toLocaleString()}` },
    { key: 'startDate', label: 'Date & Time', render: expense => <DateTimeDisplay dateTime={expense.startDate} /> },
    { key: 'status', label: 'Status', render: expense => <Badge variant={getExpenseStatusVariant(expense.status)}>{expense.status}</Badge> },
    {
      key: 'actions',
      label: 'Actions',
      render: expense => (
        <Button variant="primary" size="xs" onClick={() => onNavigate('expense-detail', expense.id)}>
          View Expense
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">Expenses</h1>
          <p className="text-gray-600 mt-1">Track and manage all event expenses</p>
        </div>
        <Button onClick={() => onOpenModal('add-expense')}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          icon={<FileTextIcon className="w-5 h-5 text-azure" />} 
          label="Total Expenses" 
          count={summary.totalCount} 
          amount={summary.totalAmount} 
          className="bg-white border-none shadow-sm"
        />
        <SummaryCard 
          icon={<ClockIcon className="w-5 h-5 text-warning" />} 
          label="Pending Approval" 
          count={summary.pendingCount} 
          amount={summary.pendingAmount} 
          variant="warning"
          className="bg-white border-none shadow-sm"
        />
        <SummaryCard 
          icon={<BadgeCheckIcon className="w-5 h-5 text-success" />} 
          label="Approved" 
          count={summary.approvedCount} 
          amount={summary.approvedAmount} 
          variant="success"
          className="bg-white border-none shadow-sm"
        />
        <SummaryCard 
          icon={<ReceiptIcon className="w-5 h-5 text-primary" />} 
          label="Completed" 
          count={summary.completedCount} 
          amount={summary.completedAmount} 
          variant="success"
          className="bg-white border-none shadow-sm"
        />
      </div>

      {/* Tabs Section */}
      <div className="bg-white p-1.5 rounded-2xl inline-flex gap-1 shadow-sm border border-gray-100">
        {[
          ['all', 'All'],
          ['event', 'Events'],
          ['activation', 'Activations'],
          ['operational', 'Operational'],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => { setSelectedType(value); setSelectedEvent('all'); }}
            className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all duration-300 uppercase tracking-wider ${
              selectedType === value 
                ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search expenses..." value={searchTerm} onChange={event => setSearchTerm(event.target.value)} className="pl-10" />
            </div>
            <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
              <FilterIcon className="w-4 h-4" />
              Filters
            </Button>
          </div>
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <Select label="Event/Activation" value={selectedEvent} onChange={event => setSelectedEvent(event.target.value)}
                options={[{ value: 'all', label: 'All Events' }, ...filteredEventOptions.map(event => ({ value: event.id, label: `${event.name} (${event.type})` }))]} />
              <Select label="Category" value={selectedCategory} onChange={event => setSelectedCategory(event.target.value)}
                options={[{ value: 'all', label: 'All Categories' }, { value: 'venue', label: 'Venue' }, { value: 'catering', label: 'Catering' }, { value: 'equipment', label: 'Equipment' }]} />
              <Select label="Status" value={selectedStatus} onChange={event => setSelectedStatus(event.target.value)}
                options={[{ value: 'all', label: 'All Statuses' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }]} />
              <Input type="date" label="Date Range" />
            </div>
          )}
        </div>
      </Card>

      {selectedEvent !== 'all' && selectedEventData && (
        <Card className="p-4 bg-azure bg-opacity-5 border-azure">
          <p className="text-sm text-gray-600 mb-1">Viewing expenses for:</p>
          <p className="font-semibold text-dark-gray">{selectedEventData.name}</p>
          <p className="text-xs text-gray-500 mt-1">{selectedEventData.type} - Budget: KES {selectedEventData.budget.toLocaleString()}</p>
        </Card>
      )}

      <Card className="overflow-hidden border-none shadow-sm">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-white">
          <div>
            <h3 className="font-bold text-dark-gray text-lg">
              {selectedEventData ? `${selectedEventData.name} Expenses` : 'Recent Expenses'}
            </h3>
            <p className="text-xs text-gray-500">Showing {filteredExpenses.length} transactions</p>
          </div>
          <ExportButton onExport={handleExport} />
        </div>
        <div className="bg-white">
          <Table columns={columns} data={filteredExpenses} defaultSortKey="startDate" defaultSortDirection="desc" itemsPerPage={15} />
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({ icon, label, count, amount, variant = 'default', className = '' }: { icon: React.ReactNode; label: string; count: number; amount: number; variant?: 'default' | 'warning' | 'success'; className?: string }) {
  return (
    <Card className={`p-5 group hover:shadow-md transition-all duration-300 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          {icon}
        </div>
        <Badge variant={variant} className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
          {count} items
        </Badge>
      </div>
      <div>
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] font-bold text-gray-400">KES</span>
          <p className="text-2xl font-black text-dark-gray">{amount.toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );
}
