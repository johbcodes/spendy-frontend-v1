import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Event } from '../../../types';
import { UploadIcon } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../../../utils/constants';
import { isPastDate } from '../../../utils/dateFormatter';

interface RequestPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  events: Event[];
}

export function RequestPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  events
}: RequestPaymentModalProps) {
  // Normalize events prop to ensure it's an array
  const eventsArray = Array.isArray(events) ? events : (events as any)?.data || [];

  const [expenseGroup, setExpenseGroup] = useState<'Project Expenses' | 'Operational Expense' | 'Activation Expense'>('Project Expenses');
  const [formData, setFormData] = useState({
    title: '',
    event: '',
    category: '',
    amount: '',
    date: '',
    notes: '',
    requestApproval: true
  });
  const [dateError, setDateError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate date is not in the past
    if (isPastDate(formData.date)) {
      setDateError('Payment request date cannot be in the past');
      return;
    }
    
    setDateError('');
    
    onSuccess({
      ...formData,
      amount: Number(formData.amount),
      eventId: formData.event,
      startDate: formData.date,
      dueDate: formData.date,
      status: formData.requestApproval ? 'Pending' : 'Approved',
      expenseType: expenseGroup
    });
  };

  const getExpenseLabel = () => {
    switch (expenseGroup) {
      case 'Project Expenses':
        return 'Event Expense';
      case 'Operational Expense':
        return 'Operational Expense';
      case 'Activation Expense':
        return 'Activation Expense';
      default:
        return 'Expense';
    }
  };

  const getEventLabel = () => {
    switch (expenseGroup) {
      case 'Project Expenses':
        return 'Project';
      case 'Operational Expense':
        return 'Department/Operation';
      case 'Activation Expense':
        return 'Activation';
      default:
        return 'Project';
    }
  };

  // Filter events based on expense group
  const filteredEvents = eventsArray.filter(e => {
    if (expenseGroup === 'Project Expenses') return e.type === 'Project';
    if (expenseGroup === 'Activation Expense') return e.type === 'Activation';
    return true; // Operational expenses can be linked to any
  });

  // Get categories based on expense group
  const getCategories = () => {
    if (expenseGroup === 'Operational Expense') {
      return ['Logistics', 'Setup', 'Breakdown', 'Transportation', 'Staff Costs', 'Office Supplies', 'Utilities', 'Other'];
    } else if (expenseGroup === 'Project Expenses') {
      return ['Corporate Event', 'Product Launch', 'Conference', 'Workshop', 'Trade Show', 'Other'];
    } else {
      // Activation categories
      return EXPENSE_CATEGORIES;
    }
  };

  return <Modal isOpen={isOpen} onClose={onClose} title="Request Expense Payment" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Expense Group" options={[{
        value: 'Project Expenses',
        label: 'Project Expenses'
      }, {
        value: 'Operational Expense',
        label: 'Operational Expense'
      }, {
        value: 'Activation Expense',
        label: 'Activation Expense'
      }]} value={expenseGroup} onChange={e => {
        setExpenseGroup(e.target.value as any);
        setFormData({
          title: '',
          event: '',
          category: '',
          amount: '',
          date: '',
          notes: '',
          requestApproval: true
        });
      }} required />

        <Input label={`${getExpenseLabel()} Title`} value={formData.title} onChange={e => setFormData({
        ...formData,
        title: e.target.value
      })} required />

        <Select label={getEventLabel()} options={[{
        value: '',
        label: `Select ${getEventLabel().toLowerCase()}`
      }, ...filteredEvents.map(e => ({
        value: e.id,
        label: e.name
      }))]} value={formData.event} onChange={e => setFormData({
        ...formData,
        event: e.target.value
      })} required />

        <Select label="Category" options={[{
        value: '',
        label: 'Select category'
      }, ...getCategories().map(cat => ({
        value: cat,
        label: cat
      }))]} value={formData.category} onChange={e => setFormData({
        ...formData,
        category: e.target.value
      })} required />

        <Input label="Amount (KES)" type="number" value={formData.amount} onChange={e => setFormData({
        ...formData,
        amount: e.target.value
      })} required />

        <Input label="Date & Time Incurred" type="datetime-local" value={formData.date} onChange={e => {
          setFormData({
            ...formData,
            date: e.target.value
          });
          setDateError('');
        }} required />

        {dateError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">{dateError}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-dark-gray mb-1">
            Notes
          </label>
          <textarea className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure" rows={3} value={formData.notes} onChange={e => setFormData({
          ...formData,
          notes: e.target.value
        })} />
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-azure transition-colors">
          <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Upload Receipt</p>
          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 10MB)</p>
        </div>

        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={formData.requestApproval} onChange={e => setFormData({
          ...formData,
          requestApproval: e.target.checked
        })} className="rounded" />
          <span className="text-sm text-dark-gray">
            Request approval for this expense
          </span>
        </label>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Submit {getExpenseLabel()}</Button>
        </div>
      </form>
    </Modal>;
}