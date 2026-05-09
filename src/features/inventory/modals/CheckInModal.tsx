import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { InventoryItem } from '../../../types';
interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  item: InventoryItem | null;
  clients: any[];
}
export function CheckInModal({
  isOpen,
  onClose,
  onSuccess,
  item,
  clients
}: CheckInModalProps) {
  const [formData, setFormData] = useState({
    quantity: '',
    event: '',
    client: '',
    brand: '',
    receivedFrom: '',
    condition: 'Good',
    notes: ''
  });
  if (!item) return null;
  const selectedClient = clients.find(c => c.id === formData.client);
  const availableBrands = selectedClient?.brands || [];
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({
      itemId: item.id,
      itemName: item.name,
      quantity: Number(formData.quantity),
      event: formData.event,
      client: selectedClient?.name || '',
      brand: formData.brand,
      receivedFrom: formData.receivedFrom,
      condition: formData.condition,
      notes: formData.notes,
      checkinDate: new Date().toISOString().split('T')[0]
    });
    setFormData({
      quantity: '',
      event: '',
      client: '',
      brand: '',
      receivedFrom: '',
      condition: 'Good',
      notes: ''
    });
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Check In Item" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-light-gray p-4 rounded-lg">
          <h3 className="font-semibold text-dark-gray mb-1">{item.name}</h3>
          <p className="text-sm text-gray-600">
            Current quantity: {item.quantity} units
          </p>
        </div>

        <Input label="Quantity to Check In" type="number" min="1" value={formData.quantity} onChange={e => setFormData({
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

        <Input label="Received From" value={formData.receivedFrom} onChange={e => setFormData({
        ...formData,
        receivedFrom: e.target.value
      })} placeholder="Person returning the item" required />

        <Select label="Condition" options={[{
        value: 'Excellent',
        label: 'Excellent'
      }, {
        value: 'Good',
        label: 'Good'
      }, {
        value: 'Fair',
        label: 'Fair'
      }, {
        value: 'Damaged',
        label: 'Damaged'
      }]} value={formData.condition} onChange={e => setFormData({
        ...formData,
        condition: e.target.value
      })} />

        <div>
          <label className="block text-sm font-medium text-dark-gray mb-1">
            Notes
          </label>
          <textarea className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure" rows={3} value={formData.notes} onChange={e => setFormData({
          ...formData,
          notes: e.target.value
        })} placeholder="Additional notes about condition or issues..." />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="info">
            Check In
          </Button>
        </div>
      </form>
    </Modal>;
}
