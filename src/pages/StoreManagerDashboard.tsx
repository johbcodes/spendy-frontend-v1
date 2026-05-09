import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../utils/currency';
import { CalendarIcon, CheckCircleIcon, ClockIcon, FileTextIcon, PackageIcon, TrendingUpIcon, PlusIcon, ArrowUpIcon } from 'lucide-react';
import { User, Event, Wallet, Expense, Payment, Request, InventoryItem } from '../types';
import { hasModuleAccess, getAccessibleExpenses } from '../utils/accessControl';

interface StoreManagerDashboardProps {
  onNavigate: (page: string, id?: string) => void;
  onOpenModal: (modal: string) => void;
  currentUser: User;
  events?: Event[];
  wallets?: Wallet[];
  expenses?: Expense[];
  payments?: Payment[];
  requests?: Request[];
  inventory?: InventoryItem[];
}

export function StoreManagerDashboard({
  onNavigate,
  onOpenModal,
  currentUser,
  events = [],
  wallets = [],
  expenses = [],
  payments = [],
  requests = [],
  inventory = []
}: StoreManagerDashboardProps) {
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

  // Filter data to only show what's relevant to the store manager
  const userExpenses = accessibleExpenses.filter(expense =>
    expense.createdByUserId === currentUser.id
  );

  const pendingApprovals = requests.filter(r =>
    r.requestedBy === `${currentUser.firstName} ${currentUser.lastName}` &&
    r.status === 'Pending'
  ).length;

  // Get user's personal wallet (only if Wallets module is assigned)
  const userWallet = hasModuleAccess(currentUser, 'Wallets') ? walletsArray.find(wallet =>
    wallet.ownerId === currentUser.id && wallet.type === 'USER'
  ) : null;

  // Inventory statistics
  const totalInventoryItems = inventory.length;
  const availableItems = inventory.filter(item => item.checkoutStatus === 'available').length;
  const checkedOutItems = inventory.filter(item => item.checkoutStatus === 'checked-out').length;
  const checkedInItems = inventory.filter(item => item.checkoutStatus === 'checked-in').length;
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.totalCost || 0), 0);

  const totalExpenseAmount = userExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Get recent expenses (last 5)
  const recentExpenses = userExpenses.slice(0, 5);

  // Get recent inventory items (last 5)
  const recentInventory = inventory.slice(0, 5);

  // Check which modules are assigned to this user
  const hasExpensesModule = hasModuleAccess(currentUser, 'Expenses');
  const hasInventoryModule = hasModuleAccess(currentUser, 'Inventory');

  return <div className="space-y-6">
      {/* Welcome Alert - Auto-dismisses after 5 seconds */}
      {showWelcome && <div className="bg-azure bg-opacity-10 border border-azure rounded-lg p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm hover:shadow-md hover:shadow-green-200/50 transition-shadow">
          <div>
            <p className="text-azure font-semibold">
              Welcome back, {companyName}!
            </p>
            <p className="text-sm text-gray-600 mt-1">
              You have {pendingApprovals} pending approvals and {totalInventoryItems} inventory items under management
            </p>
          </div>
          <button onClick={() => setShowWelcome(false)} className="text-gray-500 hover:text-azure hover:scale-110 hover:rotate-90 transition-all duration-200">
            <span className="text-xl font-bold">×</span>
          </button>
        </div>}

      {/* Page Title */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <h1 className="text-2xl font-bold text-dark-gray">Store Manager Dashboard</h1>
        <p className="text-base text-gray-600 mt-1">
          Manage inventory and expenses, {companyName}
        </p>
      </div>

      {/* KPI Cards - Show assigned modules in a dashboard-style grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Inventory Items Card */}
        {hasInventoryModule && (
          <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{animationDelay: '0ms'}}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <PackageIcon className="w-8 h-8 text-azure" />
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="success" className="text-xs">+{availableItems} available</Badge>
                <Button variant="ghost" size="xs" onClick={() => onNavigate('inventory')}>View →</Button>
              </div>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Total Inventory Items</p>
              <p className="text-4xl font-bold text-dark-gray mb-1">{totalInventoryItems}</p>
              <p className="text-sm text-gray-500">
                {formatCurrency(totalInventoryValue)} total value
              </p>
            </div>
          </Card>
        )}

        {/* Available Items Card */}
        {hasInventoryModule && (
          <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{animationDelay: '100ms'}}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="success" className="text-xs">{availableItems}/{totalInventoryItems}</Badge>
                <Button variant="ghost" size="xs" onClick={() => onNavigate('inventory')}>View →</Button>
              </div>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Available Items</p>
              <p className="text-4xl font-bold text-dark-gray mb-1">{availableItems}</p>
              <p className="text-sm text-gray-500">
                {checkedOutItems} currently checked out
              </p>
            </div>
          </Card>
        )}

        {/* Expenses Module Card */}
        {hasExpensesModule && (
          <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{animationDelay: '200ms'}}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileTextIcon className="w-8 h-8 text-blue-600" />
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

        {/* Checked Out Items Card */}
        {hasInventoryModule && (
          <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{animationDelay: '300ms'}}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-xl">
                <TrendingUpIcon className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="warning" className="text-xs">{checkedOutItems}</Badge>
                <Button variant="ghost" size="xs" onClick={() => onNavigate('inventory')}>View →</Button>
              </div>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Checked Out Items</p>
              <p className="text-4xl font-bold text-dark-gray mb-1">{checkedOutItems}</p>
              <p className="text-sm text-gray-500">Currently in use</p>
            </div>
          </Card>
        )}

        {/* Checked In Items Card */}
        {hasInventoryModule && (
          <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{animationDelay: '400ms'}}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <ArrowUpIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="info" className="text-xs">{checkedInItems}</Badge>
                <Button variant="ghost" size="xs" onClick={() => onNavigate('inventory')}>View →</Button>
              </div>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Checked In Items</p>
              <p className="text-4xl font-bold text-dark-gray mb-1">{checkedInItems}</p>
              <p className="text-sm text-gray-500">Recently returned</p>
            </div>
          </Card>
        )}
      </div>

      {/* Quick Actions - Dynamically show based on assigned modules */}
      <Card className="p-6">
        <h3 className="font-semibold text-dark-gray mb-4">Quick Actions</h3>
        <div className={`grid gap-3 ${hasInventoryModule && hasExpensesModule ? 'grid-cols-2 md:grid-cols-3' : hasInventoryModule ? 'grid-cols-2 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-1'}`}>
          {hasInventoryModule && (
            <>
              <Button variant="primary" onClick={() => onOpenModal('add-inventory')} className="w-full">
                <PlusIcon className="w-4 h-4" />
                Add Inventory
              </Button>
              <Button variant="secondary" onClick={() => onNavigate('inventory')} className="w-full">
                <PackageIcon className="w-4 h-4" />
                View Inventory
              </Button>
            </>
          )}
          {hasExpensesModule && (
            <Button variant="info" onClick={() => onOpenModal('add-expense')} className="w-full">
              <PlusIcon className="w-4 h-4" />
              Add Expense
            </Button>
          )}
        </div>
      </Card>

      {/* Inventory Overview - Only show if Inventory module is assigned */}
      {hasInventoryModule && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-gray">Recent Inventory Items</h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('inventory')}>
              View All →
            </Button>
          </div>

          {recentInventory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentInventory.map(item => (
                <div key={item.id} className="p-4 border-2 border-gray-100 rounded-xl hover:border-primary transition-all hover:shadow-md cursor-pointer" onClick={() => onNavigate('inventory-detail', item.id)}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-dark-gray text-sm">
                      {item.name}
                    </h4>
                    <Badge variant={item.checkoutStatus === 'available' ? 'success' : 'warning'}>
                      {item.checkoutStatus === 'available' ? 'Available' : 'Checked Out'}
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-semibold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-semibold">
                        {item.location}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-semibold">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <Button variant="secondary" size="xs" className="w-full" onClick={e => {
                    e.stopPropagation();
                    onNavigate('inventory-detail', item.id);
                  }}>
                    View Details →
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No inventory items found</p>
              <Button variant="primary" onClick={() => onOpenModal('add-inventory')}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Your First Item
              </Button>
            </div>
          )}
        </Card>
      )}

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

      {/* User Wallet Section - Always show for store managers */}
      <Card className="p-6">
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
                  Available balance for expenses
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <PackageIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => onOpenModal('fund-wallet')}>
                <PlusIcon className="w-4 h-4 mr-1" />
                Fund Wallet
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('wallets')}>
                View Details →
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <PackageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No personal wallet assigned</p>
            <p className="text-sm text-gray-400">
              Contact your administrator to assign a wallet to your account
            </p>
          </div>
        )}
      </Card>

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
