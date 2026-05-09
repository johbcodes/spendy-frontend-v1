import type { Event, User, Payment, Expense, Request, Wallet, InventoryItem } from '../../types';
import type { EventFilters, EventSummary } from './types';

export function canModifyEvent(user: User): boolean {
  return (
    user.role === 'Admin' &&
    (user.modulesAssigned.includes('Events') || user.modulesAssigned.includes('All'))
  );
}

export function canManageEventDetails(user: User): boolean {
  return (
    user.role === 'Admin' ||
    user.modulesAssigned.includes('Events') ||
    user.modulesAssigned.includes('All')
  );
}

export function filterEvents(events: Event[], filters: EventFilters): Event[] {
  return events.filter(event => {
    const matchesSearch =
      !filters.searchTerm ||
      event.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      event.client.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const matchesStatus =
      filters.status === 'all' || event.status.toLowerCase() === filters.status.toLowerCase();

    const matchesType =
      filters.type === 'all' || event.type.toLowerCase() === filters.type.toLowerCase();

    const matchesClient = filters.client === 'all' || event.client === filters.client;

    return matchesSearch && matchesStatus && matchesType && matchesClient;
  });
}

export function summarizeEvents(events: Event[], payments: Payment[]): EventSummary {
  return {
    total: events.length,
    active: events.filter(e => e.status === 'Active').length,
    totalBudget: events.reduce((sum, e) => sum + e.budget, 0),
    totalSpent: payments.reduce((sum, p) => sum + p.amount, 0),
  };
}

export function getStatusVariant(
  status: string,
): 'success' | 'info' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Completed':
      return 'info';
    case 'Draft':
      return 'warning';
    case 'Cancelled':
      return 'danger';
    default:
      return 'default';
  }
}

export function calculateBudgetStatus(event: Event, totalExpenses: number) {
  const percentage = event.budget > 0 ? (totalExpenses / event.budget) * 100 : 0;
  const isOverBudget = totalExpenses > event.budget;
  const remaining = event.budget - totalExpenses;

  return {
    percentage,
    isOverBudget,
    remaining,
  };
}

export interface EventActivityLogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

interface EventDetailDataInput {
  event: Event;
  expenses: Expense[];
  requests: Request[];
  payments: Payment[];
  wallets: Wallet[];
  inventory: InventoryItem[];
  activityLog: EventActivityLogEntry[];
}

export function getEventDetailData({
  event,
  expenses,
  requests,
  payments,
  wallets,
  inventory,
  activityLog,
}: EventDetailDataInput) {
  const eventExpenses = expenses.filter(expense => expense.eventId === event.id);
  const eventRequests = requests.filter(request => request.type === event.type);
  const eventPayments = payments.filter(payment => payment.eventId === event.id);
  const eventWallets = wallets.filter(wallet => wallet.linkedEvent === event.id);
  const eventInventory = inventory.filter(item => item.category === event.category);
  const eventActivityLog = activityLog.filter(log =>
    log.action.includes(event.name) || log.action.includes(event.id)
  );
  const totalExpenses = eventExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalWalletBalance = eventWallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const budgetStatus = calculateBudgetStatus(event, totalExpenses);

  return {
    eventExpenses,
    eventRequests,
    eventPayments,
    eventWallets,
    eventInventory,
    eventActivityLog,
    totalExpenses,
    totalWalletBalance,
    budgetPercentage: budgetStatus.percentage,
    isOverBudget: budgetStatus.isOverBudget,
    remainingBudget: budgetStatus.remaining,
    pendingRequests: eventRequests.filter(request => request.status === 'Pending'),
  };
}

export function buildEventCreatePayload(eventData: Partial<Event>) {
  return {
    name: eventData.name || '',
    type: eventData.type || 'Project',
    category: eventData.category || '',
    client: eventData.client || '',
    brand: eventData.brands?.[0] || eventData.brand || '',
    projectLeadId: eventData.projectLeadId || (eventData.projectLead as unknown as string) || '',
    budget: eventData.budget || 0,
    spent: 0,
    startDate: eventData.startDate || '',
    endDate: eventData.endDate || '',
    status: 'Planning',
    location: eventData.location,
    documents: [],
  };
}

export function buildEventUpdatePayload(eventData: Partial<Event>) {
  const payload: Record<string, unknown> = { ...eventData };
  const projectLead = eventData.projectLead as unknown;

  if (typeof projectLead === 'string') {
    payload.projectLeadId = projectLead;
    delete payload.projectLead;
  }

  return payload;
}

export function applyEventUpdate(events: Event[], updatedEvent: Event): Event[] {
  return events.map(event => event.id === updatedEvent.id ? updatedEvent : event);
}

export function appendEventDocument(
  events: Event[],
  eventId: string,
  documentName: string,
): Event[] {
  return events.map(event => {
    if (event.id !== eventId) return event;
    return {
      ...event,
      documents: [...(event.documents || []), documentName],
    };
  });
}

export function buildEventDocumentName(title: string, fileName: string): string {
  return `${title} - ${fileName}`;
}

export function incrementEventSpent(events: Event[], eventId: string, amount: number): Event[] {
  return events.map(event => {
    if (event.id !== eventId) return event;
    return {
      ...event,
      spent: event.spent + amount,
    };
  });
}

export function updateApproverEventAccess(
  users: User[],
  projectLeadName: string,
  eventId: string,
  eventName: string,
  isAdding = true,
): User[] {
  if (!projectLeadName) return users;

  const approverUser = users.find(user =>
    user.role === 'Approver' &&
    `${user.firstName} ${user.lastName}` === projectLeadName
  );

  if (!approverUser) return users;

  return users.map(user => {
    if (user.id !== approverUser.id) return user;

    const currentEventAccess = user.eventAccess || [];
    if (!isAdding) {
      return {
        ...user,
        eventAccess: currentEventAccess.filter(access => access.eventId !== eventId),
      };
    }

    const existingAccess = currentEventAccess.find(access => access.eventId === eventId);
    if (existingAccess) return user;

    return {
      ...user,
      eventAccess: [
        ...currentEventAccess,
        {
          eventId,
          eventName,
          accessLevel: 'approve' as const,
        },
      ],
    };
  });
}
