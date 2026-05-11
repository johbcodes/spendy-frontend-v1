import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Transaction, User, Wallet } from '../../../types';
import { ArrowLeftIcon, ReceiptIcon, WalletIcon, ArrowRightLeftIcon, TrendingUpIcon } from 'lucide-react';

interface TransactionDetailProps {
  transaction: Transaction;
  wallet?: Wallet;
  onNavigate: (page: string, id?: string) => void;
  currentUser: User;
}

export function TransactionDetail({
  transaction,
  wallet,
  onNavigate,
  currentUser
}: TransactionDetailProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Pending': return 'warning';
      case 'Failed': return 'danger';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Fund': return <TrendingUpIcon className="w-5 h-5 text-success" />;
      case 'Transfer': return <ArrowRightLeftIcon className="w-5 h-5 text-azure" />;
      case 'Withdrawal': return <ReceiptIcon className="w-5 h-5 text-error" />;
      default: return <WalletIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => onNavigate('wallet-detail', transaction.walletId)}
          className="!bg-azure !text-white !shadow-none hover:!bg-azure/90"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold text-dark-gray">Transaction Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  {getTypeIcon(transaction.type)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-dark-gray">{transaction.type}</h2>
                  <p className="text-sm text-gray-500">{transaction.reference}</p>
                </div>
              </div>
              <Badge variant={getStatusVariant(transaction.status)} className="text-sm px-3 py-1">
                {transaction.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Amount</p>
                <p className={`text-2xl font-bold ${transaction.type === 'Fund' ? 'text-green-600' : 'text-dark-gray'}`}>
                  {transaction.type === 'Fund' ? '+' : '-'} KES {transaction.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date & Time</p>
                <p className="font-semibold text-dark-gray">{transaction.date} at {transaction.time}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Recipient / Description</p>
                <p className="font-semibold text-dark-gray">{transaction.recipient}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Initiated By</p>
                <p className="font-semibold text-dark-gray">{transaction.user}</p>
              </div>
              {transaction.sourceWallet && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Source Wallet</p>
                  <p className="font-semibold text-dark-gray">{transaction.sourceWallet}</p>
                </div>
              )}
            </div>
          </Card>

          {wallet && (
            <Card className="p-6">
              <h3 className="font-bold text-dark-gray mb-4">Wallet Information</h3>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-azure/10 flex items-center justify-center">
                  <WalletIcon className="w-5 h-5 text-azure" />
                </div>
                <div>
                  <p className="font-bold text-dark-gray">{wallet.name}</p>
                  <p className="text-sm text-gray-500">{wallet.type} · Balance: KES {wallet.balance.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-dark-gray mb-4">Actions</h3>
            <div className="space-y-3">
              <Button variant="primary" className="w-full !shadow-none" onClick={() => window.print()}>
                Print Receipt
              </Button>
              <Button 
                variant="primary" 
                className="w-full !bg-azure !text-white !shadow-none hover:!bg-azure/90"
                onClick={() => onNavigate('wallet-detail', transaction.walletId)}
              >
                Back to Wallet
              </Button>
            </div>
          </Card>
          
          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
            <h4 className="text-sm font-bold text-azure mb-2 uppercase tracking-widest">Premium Support</h4>
            <p className="text-xs text-gray-600 mb-3">Need help with this transaction? Our support team is available 24/7.</p>
            <Button variant="primary" size="sm" className="w-full !bg-primary !text-azure !shadow-none">
              Get Help
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
