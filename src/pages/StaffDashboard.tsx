import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, Column } from '../components/ui/Table';
import { formatCurrency } from '../utils/currency';
import { CalendarIcon, CheckCircleIcon, ClockIcon, FileTextIcon, TrendingUpIcon, WalletIcon, PlusIcon, CreditCardIcon } from 'lucide-react';
import { User, Event, Wallet, Expense, Payment, Request, Transaction } from '../types';
import { hasModuleAccess, getAccessibleExpenses, getAccessiblePayments } from '../utils/accessControl';
import { DateTimeDisplay } from '../utils/dateFormatter.tsx';

interface StaffDashboardProps {
  onNavigate: (page: string, id?: string) => void;
  onOpenModal: (modal: string) => void;
  currentUser: User;
  events?: Event[];
  wallets?: Wallet[];
  expenses?: Expense[];
  payments?: Payment[];
  requests?: Request[];
  transactions?: Transaction[];
}

export function StaffDashboard({
  onNavigate,
  onOpenModal,
  currentUser,
  events = [],
  wallets = [],
  expenses = [],
  payments = [],
  requests = [],
  transactions = []
}: StaffDashboardProps) {
  // Normalize wallets data - handle both array and API response object
  const walletsArray = Array.isArray(wallets) ? wallets : (wallets as any)?.data || [];

  const [showWelcome, setShowWelcome] = useState(true);
  const companyName = currentUser.companyName || `${currentUser.firstName} ${currentUser.lastName}`;

  // Auto-dismiss welcome notification after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Use access control functions to get properly filtered data based on assigned modules
  const accessibleExpenses = getAccessibleExpenses(currentUser, expenses, events);
  const accessiblePayments = getAccessiblePayments(currentUser, payments, events);

  // Filter data to only show what's relevant to the staff user (their own expenses/payments)
  const userExpenses = accessibleExpenses.filter(expense =>
    expense.createdByUserId === currentUser.id
  );

  const userPayments = accessiblePayments.filter(payment =>
    payment.initiatedBy === `${currentUser.firstName} ${currentUser.lastName}`
  );

  const pendingApprovals = requests.filter(r =>
    r.requestedBy === `${currentUser.firstName} ${currentUser.lastName}` &&
    r.status === 'Pending'
  ).length;

  // Get user's personal wallet - always check for assigned wallets regardless of module access
  // This ensures staff users can see wallets assigned by admin for payments outside the platform
  const userWallet = walletsArray.find(wallet =>
    wallet.ownerId === currentUser.id && wallet.type === 'USER'
  ) || null;

  const totalExpenseAmount = userExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalPaymentAmount = userPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Get recent expenses (last 5)
  const recentExpenses = userExpenses.slice(0, 5);

  // Check which modules are assigned to this user
  const hasExpensesModule = hasModuleAccess(currentUser, 'Expenses');
  const hasPaymentsModule = hasModuleAccess(currentUser, 'Payments');

  return <div className="space-y-6">
      {/* Welcome Alert - Auto-dismisses after 5 seconds */}
      {showWelcome && <div className="bg-azure bg-opacity-10 border border-azure rounded-lg p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm hover:shadow-md hover:shadow-green-200/50 transition-shadow">
          <div>
            <p className="text-azure font-semibold">
              Welcome back, {companyName}!
            </p>
            <p className="text-sm text-gray-600 mt-1">
              You have {pendingApprovals} pending approvals
            </p>
          </div>
          <button onClick={() => setShowWelcome(false)} className="text-gray-500 hover:text-azure hover:scale-110 hover:rotate-90 transition-all duration-200">
            <span className="text-xl font-bold">×</span>
          </button>
        </div>}

      {/* Page Title */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <h1 className="text-2xl font-bold text-dark-gray">Staff Dashboard</h1>
        <p className="text-base text-gray-600 mt-1">
          Welcome to Spendy, {companyName}
        </p>
      </div>

      {/* KPI Cards - Show assigned modules in a dashboard-style grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Expenses Module Card */}
        {hasExpensesModule && (
          <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{animationDelay: '0ms'}}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <FileTextIcon className="w-8 h-8 text-azure" />
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="success" className="text-xs">+{userExpenses.length}</Badge>
                <Button variant="ghost" size="xs" onClick={() => onNavigate('expenses')}>View →</Button>
              </div>
            </div>
            <div>
              <p className="text-gray-600 mb-2">My Expenses</p>
              <p className="text-4xl font-bold text-dark-gray mb-1">{userExpenses.length}</p>
              <p className="text-sm text-gray-500">
                Total: {formatCurrency(totalExpenseAmount)}
              </p>
            </div>
          </Card>
        )}

        {/* Payments Module Card */}
        {hasPaymentsModule && (
          <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{animationDelay: '100ms'}}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <CreditCardIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="success" className="text-xs">+{userPayments.length}</Badge>
                <Button variant="ghost" size="xs" onClick={() => onNavigate('payments')}>View →</Button>
              </div>
            </div>
            <div>
              <p className="text-gray-600 mb-2">My Payments</p>
              <p className="text-4xl font-bold text-dark-gray mb-1">{userPayments.length}</p>
              <p className="text-sm text-gray-500">
                Total: {formatCurrency(totalPaymentAmount)}
              </p>
            </div>
          </Card>
        )}


        {/* Pending Approvals Card */}
        <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{animationDelay: '300ms'}}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-xl">
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="warning" className="text-xs">{pendingApprovals}</Badge>
              <Button variant="ghost" size="xs" onClick={() => onNavigate('approvals')}>Review →</Button>
            </div>
          </div>
          <div>
            <p className="text-gray-600 mb-2">Pending Approvals</p>
            <p className="text-4xl font-bold text-dark-gray mb-1">{pendingApprovals}</p>
            <p className="text-sm text-gray-500">Requires attention</p>
          </div>
        </Card>
      </div>



      {/* User Wallet Section - Always show for staff users */}
      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => userWallet && onNavigate('wallet-detail', userWallet.id)}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-gray">My Wallet</h3>
          <Badge variant={userWallet?.status === 'Active' ? 'success' : 'danger'} className="text-xs">
            {userWallet?.status || 'Not Available'}
          </Badge>
        </div>

        {userWallet ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-dark-gray">
                  {formatCurrency(userWallet.balance || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Available balance for expenses and payments
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <WalletIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">Click to view wallet details and transactions</p>
          </div>
        ) : (
          <div className="text-center py-6">
            <WalletIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No personal wallet assigned</p>
            <p className="text-sm text-gray-400">
              Contact your administrator to assign a wallet to your account
            </p>
          </div>
        )}
      </Card>

      {/* Wallet Transactions Section - Show transactions for user's wallet */}
      {userWallet && transactions.length > 0 && (() => {
        // Filter transactions for user's wallet
        const walletTransactions = transactions.filter(t => t.walletId === userWallet.id).slice(0, 10);

        const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
          switch (status) {
            case 'Completed':
              return 'success';
            case 'Pending':
              return 'warning';
            case 'Failed':
              return 'danger';
            default:
              return 'default';
          }
        };

        const columns: Column<Transaction>[] = [{
          key: 'date',
          label: 'Date & Time',
          sortable: true,
          render: transaction => <DateTimeDisplay dateTime={transaction.date} />
        }, {
          key: 'user',
          label: 'Initiated By'
        }, {
          key: 'source',
          label: 'Source',
          render: txn => {
            if (txn.type === 'Fund') {
              return companyName;
            }
            return '-';
          }
        }, {
          key: 'reference',
          label: 'Reference'
        }, {
          key: 'amount',
          label: 'Amount',
          render: txn => <span className={txn.type === 'Fund' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {txn.type === 'Fund' ? '+' : '-'}KES {txn.amount.toLocaleString()}
            </span>
        }, {
          key: 'status',
          label: 'Status',
          render: txn => <Badge variant={getStatusVariant(txn.status)}>{txn.status}</Badge>
        }];

        return (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dark-gray">Recent Transactions</h3>
              <Badge variant="default" className="text-xs">{walletTransactions.length}</Badge>
            </div>
            {walletTransactions.length > 0 ? (
              <Table columns={columns} data={walletTransactions} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions yet</p>
              </div>
            )}
          </Card>
        );
      })()}

      {/* Quick Actions - Dynamically show based on assigned modules */}
      <Card className="p-6">
        <h3 className="font-semibold text-dark-gray mb-4">Quick Actions</h3>
        <div className={`grid gap-3 ${hasExpensesModule && hasPaymentsModule ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {hasExpensesModule && (
            <Button variant="info" onClick={() => onOpenModal('add-expense')} className="w-full">
              <PlusIcon className="w-4 h-4" />
              Add Expense
            </Button>
          )}
          {hasPaymentsModule && (
            <Button variant="success" onClick={() => onOpenModal('make-payment')} className="w-full">
              <CreditCardIcon className="w-4 h-4" />
              Make Payment
            </Button>
          )}
        </div>
      </Card>

      {/* Recent Expenses - Only show if Expenses module is assigned */}
      {hasExpensesModule && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-gray">Recent Expenses</h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('expenses')}>
              View All →
            </Button>
          </div>

          {recentExpenses.length > 0 ? (
            <div className="space-y-4">
              {recentExpenses.map(expense => (
                <div key={expense.id} className="p-4 border-2 border-gray-100 rounded-xl hover:border-primary transition-all hover:shadow-md cursor-pointer" onClick={() => onNavigate('expense-detail', expense.id)}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-dark-gray text-sm">
                      {expense.title}
                    </h4>
                    <Badge variant={expense.status === 'Approved' ? 'success' : expense.status === 'Pending' ? 'warning' : 'danger'}>
                      {expense.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Event:</span>
                      <span className="font-semibold">
                        {expense.eventName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(expense.amount || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-semibold">
                        {expense.category}
                      </span>
                    </div>
                  </div>
                  <Button variant="secondary" size="xs" className="w-full" onClick={e => {
                    e.stopPropagation();
                    onNavigate('expense-detail', expense.id);
                  }}>
                    View Details →
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No expenses found</p>
              <Button variant="primary" onClick={() => onOpenModal('add-expense')}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Your First Expense
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Recent Payments - Only show if Payments module is assigned */}
      {hasPaymentsModule && userPayments.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-gray">Recent Payments</h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('payments')}>
              View All →
            </Button>
          </div>

          <div className="space-y-4">
            {userPayments.slice(0, 5).map(payment => (
              <div key={payment.id} className="p-4 border-2 border-gray-100 rounded-xl hover:border-primary transition-all hover:shadow-md cursor-pointer" onClick={() => onNavigate('payment-detail', payment.id)}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-dark-gray text-sm">
                    Payment to {payment.recipient}
                  </h4>
                  <Badge variant={payment.status === 'Completed' ? 'success' : payment.status === 'Pending' ? 'warning' : 'danger'}>
                    {payment.status}
                  </Badge>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Event:</span>
                    <span className="font-semibold">
                      {payment.eventName}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(payment.amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold">
                      {payment.type}
                    </span>
                  </div>
                </div>
                <Button variant="secondary" size="xs" className="w-full" onClick={e => {
                  e.stopPropagation();
                  onNavigate('payment-detail', payment.id);
                }}>
                  View Details →
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pending Approvals */}
      {pendingApprovals > 0 && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-gray">Pending Approvals</h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('approvals')}>
              View All →
            </Button>
          </div>

          <div className="space-y-3">
            {requests.filter(r =>
              r.requestedBy === `${currentUser.firstName} ${currentUser.lastName}` &&
              r.status === 'Pending'
            ).slice(0, 3).map(request => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex-1">
                  <p className="font-medium text-dark-gray">{request.name}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {formatCurrency(request.amount || 0)} • {request.category}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="warning">Pending</Badge>
                  <Button variant="ghost" size="xs" onClick={() => onNavigate('approvals')}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>;
}
