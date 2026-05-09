import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { InventoryItem, Event } from '../../../types';
import { validateAllocationDates } from '../rules';
interface AllocateInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  inventory: InventoryItem[];
  events: Event[];
}
export function AllocateInventoryModal({
  isOpen,
  onClose,
  onSuccess,
  inventory,
  events
}: AllocateInventoryModalProps) {
  const [formData, setFormData] = useState({
    eventId: '',
    inventoryItems: [] as string[],
    quantity: 1,
    startDate: '',
    endDate: '',
    notes: ''
  });
  const [dateError, setDateError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateAllocationDates(formData.startDate, formData.endDate);
    if (validationError) {
      setDateError(validationError);
      return;
    }
    
    setDateError('');
    onSuccess();
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Allocate Inventory" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Event" options={events.map(event => ({
        value: event.id,
        label: event.name
      }))} value={formData.eventId} onChange={e => setFormData({
        ...formData,
        eventId: e.target.value
      })} required />
        <Select label="Inventory Item" options={inventory.map(item => ({
        value: item.id,
        label: `${item.name} (${item.quantity} available)`
      }))} value={formData.inventoryItems[0] || ''} onChange={e => setFormData({
        ...formData,
        inventoryItems: [e.target.value]
      })} required />
        <Input label="Quantity" type="number" min={1} value={formData.quantity} onChange={e => setFormData({
        ...formData,
        quantity: parseInt(e.target.value)
      })} required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date & Time" type="datetime-local" value={formData.startDate} onChange={e => {
            setFormData({
              ...formData,
              startDate: e.target.value
            });
            setDateError('');
          }} required />
          <Input label="End Date & Time" type="datetime-local" value={formData.endDate} onChange={e => {
            setFormData({
              ...formData,
              endDate: e.target.value
            });
            setDateError('');
          }} required />
        </div>
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
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Allocate</Button>
        </div>
      </form>
    </Modal>;
}
