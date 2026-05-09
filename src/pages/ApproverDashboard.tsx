import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../utils/currency';
import { CalendarIcon, CheckCircleIcon, ClockIcon, FileTextIcon, TrendingUpIcon } from 'lucide-react';
import { User, Event, Expense, Payment, Request } from '../types';

interface ApproverDashboardProps {
  onNavigate: (page: string, id?: string) => void;
  onOpenModal: (modal: string) => void;
  currentUser: User;
  events?: Event[];
  expenses?: Expense[];
  payments?: Payment[];
  requests?: Request[];
}

export function ApproverDashboard({
  onNavigate,
  onOpenModal,
  currentUser,
  events = [],
  expenses = [],
  payments = [],
  requests = []
}: ApproverDashboardProps) {
  const [showWelcome, setShowWelcome] = useState(true);
  const companyName = currentUser.companyName || `${currentUser.firstName} ${currentUser.lastName}`;

  // Auto-dismiss welcome notification after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Filter data to only show what's relevant to the approver user
  // Approvers can only see events they have access to
  const accessibleEvents = events.filter(event => {
    if (!currentUser.eventAccess) return false;
    return currentUser.eventAccess.some(ea => ea.eventId === event.id);
  });

  const accessibleEventIds = accessibleEvents.map(event => event.id);

  // Filter expenses and payments for accessible events
  const accessibleExpenses = expenses.filter(expense =>
    accessibleEventIds.includes(expense.eventId)
  );

  const accessiblePayments = payments.filter(payment =>
    accessibleEventIds.includes(payment.eventId)
  );

  const accessibleRequests = requests.filter(request =>
    request.eventId && accessibleEventIds.includes(request.eventId)
  );

  // Calculate KPIs
  const activeEvents = accessibleEvents.filter(e => e.status === 'Active').length;
  const totalBudget = accessibleEvents.reduce((sum, e) => sum + (e.budget || 0), 0);
  const totalSpent = accessiblePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingApprovals = accessibleRequests.filter(r => r.status === 'Pending').length;
  const approvedRequests = accessibleRequests.filter(r => r.status === 'Approved').length;

  // Get recent approvals
  const recentApprovals = accessibleRequests
    .filter(r => r.status === 'Approved')
    .sort((a, b) => new Date(b.dateRequested).getTime() - new Date(a.dateRequested).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Alert - Auto-dismisses after 5 seconds */}
      {showWelcome && (
        <div className="bg-azure bg-opacity-10 border border-azure rounded-lg p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm hover:shadow-md hover:shadow-green-200/50 transition-shadow">
          <div>
            <p className="text-azure font-semibold">
              Welcome back, {companyName}!
            </p>
            <p className="text-sm text-gray-600 mt-1">
              You have {pendingApprovals} pending approvals across {activeEvents} assigned events
            </p>
          </div>
          <button
            onClick={() => setShowWelcome(false)}
            className="text-gray-500 hover:text-azure hover:scale-110 hover:rotate-90 transition-all duration-200"
          >
            <span className="text-xl font-bold">×</span>
          </button>
        </div>
      )}

      {/* Page Title */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <h1 className="text-2xl font-bold text-dark-gray">Approver Dashboard</h1>
        <p className="text-base text-gray-600 mt-1">
          Welcome to Spendy, {companyName}
        </p>
      </div>

      {/* KPI Cards - Only show modules assigned to approver */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Events Card - Approvers have Events module */}
        <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{animationDelay: '0ms'}}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary bg-opacity-10 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <CalendarIcon className="w-8 h-8 text-azure" />
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" className="text-xs">+{activeEvents}</Badge>
              <Button variant="ghost" size="xs" onClick={() => onNavigate('events')}>View →</Button>
            </div>
          </div>
          <div>
            <p className="text-gray-600 mb-2">Assigned Events</p>
            <p className="text-4xl font-bold text-dark-gray mb-1">{activeEvents}</p>
            <p className="text-sm text-gray-500">
              Total budget: {formatCurrency(totalBudget)}
            </p>
          </div>
        </Card>

        {/* Budget Overview Card */}
        <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{animationDelay: '100ms'}}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <TrendingUpIcon className="w-8 h-8 text-green-600" />
            </div>
            <Badge variant="success" className="text-xs">
              {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% spent
            </Badge>
          </div>
          <div>
            <p className="text-gray-600 mb-2">Budget Overview</p>
            <p className="text-4xl font-bold text-dark-gray mb-1">{formatCurrency(totalSpent)}</p>
            <p className="text-sm text-gray-500">
              of {formatCurrency(totalBudget)} total budget
            </p>
          </div>
        </Card>

        {/* Pending Approvals Card - Approvers have Approvals module */}
        <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{animationDelay: '200ms'}}>
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
            <p className="text-sm text-gray-500">Requires your attention</p>
          </div>
        </Card>

        {/* Approved Requests Card */}
        <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300" style={{animationDelay: '300ms'}}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <Badge variant="success" className="text-xs">+{approvedRequests}</Badge>
          </div>
          <div>
            <p className="text-gray-600 mb-2">Approved Requests</p>
            <p className="text-4xl font-bold text-dark-gray mb-1">{approvedRequests}</p>
            <p className="text-sm text-gray-500">This month</p>
          </div>
        </Card>
      </div>

      {/* Assigned Events Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-gray">Assigned Events</h3>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('events')}>
            View All →
          </Button>
        </div>

        {accessibleEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accessibleEvents.slice(0, 6).map(event => {
              const eventExpenses = accessibleExpenses.filter(e => e.eventId === event.id);
              const eventSpent = accessiblePayments
                .filter(p => p.eventId === event.id)
                .reduce((sum, p) => sum + (p.amount || 0), 0);

              return (
                <div
                  key={event.id}
                  className="p-4 border-2 border-gray-100 rounded-xl hover:border-primary transition-all hover:shadow-md cursor-pointer"
                  onClick={() => onNavigate('event-detail', event.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-dark-gray text-sm">
                      {event.name}
                    </h4>
                    <Badge variant={event.status === 'Active' ? 'success' : 'default'}>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-semibold">
                        {formatCurrency(event.budget || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Spent:</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(eventSpent)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expenses:</span>
                      <span className="font-semibold">
                        {eventExpenses.length}
                      </span>
                    </div>
                  </div>
                  <Button variant="secondary" size="xs" className="w-full" onClick={e => {
                    e.stopPropagation();
                    onNavigate('event-detail', event.id);
                  }}>
                    View Details →
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No events assigned to you yet</p>
            <p className="text-sm text-gray-400">
              Contact your administrator to assign events to your account
            </p>
          </div>
        )}
      </Card>

      {/* Recent Approvals */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-gray">Recent Approvals</h3>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('approvals')}>
            View All →
          </Button>
        </div>

        {recentApprovals.length > 0 ? (
          <div className="space-y-4">
            {recentApprovals.map(request => {
              const relatedEvent = accessibleEvents.find(e => e.id === request.eventId);
              return (
                <div key={request.id} className="p-4 border-2 border-gray-100 rounded-xl hover:border-primary transition-all hover:shadow-md cursor-pointer" onClick={() => onNavigate('request-review', request.id)}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-dark-gray text-sm">
                      {request.name}
                    </h4>
                    <Badge variant="success">
                      Approved
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Event:</span>
                      <span className="font-semibold">
                        {relatedEvent?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(request.amount || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-semibold">
                        {request.category}
                      </span>
                    </div>
                  </div>
                  <Button variant="secondary" size="xs" className="w-full" onClick={e => {
                    e.stopPropagation();
                    onNavigate('request-review', request.id);
                  }}>
                    View Details →
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No recent approvals</p>
            <Button variant="primary" onClick={() => onNavigate('approvals')}>
              View Approvals →
            </Button>
          </div>
        )}
      </Card>

      {/* Pending Approvals Section */}
      {pendingApprovals > 0 && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-gray">Pending Approvals</h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('approvals')}>
              Review All →
            </Button>
          </div>

          <div className="space-y-3">
            {accessibleRequests
              .filter(r => r.status === 'Pending')
              .slice(0, 3)
              .map(request => {
                const relatedEvent = accessibleEvents.find(e => e.id === request.eventId);
                return (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex-1">
                      <p className="font-medium text-dark-gray">{request.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatCurrency(request.amount || 0)} • {relatedEvent?.name || 'Unknown Event'} • {request.category}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="warning">Pending</Badge>
                      <Button variant="ghost" size="xs" onClick={() => onNavigate('request-review', request.id)}>
                        Review
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}
    </div>
  );
}
