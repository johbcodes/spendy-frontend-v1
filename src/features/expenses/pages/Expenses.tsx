import { useState } from 'react';
import type React from 'react';
import { CalendarIcon, ClockIcon, FileTextIcon, FilterIcon, PlusIcon, SearchIcon } from 'lucide-react';
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard icon={<FileTextIcon className="w-6 h-6 text-azure" />} label="Total Expenses" count={summary.totalCount} amount={summary.totalAmount} />
        <SummaryCard icon={<ClockIcon className="w-6 h-6 text-yellow-600" />} label="Pending" count={summary.pendingCount} amount={summary.pendingAmount} variant="warning" />
        <SummaryCard icon={<FileTextIcon className="w-6 h-6 text-green-600" />} label="Approved" count={summary.approvedCount} amount={summary.approvedAmount} variant="success" />
        <SummaryCard icon={<FileTextIcon className="w-6 h-6 text-green-600" />} label="Completed" count={summary.completedCount} amount={summary.completedAmount} variant="success" />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ['all', 'All Expenses'],
          ['event', 'Event Expenses'],
          ['activation', 'Activation Expenses'],
          ['operational', 'Operational Expenses'],
        ].map(([value, label]) => (
          <Button key={value} variant={selectedType === value ? 'primary' : 'secondary'} size="sm" onClick={() => { setSelectedType(value); setSelectedEvent('all'); }}>
            <CalendarIcon className="w-4 h-4" />
            {label}
          </Button>
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

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-gray">{selectedEventData ? `${selectedEventData.name} Expenses` : 'All Expenses'}</h3>
          <ExportButton onExport={handleExport} />
        </div>
        <Table columns={columns} data={filteredExpenses} defaultSortKey="startDate" defaultSortDirection="desc" itemsPerPage={15} />
      </Card>
    </div>
  );
}

function SummaryCard({ icon, label, count, amount, variant = 'default' }: { icon: React.ReactNode; label: string; count: number; amount: number; variant?: 'default' | 'warning' | 'success' }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-primary bg-opacity-10 rounded-lg">{icon}</div>
        <Badge variant={variant}>{count}</Badge>
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-dark-gray">KES {amount.toLocaleString()}</p>
    </Card>
  );
}
