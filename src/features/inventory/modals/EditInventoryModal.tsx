import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { INVENTORY_CONDITIONS } from '../rules';
import { InventoryItem } from '../../../types';
interface EditInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: Partial<InventoryItem>) => void;
  item?: InventoryItem;
}
export function EditInventoryModal({
  isOpen,
  onClose,
  onSuccess,
  item
}: EditInventoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: '',
    location: '',
    condition: 'Excellent',
    costPerItem: '',
    rentalPrice: ''
  });
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || '',
        quantity: item.quantity != null ? item.quantity.toString() : '',
        location: item.location || '',
        condition: item.condition || 'Excellent',
        costPerItem: item.costPerItem != null ? item.costPerItem.toString() : '',
        rentalPrice: item.rentalPrice != null ? item.rentalPrice.toString() : ''
      });
    }
  }, [item]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({
      ...formData,
      quantity: Number(formData.quantity),
      costPerItem: Number(formData.costPerItem),
      rentalPrice: Number(formData.rentalPrice),
      totalCost: Number(formData.quantity) * Number(formData.costPerItem),
      condition: formData.condition as 'Excellent' | 'Good' | 'Fair' | 'Damaged'
    });
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Edit Inventory Item" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Item Name" value={formData.name} onChange={e => setFormData({
        ...formData,
        name: e.target.value
      })} required />

        <div>
          <label className="block text-sm font-medium text-dark-gray mb-1">
            Description
          </label>
          <textarea className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure" rows={3} value={formData.description} onChange={e => setFormData({
          ...formData,
          description: e.target.value
        })} />
        </div>

        <Select label="Category" options={[{
        value: 'Electronics',
        label: 'Electronics'
      }, {
        value: 'Audio Equipment',
        label: 'Audio Equipment'
      }, {
        value: 'Marketing Materials',
        label: 'Marketing Materials'
      }]} value={formData.category} onChange={e => setFormData({
        ...formData,
        category: e.target.value
      })} required />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Quantity" type="number" value={formData.quantity} onChange={e => setFormData({
          ...formData,
          quantity: e.target.value
        })} required />
          <Input label="Location" value={formData.location} onChange={e => setFormData({
          ...formData,
          location: e.target.value
        })} required />
        </div>

        <Select label="Condition" options={INVENTORY_CONDITIONS.map(c => ({
        value: c,
        label: c
      }))} value={formData.condition} onChange={e => setFormData({
        ...formData,
        condition: e.target.value
      })} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Cost per Item (KES)" type="number" value={formData.costPerItem} onChange={e => setFormData({
          ...formData,
          costPerItem: e.target.value
        })} required />
          <Input label="Rental Price (KES)" type="number" value={formData.rentalPrice} onChange={e => setFormData({
          ...formData,
          rentalPrice: e.target.value
        })} />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Update Item</Button>
        </div>
      </form>
    </Modal>;
}
