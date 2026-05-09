import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { InventoryItem } from '../../../types';
import { isPastDate } from '../../../utils/dateFormatter';
interface CheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  item: InventoryItem | null;
  clients: any[];
}
export function CheckOutModal({
  isOpen,
  onClose,
  onSuccess,
  item,
  clients
}: CheckOutModalProps) {
  const [formData, setFormData] = useState({
    quantity: '',
    event: '',
    client: '',
    brand: '',
    givenTo: '',
    notes: '',
    expectedReturnDate: ''
  });
  const [dateError, setDateError] = useState('');

  if (!item) return null;
  const selectedClient = clients.find(c => c.id === formData.client);
  const availableBrands = selectedClient?.brands || [];
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate expected return date is not in the past
    if (formData.expectedReturnDate && isPastDate(formData.expectedReturnDate)) {
      setDateError('Expected return date cannot be in the past');
      return;
    }
    
    setDateError('');
    
    onSuccess({
      itemId: item.id,
      itemName: item.name,
      quantity: Number(formData.quantity),
      event: formData.event,
      client: selectedClient?.name || '',
      brand: formData.brand,
      givenTo: formData.givenTo,
      notes: formData.notes,
      expectedReturnDate: formData.expectedReturnDate,
      checkoutDate: new Date().toISOString().split('T')[0]
    });
    setFormData({
      quantity: '',
      event: '',
      client: '',
      brand: '',
      givenTo: '',
      notes: '',
      expectedReturnDate: ''
    });
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Check Out Item" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-light-gray p-4 rounded-lg">
          <h3 className="font-semibold text-dark-gray mb-1">{item.name}</h3>
          <p className="text-sm text-gray-600">
            Available: {item.quantity} units
          </p>
        </div>

        <Input label="Quantity to Check Out" type="number" min="1" max={item.quantity} value={formData.quantity} onChange={e => setFormData({
        ...formData,
        quantity: e.target.value
      })} required />

        <Input label="Event Name" value={formData.event} onChange={e => setFormData({
        ...formData,
        event: e.target.value
      })} required />

        <Select label="Client Name" options={[{
        value: '',
        label: 'Select client'
      }, ...clients.map(client => ({
        value: client.id,
        label: client.name
      }))]} value={formData.client} onChange={e => {
        setFormData({
          ...formData,
          client: e.target.value,
          brand: ''
        });
      }} required />

        {formData.client && availableBrands.length > 0 && <Select label="Brand Name" options={[{
        value: '',
        label: 'Select brand'
      }, ...availableBrands.map((brand: string) => ({
        value: brand,
        label: brand
      }))]} value={formData.brand} onChange={e => setFormData({
        ...formData,
        brand: e.target.value
      })} />}

        <Input label="Given To" value={formData.givenTo} onChange={e => setFormData({
        ...formData,
        givenTo: e.target.value
      })} placeholder="Person receiving the item" required />

        <Input label="Expected Return Date & Time" type="datetime-local" value={formData.expectedReturnDate} onChange={e => {
          setFormData({
            ...formData,
            expectedReturnDate: e.target.value
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
        })} placeholder="Additional notes..." />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="success">
            Check Out
          </Button>
        </div>
      </form>
    </Modal>;
}
