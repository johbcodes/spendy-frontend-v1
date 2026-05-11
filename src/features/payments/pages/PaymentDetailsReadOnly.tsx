import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Payment, Expense, Wallet, User } from '../../../types';
import { ArrowLeftIcon, CreditCardIcon } from 'lucide-react';
import { DateTimeDisplay } from '../../../utils/dateFormatter.tsx';

interface PaymentDetailsReadOnlyProps {
  payment: Payment;
  expense?: Expense;
  wallet?: Wallet;
  expenses?: Expense[];
  currentUser?: User;
  onNavigate: (page: string, id?: string) => void;
}

export function PaymentDetailsReadOnly({
  payment,
  expense,
  wallet,
  expenses = [],
  currentUser,
  onNavigate
}: PaymentDetailsReadOnlyProps) {
  // Check if user is Staff
  const isStaff = currentUser?.role === 'Staff';

  // Get status variant for badge
  const getStatusVariant = (status: string) => {
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

  return (
    <div className="min-h-screen bg-light-gray p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="primary" size="sm" onClick={() => onNavigate('payments')} className="!bg-azure !text-white !shadow-none hover:!bg-azure/90">
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-dark-gray">Payment Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Payment Summary Card */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-dark-gray mb-4">Payment Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-medium">{payment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recipient:</span>
                    <span className="font-medium">{payment.recipient}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="text-lg font-bold text-primary">KES {payment.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{payment.type || 'M-Pesa'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">M-Pesa Code:</span>
                    <span className="font-medium">{payment.mpesaCode || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={getStatusVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium">
                      <DateTimeDisplay dateTime={payment.dateTime} />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Initiated By:</span>
                    <span className="font-medium">{payment.initiatedBy}</span>
                  </div>
                </div>
              </Card>

              {/* Event Information */}
              {payment.eventName && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-dark-gray mb-4">Event Information</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event Name:</span>
                      <span className="font-medium">{payment.eventName}</span>
                    </div>
                    {payment.eventId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Event ID:</span>
                        <span className="font-medium">{payment.eventId}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Expense Information */}
              {expense && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-dark-gray mb-4">Expense Details</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expense Title:</span>
                      <span className="font-medium">{expense.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{expense.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={getStatusVariant(expense.status)}>
                        {expense.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created By:</span>
                      <span className="font-medium">{expense.createdBy}</span>
                    </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">
                      {(() => {
                        const date = new Date(expense.startDate);
                        // Convert to Nairobi timezone (UTC+3)
                        const nairobiTime = new Date(date.getTime() + (3 * 60 * 60 * 1000));
                        // Format date as dd/mm/year with short month name
                        const day = nairobiTime.getDate().toString().padStart(2, '0');
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const month = monthNames[nairobiTime.getMonth()];
                        const year = nairobiTime.getFullYear();
                        return `${day}/${month}/${year}`;
                      })()}
                    </span>
                  </div>
                  </div>
                </Card>
              )}

              {/* Wallet Information - Hide for staff users */}
              {wallet && !isStaff && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-dark-gray mb-4">Wallet Information</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wallet Name:</span>
                      <span className="font-medium">{wallet.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wallet Type:</span>
                      <span className="font-medium">{wallet.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Balance:</span>
                      <span className="font-medium">KES {wallet.balance.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Description */}
              {payment.description && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-dark-gray mb-4">Additional Information</h2>
                  <p className="text-gray-700">{payment.description}</p>
                </Card>
              )}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6 space-y-4">
              <h3 className="font-semibold text-dark-gray flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5 text-primary" />
                Payment Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Amount</p>
                  <p className="text-xl font-bold text-dark-gray">KES {payment.amount.toLocaleString()}</p>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-gray-600">Status</p>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-gray-600">Payment Method</p>
                  <div className="mt-1">
                    <Badge variant="info">
                      {payment.type || 'M-Pesa'}
                    </Badge>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-gray-600">Date Processed</p>
                  <p className="font-medium text-dark-gray">
                    <DateTimeDisplay dateTime={payment.dateTime} />
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="primary"
                  className="w-full !bg-azure !text-white !shadow-none hover:!bg-azure/90"
                  onClick={() => onNavigate('payments')}
                >
                  Back to Payments
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
