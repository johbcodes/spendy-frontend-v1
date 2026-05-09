import { Expenses } from './Expenses';
import { getStaffExpenses } from '../rules';
import type { Event, Expense, User } from '../types';

interface StaffExpensesProps {
  onOpenModal: (modal: string, data?: any) => void;
  onNavigate: (page: string, id?: string) => void;
  expenses: Expense[];
  events: Event[];
  currentUser: User;
}

export function StaffExpenses(props: StaffExpensesProps) {
  return (
    <Expenses
      {...props}
      expenses={getStaffExpenses(Array.isArray(props.expenses) ? props.expenses : [], props.currentUser)}
    />
  );
}
