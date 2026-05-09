import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { ExportButton } from '../../../components/ui/ExportButton';
import type { Wallet, User } from '../../../types';
import { WalletIcon, PlusIcon, ArrowRightLeftIcon, TrendingUpIcon, SearchIcon, DollarSignIcon, EyeIcon, TrashIcon, SendIcon } from 'lucide-react';
import { exportToCSV, exportToPDF, exportToExcel } from '../../../utils/exportUtils';
import { DateTimeDisplay } from '../../../utils/dateFormatter.tsx';
import { canDeleteWallet, getWalletDisplayName, getWalletDisplayType, getVisibleWallets } from '../rules';

interface WalletsProps {
  onNavigate: (page: string, id?: string) => void;
  onOpenModal: (modal: string, data?: any) => void;
  wallets: Wallet[];
  onDeleteWallet: (walletId: string) => void;
  currentUser: User;
  users: User[];
}

export function Wallets({ onNavigate, onOpenModal, wallets, onDeleteWallet, users, currentUser }: WalletsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const visibleWallets = getVisibleWallets(
    Array.isArray(wallets) ? wallets : (wallets as any)?.data ?? [],
    currentUser,
  );

  const isStaff = currentUser.role === 'Staff';
  const totalBalance = visibleWallets.reduce((sum, w) => sum + w.balance, 0);

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    const data = visibleWallets.map(w => ({
      Name: w.name,
      Type: w.type,
      Balance: w.balance,
      'Linked Event': w.linkedEvent || 'None',
      Status: w.status,
      'Created At': w.createdAt,
    }));
    if (format === 'csv') exportToCSV(data, 'wallets');
    else if (format === 'pdf') exportToPDF(data, 'wallets', 'Wallets Report');
    else exportToExcel(data, 'wallets');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-gray">Wallets</h1>
        <p className="text-gray-600 mt-1">Manage your event wallets and transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
              <WalletIcon className="w-6 h-6 text-azure" />
            </div>
            <Badge variant="success">{visibleWallets.length} Active</Badge>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Wallets</p>
          <p className="text-3xl font-bold text-dark-gray">{visibleWallets.length}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-azure bg-opacity-10 rounded-lg">
              <DollarSignIcon className="w-6 h-6 text-azure" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Balance</p>
          <p className="text-2xl font-bold text-azure">KES {(totalBalance / 1000).toFixed(0)}K</p>
        </Card>

        {!isStaff && (
          <Card className="p-5 flex flex-col justify-center gap-2">
            <Button variant="primary" onClick={() => onOpenModal('new-wallet')} className="w-full">
              <PlusIcon className="w-4 h-4" /> New Wallet
            </Button>
            <Button variant="secondary" onClick={() => onOpenModal('wallet-transfer')} className="w-full">
              <ArrowRightLeftIcon className="w-4 h-4" /> Transfer
            </Button>
            <Button variant="success" onClick={() => onOpenModal('fund-wallet')} className="w-full">
              <TrendingUpIcon className="w-4 h-4" /> Fund Wallet
            </Button>
            <Button
              variant="primary"
              onClick={() => onOpenModal('send-to-spendy-account')}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <SendIcon className="w-4 h-4" /> Send to Spendy Account
            </Button>
          </Card>
        )}
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search wallets..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'events', label: 'Events Wallet' },
              { value: 'operations', label: 'Operations Wallet' },
              { value: 'main', label: 'Main Wallet' },
            ]}
          />
          <ExportButton onExport={handleExport} />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleWallets.map(wallet => (
          <Card key={wallet.id} className="p-5">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-dark-gray mb-1">
                    {getWalletDisplayName(wallet, users)}
                  </h3>
                  <p className="text-xs text-gray-500">{getWalletDisplayType(wallet, users)}</p>
                </div>
                <Badge variant="success">{wallet.status}</Badge>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Balance</p>
                <p className="text-3xl font-bold text-azure">KES {wallet.balance.toLocaleString()}</p>
              </div>

              {wallet.linkedEvent && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Linked Event</p>
                  <p className="text-sm font-medium text-dark-gray">{wallet.linkedEvent}</p>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Created</p>
                <DateTimeDisplay dateTime={wallet.createdAt} />
              </div>

              <div className="flex gap-2 pt-3">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => onNavigate('wallet-detail', wallet.id)}>
                  <EyeIcon className="w-4 h-4" /> View
                </Button>
                <Button variant="success" size="sm" onClick={() => onOpenModal('fund-wallet')}>
                  <TrendingUpIcon className="w-4 h-4" /> Fund
                </Button>
                {canDeleteWallet(wallet, users) && (
                  <Button variant="danger" size="sm" onClick={() => onDeleteWallet(wallet.id)}>
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
