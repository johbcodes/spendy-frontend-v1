import { ArrowLeftIcon, EditIcon } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DateTimeDisplay } from '../../../utils/dateFormatter';
import { canEditExpense, getExpenseStatusVariant } from '../rules';
import type { Event, Expense, User, Wallet } from '../types';

interface ExpenseDetailProps {
  expense: Expense;
  event?: Event;
  wallet?: Wallet;
  onNavigate: (page: string, id?: string) => void;
  onOpenModal?: (modal: string, data?: any) => void;
  currentUser?: User;
}

export function ExpenseDetail({ expense, event, wallet, onNavigate, onOpenModal, currentUser }: ExpenseDetailProps) {
  const canEdit = canEditExpense(expense, currentUser);
  const isStaff = currentUser?.role === 'Staff';

  return (
    <div className="space-y-6">
      <Button 
        variant="primary" 
        onClick={() => onNavigate('expenses')} 
        className="flex items-center gap-2 !bg-azure !text-white !shadow-none hover:!bg-azure/90"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Expenses
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">{expense.title}</h1>
          <p className="text-gray-600 mt-1">{expense.category}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={getExpenseStatusVariant(expense.status)}>{expense.status}</Badge>
            {expense.expenseType && <Badge variant="default">{expense.expenseType}</Badge>}
            {canEdit && onOpenModal && (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => onOpenModal('edit-expense', expense)} 
                className="ml-2 !bg-primary/10 !text-azure !shadow-none hover:!bg-primary/20"
              >
                <EditIcon className="w-3 h-3 mr-1" />
                Edit Expense
              </Button>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Amount</p>
          <p className="text-3xl font-bold text-dark-gray">KES {expense.amount.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2">
          <p className="text-sm text-gray-500">Event / Activation</p>
          <p className="text-lg font-semibold text-dark-gray">{expense.eventName || 'N/A'}</p>
          {event?.type && <p className="text-xs text-gray-500">{event.type}</p>}
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-sm text-gray-500">Wallet</p>
          <p className="text-lg font-semibold text-dark-gray">{wallet?.name || 'Not Linked'}</p>
          {wallet?.type && <p className="text-xs text-gray-500">{wallet.type}</p>}
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-sm text-gray-500">Client</p>
          <p className="text-lg font-semibold text-dark-gray">{expense.client}</p>
          {expense.supplier && <p className="text-xs text-gray-500">Supplier: {expense.supplier}</p>}
        </Card>
      </div>

      <Card className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Start Date</p>
          <DateTimeDisplay dateTime={expense.startDate} />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Due Date</p>
          <DateTimeDisplay dateTime={expense.dueDate} />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Created By</p>
          <p className="font-semibold text-dark-gray">{expense.createdBy}</p>
        </div>
        {!isStaff && event && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Event Budget</p>
            <p className="font-semibold text-dark-gray">KES {event.budget.toLocaleString()}</p>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <p className="text-sm text-gray-500 mb-2">Notes</p>
        <p className="text-dark-gray whitespace-pre-line">{expense.description || 'No additional description provided.'}</p>
      </Card>
    </div>
  );
}
