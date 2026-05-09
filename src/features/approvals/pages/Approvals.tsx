import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, Column } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Tabs } from '../../../components/ui/Tabs';
import { ExportButton } from '../../../components/ui/ExportButton';
import type { Request } from '../types';
import { SearchIcon, CheckCircleIcon, PlusIcon, RotateCcwIcon, FileTextIcon, ClockIcon, XCircleIcon, CreditCardIcon, FilterIcon } from 'lucide-react';
import { exportToCSV, exportToPDF, exportToExcel } from '../../../utils/exportUtils';
import { DateTimeDisplay } from '../../../utils/dateFormatter.tsx';
import { useApprovalFilters, useApprovalStats } from '../hooks';
import { mapRequestsToExportData } from '../mappers';
import {
  getBatchRecipientCount as getApprovalBatchRecipientCount,
  getRequestDisplayAmount,
  getStatusVariant,
  hasAssignedSupplier as hasApprovalAssignedSupplier,
  hasBatchDisbursement,
  hasBatchExpenses as hasApprovalBatchExpenses,
  isBatchExpenseRequest,
  isBatchRequest,
  isExpensePaid as isApprovalExpensePaid,
} from '../rules';
interface ApprovalsProps {
  onOpenModal: (modal: string, data?: any) => void;
  onNavigate: (page: string, id?: string) => void;
  requests: Request[];
  expenses?: any[];
  payments?: any[];
  suppliers?: any[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string, reason: string) => void;
  onUndoRejection?: (requestId: string) => void;
  onEditRequest?: (requestId: string, data: any) => void;
}
export function Approvals({
  onOpenModal,
  onNavigate,
  requests,
  expenses = [],
  payments = [],
  suppliers = [],
  onApprove: _onApprove,
  onReject: _onReject,
  onUndoRejection,
  onEditRequest
}: ApprovalsProps) {

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const {
    allRequests,
    eventRequests,
    activationRequests,
    operationRequests,
  } = useApprovalFilters(requests, searchTerm, statusFilter);

  // Track active tab so cards reflect the currently visible table
  const [activeTab, setActiveTab] = useState('all-requests');
  const getDisplayedRequests = () => {
    switch (activeTab) {
      case 'event-expenses':
        return eventRequests;
      case 'activation-expenses':
        return activationRequests;
      case 'operation-expenses':
        return operationRequests;
      case 'all-requests':
      default:
        return allRequests;
    }
  };
  const displayedRequests = getDisplayedRequests();

  const getBatchRecipientCount = (r: Request) => getApprovalBatchRecipientCount(r, expenses);
  const hasBatchExpenses = (r: Request) => hasApprovalBatchExpenses(r, expenses);
  const hasAssignedSupplier = (r: Request) => hasApprovalAssignedSupplier(r, expenses);
  const isExpensePaid = (r: Request) => isApprovalExpensePaid(r, payments);

  // Calculate statistics for the cards based on filtered requests.
  const approvalStats = useApprovalStats(allRequests);
  const totalApprovals = approvalStats.total;
  const completedApprovals = approvalStats.completed;
  const pendingApprovals = approvalStats.pending;
  const rejectedApprovals = approvalStats.rejected;
  const totalAmount = approvalStats.totalAmount;
  const completedAmount = approvalStats.completedAmount;
  const pendingAmount = approvalStats.pendingAmount;
  const rejectedAmount = approvalStats.rejectedAmount;

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    const exportData = mapRequestsToExportData(requests);
    switch (format) {
      case 'csv':
        exportToCSV(exportData, 'approvals');
        break;
      case 'pdf':
        exportToPDF(exportData, 'approvals', 'Approvals Report');
        break;
      case 'excel':
        exportToExcel(exportData, 'approvals');
        break;
    }
  };
  const createColumns = (showActions = true): Column<Request>[] => {
    const baseColumns: Column<Request>[] = [{
      key: 'name',
      label: 'Name',
      sortable: false,
      render: request => {
        const isBatch = isBatchRequest(request);
        const recipientCount = getBatchRecipientCount(request);
        const batchExpenses = isBatchExpenseRequest(request) || hasBatchExpenses(request);
        const batchDisbursement = hasBatchDisbursement(request);
        const supplierAssigned = hasAssignedSupplier(request);
        
        // Get display name based on event and expense category
        const expense = expenses.find(e => e.id === request.expenseId);
        const displayName = expense ? `${expense.eventName} - ${request.category}` : request.name;
        const isBatchExpense = isBatchExpenseRequest(request) || hasBatchExpenses(request);
        const finalDisplayName = isBatchExpense ? (displayName.includes('(Batch Expense)') ? displayName : `${displayName} (Batch Expense)`) : displayName;
        
        return (
          <div>
            <span>{finalDisplayName}</span>
          </div>
        );
      }
    }, {
      key: 'category',
      label: 'Expense Category',
      sortable: false,
      render: request => {
        // Get category from linked expense if available
        const expense = expenses.find(e => e.id === request.expenseId);
        return expense?.category || request.category || '-';
      }
    }, {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: request => {
        // Get description from linked expense if available
        const expense = expenses.find(e => e.id === request.expenseId);
        return expense?.description || request.description || '-';
      }
    }, {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: request => {
        // Use the same logic as getRequestDisplayAmount to ensure consistency
        const displayAmount = getRequestDisplayAmount(request);
        return (
          <div>
            <span>KES {displayAmount.toLocaleString()}</span>
          </div>
        );
      }
    }, {
      key: 'dateRequested',
      label: 'Date Requested',
      sortable: true,
      render: request => <DateTimeDisplay dateTime={request.dateRequested} />
    }, {
      key: 'requestedBy',
      label: 'Requested By',
      sortable: true
    }];
    if (showActions) {
      baseColumns.push({
        key: 'status',
        label: 'Status',
        render: request => <Badge variant={getStatusVariant(request.status)}>
            {request.status}
          </Badge>
      });
      baseColumns.push({
        key: 'actions',
        label: 'Quick Actions',
        render: request => <div className="flex items-center gap-1">
            <Button variant="success" size="xs" onClick={() => {
              // Navigate to batch approval review for batch requests, otherwise regular request review
              const batchRequest = isBatchRequest(request);
              onNavigate(batchRequest ? 'batch-approval-review' : 'request-review', request.id);
            }} title="Review and process">
              <CheckCircleIcon className="w-3 h-3 mr-1" />
              Review
            </Button>
            {request.status === 'Rejected' && onUndoRejection && (
              <Button variant="warning" size="xs" onClick={() => onUndoRejection(request.id)} title="Undo rejection - move back to pending">
                <RotateCcwIcon className="w-3 h-3" />
              </Button>
            )}
            {request.status === 'Approved' && onUndoRejection && !isExpensePaid(request) && (
              <Button variant="warning" size="xs" onClick={() => onUndoRejection(request.id)} title="Undo approval - move back to pending">
                <RotateCcwIcon className="w-3 h-3" />
              </Button>
            )}
          </div>
      });
    } else {
      baseColumns.push({
        key: 'status',
        label: 'Status',
        render: request => <Badge variant={getStatusVariant(request.status)}>
            {request.status}
          </Badge>
      });
      baseColumns.push({
        key: 'processedBy',
        label: 'Processed By'
      });
      baseColumns.push({
        key: 'dateProcessed',
        label: 'Date Processed'
      });
    }
    return baseColumns;
  };
  const tabs = [{
    id: 'all-requests',
    label: `All Requests (${allRequests.length})`,
    content: <div className="space-y-4">
          <Table columns={createColumns(true)} data={allRequests} defaultSortKey="dateRequested" defaultSortDirection="desc" />
        </div>
  }, {
    id: 'event-expenses',
    label: `Project Expenses (${eventRequests.length})`,
    content: <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {eventRequests.filter(r => r.status === 'Pending').length} pending requests
          </p>
          <Table columns={createColumns(true)} data={eventRequests} defaultSortKey="dateRequested" defaultSortDirection="desc" />
        </div>
  }, {
    id: 'activation-expenses',
    label: `Activation Expenses (${activationRequests.length})`,
    content: <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {activationRequests.filter(r => r.status === 'Pending').length} pending requests
          </p>
          <Table columns={createColumns(true)} data={activationRequests} defaultSortKey="dateRequested" defaultSortDirection="desc" />
        </div>
  }, {
    id: 'operation-expenses',
    label: `Operation Expenses (${operationRequests.length})`,
    content: <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {operationRequests.filter(r => r.status === 'Pending').length} pending requests
          </p>
          <Table columns={createColumns(true)} data={operationRequests} defaultSortKey="dateRequested" defaultSortDirection="desc" />
        </div>
  }];
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve requests</p>
        </div>
        <Button onClick={() => onOpenModal('add-expense')}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Request Expense
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
              <FileTextIcon className="w-6 h-6 text-azure" />
            </div>
            <Badge variant="default">{totalApprovals}</Badge>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Approvals</p>
          <p className="text-3xl font-bold text-dark-gray">KES {totalAmount.toLocaleString()}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <Badge variant="success">{completedApprovals}</Badge>
          </div>
          <p className="text-gray-600 text-sm mb-1">Completed Approvals</p>
          <p className="text-3xl font-bold text-dark-gray">KES {completedAmount.toLocaleString()}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <Badge variant="warning">{pendingApprovals}</Badge>
          </div>
          <p className="text-gray-600 text-sm mb-1">Pending Approvals</p>
          <p className="text-3xl font-bold text-dark-gray">KES {pendingAmount.toLocaleString()}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircleIcon className="w-6 h-6 text-red-600" />
            </div>
            <Badge variant="danger">{rejectedApprovals}</Badge>
          </div>
          <p className="text-gray-600 text-sm mb-1">Rejected Approvals</p>
          <p className="text-3xl font-bold text-dark-gray">KES {rejectedAmount.toLocaleString()}</p>
        </Card>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          All Approvals <Badge variant="default" className="ml-2">{allRequests.length}</Badge>
        </Button>
        <Button
          variant={statusFilter === 'approved' ? 'success' : 'secondary'}
          size="sm"
          onClick={() => setStatusFilter('approved')}
        >
          <CheckCircleIcon className="w-4 h-4" />
          Completed <Badge variant="default" className="ml-2">{allRequests.filter(r => r.status === 'Approved').length}</Badge>
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'warning' : 'secondary'}
          size="sm"
          onClick={() => setStatusFilter('pending')}
        >
          <ClockIcon className="w-4 h-4" />
          Pending <Badge variant="default" className="ml-2">{allRequests.filter(r => r.status === 'Pending').length}</Badge>
        </Button>
        <Button
          variant={statusFilter === 'rejected' ? 'danger' : 'secondary'}
          size="sm"
          onClick={() => setStatusFilter('rejected')}
        >
          Rejected <Badge variant="default" className="ml-2">{allRequests.filter(r => r.status === 'Rejected').length}</Badge>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search requests..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
              <FilterIcon className="w-4 h-4" />
              Filters
            </Button>
            <ExportButton onExport={handleExport} />
          </div>

          {showFilters && <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <Select label="Event Type" options={[{
            value: 'all',
            label: 'All Types'
          }, {
            value: 'Project',
            label: 'Project'
          }, {
            value: 'Activation',
            label: 'Activation'
          }, {
            value: 'Operation',
            label: 'Operation'
          }]} />
              <Select label="Status" options={[{
            value: 'all',
            label: 'All Statuses'
          }, {
            value: 'approved',
            label: 'Approved'
          }, {
            value: 'pending',
            label: 'Pending'
          }, {
            value: 'rejected',
            label: 'Rejected'
          }]} />
              <Select label="Category" options={[{
            value: 'all',
            label: 'All Categories'
          }, {
            value: 'Marketing',
            label: 'Marketing'
          }, {
            value: 'Logistics',
            label: 'Logistics'
          }]} />
              <Input type="datetime-local" label="Date Requested" />
            </div>}
        </div>
      </Card>

      <Card className="p-6">
        <div>
          <Tabs tabs={tabs} defaultTab={activeTab} onTabChange={(id) => setActiveTab(id)} />
        </div>
      </Card>
    </div>;
}

