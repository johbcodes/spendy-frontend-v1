import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, Column } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { ExportButton } from '../../../components/ui/ExportButton';
import type { Event, User, Payment } from '../../../types';
import { PlusIcon, SearchIcon, FilterIcon, EyeIcon, EditIcon, CalendarIcon, DollarSignIcon } from 'lucide-react';
import { exportToCSV, exportToPDF, exportToExcel } from '../../../utils/exportUtils';
import { DateTimeDisplay } from '../../../utils/dateFormatter.tsx';
import { canModifyEvent, filterEvents, summarizeEvents, getStatusVariant } from '../rules';

interface EventsProps {
  onNavigate: (page: string, id?: string) => void;
  onOpenModal: (modal: string, data?: any) => void;
  onArchiveEvent?: (eventId: string) => void;
  events: Event[];
  payments: Payment[];
  currentUser: User;
  pageName?: string;
  lockedType?: 'Event' | 'Activation' | 'Operation';
}

export function Events({ onNavigate, onOpenModal, onArchiveEvent, events, payments, currentUser, pageName, lockedType }: EventsProps) {
  const canModify = canModifyEvent(currentUser);
  const title = pageName ?? 'Events';
  const singular = lockedType ?? 'Event';

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedClient, setSelectedClient] = useState('all');

  const uniqueClients = Array.from(new Set(events.map(e => e.client)));
  const filteredEvents = filterEvents(events, {
    searchTerm, status: selectedStatus, type: selectedType, client: selectedClient,
  });
  const { totalBudget, totalSpent, active: activeEvents } = (() => {
    const s = summarizeEvents(events, payments);
    return { totalBudget: s.totalBudget, totalSpent: s.totalSpent, active: s.active };
  })();

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    const slug = title.toLowerCase();
    const data = filteredEvents.map(e => ({
      Name: e.name, Type: e.type, Category: e.category, Client: e.client,
      Budget: e.budget, Spent: e.spent, Status: e.status,
      'Start Date': e.startDate, 'End Date': e.endDate,
    }));
    if (format === 'csv') exportToCSV(data, slug);
    else if (format === 'pdf') exportToPDF(data, slug, `${title} Report`);
    else exportToExcel(data, slug);
  };

  const columns: Column<Event>[] = [
    { key: 'name', label: `${singular} Name`, sortable: true, mobilePriority: 1 },
    ...(!lockedType ? [{ key: 'type' as keyof Event, label: 'Type', mobilePriority: 2 as const }] : []),
    { key: 'client', label: 'Client', mobilePriority: 3 },
    { key: 'budget', label: 'Budget', hideOnMobile: true, render: e => `KES ${e.budget.toLocaleString()}` },
    { key: 'spent', label: 'Spent', hideOnMobile: true, render: e => `KES ${e.spent.toLocaleString()}` },
    { key: 'startDate', label: 'Start Date & Time', mobilePriority: 4, render: e => <DateTimeDisplay dateTime={e.startDate} /> },
    { key: 'status', label: 'Status', mobilePriority: 5, render: e => <Badge variant={getStatusVariant(e.status)}>{e.status}</Badge> },
    {
      key: 'actions', label: 'Actions', hideOnMobile: true,
      render: event => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="xs" onClick={e => { e.stopPropagation(); onNavigate('event-detail', event.id); }}>
            <EyeIcon className="w-3 h-3 mr-1" /> View
          </Button>
          {canModify && (
            <>
              {event.status !== 'Archived' && (
                <Button variant="ghost" size="xs" onClick={e => { e.stopPropagation(); onNavigate('edit-event', event.id); }}>
                  <EditIcon className="w-3 h-3 mr-1" /> Edit
                </Button>
              )}
              {onArchiveEvent && event.status !== 'Archived' && (
                <Button variant="warning" size="xs" onClick={e => { e.stopPropagation(); onArchiveEvent(event.id); }}>
                  Archive
                </Button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  const showBudget = lockedType !== 'Operation';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">{title}</h1>
          <p className="text-gray-600 mt-1">
            {lockedType === 'Operation'
              ? 'Track operational costs and activities'
              : lockedType === 'Activation'
              ? 'Manage brand activations and campaigns'
              : 'Manage events and track budgets'}
          </p>
        </div>
        {canModify && (
          <Button onClick={() => onOpenModal('new-event', { defaultEventGroup: lockedType ?? 'Event' })}>
            <PlusIcon className="w-4 h-4 mr-2" /> New {singular}
          </Button>
        )}
      </div>

      <div className={`grid grid-cols-1 gap-4 ${showBudget ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-azure" />
            </div>
            <Badge variant="success">{activeEvents} Active</Badge>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total {title}</p>
          <p className="text-3xl font-bold text-dark-gray">{events.length}</p>
        </Card>
        {showBudget && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-azure bg-opacity-10 rounded-lg">
                <DollarSignIcon className="w-6 h-6 text-azure" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Budget</p>
            <p className="text-2xl font-bold text-dark-gray">KES {totalBudget.toLocaleString()}</p>
          </Card>
        )}
        {showBudget && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSignIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-dark-gray">KES {totalSpent.toLocaleString()}</p>
          </Card>
        )}
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search events..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <FilterIcon className="w-4 h-4" /> Filters
          </Button>
          <ExportButton onExport={handleExport} />
        </div>
        {showFilters && (
          <div className={`grid grid-cols-1 gap-3 pt-4 mt-4 border-t border-gray-200 ${lockedType ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            <Select label="Status" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
              options={[{ value: 'all', label: 'All Statuses' }, { value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }, { value: 'draft', label: 'Draft' }, { value: 'cancelled', label: 'Cancelled' }]} />
            {!lockedType && (
              <Select label="Type" value={selectedType} onChange={e => setSelectedType(e.target.value)}
                options={[{ value: 'all', label: 'All Types' }, { value: 'Event', label: 'Event' }, { value: 'Activation', label: 'Activation' }, { value: 'Operation', label: 'Operation' }]} />
            )}
            <Select label="Client" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
              options={[{ value: 'all', label: 'All Clients' }, ...uniqueClients.map(c => ({ value: c, label: c }))]} />
          </div>
        )}
      </Card>

      {/* Active items card grid — grouped by type on the combined view, flat on typed pages */}
      {!lockedType ? (
        <div className="space-y-8">
          {(['Event', 'Activation', 'Operation'] as const).map(typeKey => {
            const items = filteredEvents.filter(e => e.status === 'Active' && e.type === typeKey);
            const groupTitle = typeKey === 'Event' ? 'Events' : typeKey === 'Activation' ? 'Activations' : 'Operations';
            return (
              <div key={typeKey}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-dark-gray">{groupTitle} ({items.length})</h3>
                </div>
                {items.length === 0
                  ? <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">No active {groupTitle.toLowerCase()}.</div>
                  : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map(event => (
                        <Card key={event.id} className="p-5 hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-dark-gray mb-1">{event.name}</h4>
                              <p className="text-sm text-gray-600">{event.client}</p>
                            </div>
                            <Badge variant={getStatusVariant(event.status)}>{event.status}</Badge>
                          </div>
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Budget:</span>
                              <span className="font-semibold">KES {event.budget.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Spent:</span>
                              <span className="font-semibold text-azure">KES {event.spent.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Date:</span>
                              <span className="font-medium"><DateTimeDisplay dateTime={event.startDate} /></span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="secondary" size="sm" className="flex-1" onClick={() => onNavigate('event-detail', event.id)}>
                              <EyeIcon className="w-4 h-4" /> View
                            </Button>
                            <Button variant="ghost" size="sm" className="flex-1" onClick={e => { e.stopPropagation(); onNavigate('edit-event', event.id); }}>
                              <EditIcon className="w-4 h-4" /> Edit
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Typed page — active cards flat list */
        (() => {
          const activeItems = filteredEvents.filter(e => e.status === 'Active');
          return activeItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeItems.map(event => (
                <Card key={event.id} className="p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-dark-gray mb-1">{event.name}</h4>
                      {event.client && <p className="text-sm text-gray-600">{event.client}</p>}
                    </div>
                    <Badge variant={getStatusVariant(event.status)}>{event.status}</Badge>
                  </div>
                  <div className="space-y-2 mb-4">
                    {showBudget && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Budget:</span>
                          <span className="font-semibold">KES {event.budget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Spent:</span>
                          <span className="font-semibold text-azure">KES {event.spent.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium"><DateTimeDisplay dateTime={event.startDate} /></span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => onNavigate('event-detail', event.id)}>
                      <EyeIcon className="w-4 h-4" /> View
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={e => { e.stopPropagation(); onNavigate('edit-event', event.id); }}>
                      <EditIcon className="w-4 h-4" /> Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : null;
        })()
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-gray">All {title}</h3>
          <ExportButton onExport={handleExport} />
        </div>
        <div className="overflow-x-auto">
          <Table columns={columns} data={filteredEvents} defaultSortKey="startDate" />
        </div>
      </Card>
    </div>
  );
}
