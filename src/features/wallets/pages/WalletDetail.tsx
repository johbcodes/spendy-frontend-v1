import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Table, Column } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import type { Transaction, User, Wallet } from '../../../types';
import { ArrowRightLeftIcon, TrendingUpIcon, FilterIcon, ArrowLeftIcon } from 'lucide-react';
import { exportToCSV, exportToPDF, exportToExcel } from '../../../utils/exportUtils';
import { ExportButton } from '../../../components/ui/ExportButton';
import { DateTimeDisplay } from '../../../utils/dateFormatter.tsx';

interface WalletDetailProps {
  wallet?: Wallet;
  transactions: Transaction[];
  onOpenModal: (modal: string, data?: any) => void;
  currentUser: User;
  onNavigate: (page: string, id?: string) => void;
  users?: User[];
}

export function WalletDetail({ wallet, transactions, onOpenModal, currentUser, onNavigate, users = [] }: WalletDetailProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const isStaff = currentUser?.role === 'Staff';
  const isAdmin = currentUser?.role === 'Admin';
  const companyName = currentUser?.companyName || 'Company';

  if (!wallet) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => onNavigate('wallets')} className="flex items-center gap-2">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Wallets
        </Button>
        <Card className="p-6"><p className="text-gray-600">Wallet not found</p></Card>
      </div>
    );
  }

  const walletTransactions = transactions.filter(t => t.walletId === wallet.id);
  const filteredTransactions = walletTransactions.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.status.toLowerCase() === statusFilter;
    const matchesType = typeFilter === 'all' || t.type?.toLowerCase() === typeFilter;
    return matchesStatus && matchesType;
  });

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
    if (status === 'Completed') return 'success';
    if (status === 'Pending') return 'warning';
    if (status === 'Failed') return 'danger';
    return 'default';
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    const data = walletTransactions.map(t => ({
      Date: t.date, Time: t.time, User: t.user, Recipient: t.recipient,
      Reference: t.reference, Amount: t.amount, Type: t.type, Status: t.status,
    }));
    if (format === 'csv') exportToCSV(data, `wallet-${wallet.id}-transactions`);
    else if (format === 'pdf') exportToPDF(data, `wallet-${wallet.id}-transactions`, 'Wallet Transactions');
    else exportToExcel(data, `wallet-${wallet.id}-transactions`);
  };

  const amountCell = (txn: Transaction) => (
    <span className={txn.type === 'Fund' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
      {txn.type === 'Fund' ? '+' : '-'}KES {txn.amount.toLocaleString()}
    </span>
  );

  const staffColumns: Column<Transaction>[] = [
    { key: 'date', label: 'Date & Time', sortable: true, render: t => <DateTimeDisplay dateTime={t.date} /> },
    { key: 'user', label: 'Initiated By' },
    { key: 'source', label: 'Source', render: t => t.type === 'Fund' ? companyName : '-' },
    { key: 'reference', label: 'Reference' },
    { key: 'amount', label: 'Amount', render: amountCell },
    { key: 'status', label: 'Status', render: t => <Badge variant={getStatusVariant(t.status)}>{t.status}</Badge> },
  ];

  const adminColumns: Column<Transaction>[] = [
    { key: 'date', label: 'Date & Time', sortable: true, render: t => <DateTimeDisplay dateTime={t.date} /> },
    { key: 'user', label: 'User' },
    { key: 'recipient', label: 'Recipient' },
    { key: 'reference', label: 'Reference' },
    { key: 'source', label: 'Source', render: t => t.type === 'Fund' ? (t.sourceWallet || 'Main Wallet') : '-' },
    { key: 'amount', label: 'Amount', render: amountCell },
    { key: 'status', label: 'Status', render: t => <Badge variant={getStatusVariant(t.status)}>{t.status}</Badge> },
    {
      key: 'actions', label: 'Actions', render: () => (
        <div className="flex items-center gap-1">
          <Button variant="secondary" size="xs">View</Button>
          <Button variant="ghost" size="xs">Print</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-dark-gray">{wallet.name}</h1>
            <Badge variant="success">{wallet.status}</Badge>
          </div>
          <p className="text-gray-600">{wallet.type}</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => onOpenModal('wallet-transfer')}>
              <ArrowRightLeftIcon className="w-4 h-4" /> Transfer
            </Button>
            <Button variant="success" onClick={() => onOpenModal('fund-wallet')}>
              <TrendingUpIcon className="w-4 h-4" /> Fund Wallet
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-gray-600 mb-2">Current Balance</p>
          <p className="text-4xl font-bold text-azure">KES {wallet.balance.toLocaleString()}</p>
        </Card>

        <Card className="p-6">
          {wallet.type === 'USER' && wallet.ownerId ? (() => {
            const linkedUser = users.find(u => u.id === wallet.ownerId);
            return linkedUser ? (
              <>
                <p className="text-gray-600 mb-2">Linked User</p>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-dark-gray">{linkedUser.firstName} {linkedUser.lastName}</p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Email:</span> {linkedUser.email}</p>
                    <p><span className="font-medium">Role:</span> {linkedUser.role}</p>
                    <p><span className="font-medium">Phone:</span> {linkedUser.phone}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-2">Linked User</p>
                <p className="text-xl font-semibold text-dark-gray">User not found</p>
              </>
            );
          })() : (
            <>
              <p className="text-gray-600 mb-2">Linked Event</p>
              <p className="text-xl font-semibold text-dark-gray">{wallet.linkedEvent || 'No linked event'}</p>
            </>
          )}
        </Card>

        <Card className="p-6">
          <p className="text-gray-600 mb-2">Total Transactions</p>
          <p className="text-4xl font-bold text-dark-gray">{walletTransactions.length}</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-dark-gray">Transactions</h3>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <FilterIcon className="w-4 h-4" /> Filters
              </Button>
              <ExportButton onExport={handleExport} />
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <Select
                label="Status"
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'failed', label: 'Failed' },
                ]}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              />
              <Select
                label="Type"
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'fund', label: 'Fund' },
                  { value: 'transfer', label: 'Transfer' },
                  { value: 'withdrawal', label: 'Withdrawal' },
                ]}
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              />
            </div>
          )}

          {walletTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No transactions yet</p>
            </div>
          ) : (
            <Table columns={isStaff ? staffColumns : adminColumns} data={filteredTransactions} />
          )}
        </div>
      </Card>
    </div>
  );
}
