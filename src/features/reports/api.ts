import { 
  Event, 
  Expense, 
  Payment, 
  Request, 
  Invoice,
  MonthlyTrendData,
  CategoryBreakdown,
  EventCostBreakdown
} from './types';

export function filterExpensesByDateRange(
  expenses: Expense[],
  startDate?: string,
  endDate?: string
): Expense[] {
  return expenses.filter(exp => {
    if (startDate && new Date(exp.startDate) < new Date(startDate)) return false;
    if (endDate && new Date(exp.startDate) > new Date(endDate)) return false;
    return true;
  });
}

export function filterEventsByTypeAndClient(
  events: Event[],
  eventTypeFilter?: string,
  clientFilter?: string
): Event[] {
  return events.filter(event => {
    if (eventTypeFilter && eventTypeFilter !== 'all' && event.type !== eventTypeFilter) return false;
    if (clientFilter && clientFilter !== 'all' && event.client !== clientFilter) return false;
    return true;
  });
}

export function calculateMonthlyExpenseTrend(
  expenses: Expense[],
  events: Event[]
): MonthlyTrendData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const data: MonthlyTrendData[] = [];

  months.forEach((month, idx) => {
    const monthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.startDate);
      return expDate.getFullYear() === currentYear && expDate.getMonth() === idx;
    });

    const opsSum = monthExpenses
      .filter(exp => !exp.eventId)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const eventSum = monthExpenses
      .filter(exp => exp.eventId)
      .reduce((sum, exp) => sum + exp.amount, 0);

    data.push({ month, ops: opsSum, events: eventSum });
  });

  return data;
}

export function calculateCategoryBreakdown(expenses: Expense[]): CategoryBreakdown[] {
  const categories: { [key: string]: number } = {
    'Transport': 0,
    'Manpower': 0,
    'Venue/Production': 0,
    'Marketing': 0,
    'Admin': 0,
    'Misc.': 0
  };

  expenses.forEach(exp => {
    const category = exp.category || 'Misc.';
    if (Object.prototype.hasOwnProperty.call(categories, category)) {
      categories[category] += exp.amount;
    } else {
      categories['Misc.'] += exp.amount;
    }
  });

  return Object.entries(categories).map(([name, value]) => ({ name, value }));
}

export function calculateEventCostBreakdown(
  events: Event[],
  expenses: Expense[]
): EventCostBreakdown[] {
  return events.map(event => {
    const eventExpenses = expenses.filter(exp => exp.eventId === event.id);
    
    const categoryTotals: { [key: string]: number } = {
      venue: 0,
      manpower: 0,
      transport: 0,
      marketing: 0,
      misc: 0
    };

    eventExpenses.forEach(exp => {
      const category = (exp.category || 'misc').toLowerCase();
      if (Object.prototype.hasOwnProperty.call(categoryTotals, category)) {
        categoryTotals[category] += exp.amount;
      } else {
        categoryTotals['misc'] += exp.amount;
      }
    });

    return {
      event: event.name,
      venue: categoryTotals['venue/production'] || categoryTotals['venue'] || 0,
      manpower: categoryTotals['manpower'] || 0,
      transport: categoryTotals['transport'] || 0,
      marketing: categoryTotals['marketing'] || 0,
      misc: categoryTotals['misc'] || 0
    };
  });
}

export function calculateBudgetVsActual(events: Event[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const data: any[] = [];

  months.forEach((month, idx) => {
    const monthEvents = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getFullYear() === currentYear && eventDate.getMonth() === idx;
    });

    const budgetSum = monthEvents.reduce((sum, event) => sum + event.budget, 0);
    const actualSum = monthEvents.reduce((sum, event) => sum + event.spent, 0);

    data.push({ month, budget: budgetSum, actual: actualSum });
  });

  return data;
}

export function calculateExpenseByEventType(
  expenses: Expense[],
  events: Event[]
): CategoryBreakdown[] {
  const eventExpenseTotal = expenses
    .filter(exp => exp.eventId && events.find(e => e.id === exp.eventId && e.type === 'Project'))
    .reduce((sum, exp) => sum + exp.amount, 0);

  const activationExpenseTotal = expenses
    .filter(exp => exp.eventId && events.find(e => e.id === exp.eventId && e.type === 'Activation'))
    .reduce((sum, exp) => sum + exp.amount, 0);

  const operationExpenseTotal = expenses
    .filter(exp => !exp.eventId)
    .reduce((sum, exp) => sum + exp.amount, 0);

  return [
    { name: 'Events', value: eventExpenseTotal },
    { name: 'Activations', value: activationExpenseTotal },
    { name: 'Operations', value: operationExpenseTotal }
  ].filter(item => item.value > 0);
}

export function getUniqueClients(events: Event[]): string[] {
  const clients = events.map(e => e.client).filter(Boolean);
  return [...new Set(clients)];
}
