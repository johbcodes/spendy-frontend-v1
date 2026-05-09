import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Request } from '../../../types';
import { EXPENSE_CATEGORIES } from '../../../utils/constants';

interface EditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (requestId: string, data: Partial<Request>) => void;
  request: Request | null;
}

export function EditRequestModal({
  isOpen,
  onClose,
  onSuccess,
  request
}: EditRequestModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen && request) {
      setFormData({
        name: request.name || '',
        category: request.category || '',
        amount: request.amount?.toString() || '',
        description: request.description || ''
      });
    }
  }, [isOpen, request]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;

    onSuccess(request.id, {
      name: formData.name,
      category: formData.category,
      amount: Number(formData.amount),
      description: formData.description
    });

    onClose();
  };

  if (!request) return null;

  // Get categories based on request type
  const getCategories = () => {
    if (request.type === 'Operation') {
      return ['Logistics', 'Setup', 'Breakdown', 'Transportation', 'Staff Costs', 'Office Supplies', 'Utilities', 'Other'];
    } else if (request.type === 'Project') {
      return ['Corporate Event', 'Product Launch', 'Conference', 'Workshop', 'Trade Show', 'Other'];
    } else {
      // Activation categories
      return EXPENSE_CATEGORIES;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Request" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Type:</strong> {request.type} | <strong>Status:</strong> {request.status}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Only the name, category, amount, and description can be edited. The request type and status remain unchanged.
          </p>
        </div>

        <Input
          label="Request Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Select
          label="Category"
          options={[
            { value: '', label: 'Select category' },
            ...getCategories().map(cat => ({ value: cat, label: cat }))
          ]}
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        />

        <Input
          label="Amount (KES)"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-dark-gray mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Update Request</Button>
        </div>
      </form>
    </Modal>
  );
}

