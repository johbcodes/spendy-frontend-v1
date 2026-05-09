import React, { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { InventoryItem } from '../../../types';
import { INVENTORY_CONDITIONS } from '../rules';
import { ChevronLeftIcon } from 'lucide-react';

interface EditInventoryProps {
  onNavigate: (page: string, id?: string) => void;
  onSave: (id: string, data: Partial<InventoryItem>) => void;
  item: InventoryItem | null;
}

export function EditInventory({ onNavigate, onSave, item }: EditInventoryProps) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        location: item.location,
        condition: item.condition,
        costPerItem: item.costPerItem,
        rentalPrice: item.rentalPrice
      });
    }
  }, [item]);

  if (!item) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => onNavigate('inventory')}>
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Back to Inventory
        </Button>
        <Card className="p-8 text-center">
          <p className="text-gray-500">Item not found</p>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(item.id, {
      ...formData,
      quantity: Number(formData.quantity || 0),
      costPerItem: Number(formData.costPerItem || 0),
      rentalPrice: Number(formData.rentalPrice || 0),
      totalCost: (Number(formData.quantity || item.quantity) * Number(formData.costPerItem || item.costPerItem))
    });
    onNavigate('inventory-detail', item.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('inventory')} className="p-0">
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">Edit Inventory</h1>
          <p className="text-gray-600 mt-1">Update inventory item details</p>
        </div>
      </div>

      <Card className="p-6">

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Item Name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required />

          <div>
            <label className="block text-sm font-medium text-dark-gray mb-1">Description</label>
            <textarea className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure" rows={3} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <Select label="Category" options={[{ value: 'Electronics', label: 'Electronics' }, { value: 'Audio Equipment', label: 'Audio Equipment' }, { value: 'Marketing Materials', label: 'Marketing Materials' }]} value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} required />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity" type="number" value={(formData.quantity ?? '').toString()} onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })} required />
            <Input label="Location" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
          </div>

          <Select label="Condition" options={INVENTORY_CONDITIONS.map(condition => ({ value: condition, label: condition }))} value={(formData.condition as string) || 'Good'} onChange={e => setFormData({ ...formData, condition: e.target.value as any })} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Cost per Item (KES)" type="number" value={(formData.costPerItem ?? '').toString()} onChange={e => setFormData({ ...formData, costPerItem: Number(e.target.value) })} required />
            <Input label="Rental Price (KES)" type="number" value={(formData.rentalPrice ?? '').toString()} onChange={e => setFormData({ ...formData, rentalPrice: Number(e.target.value) })} />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => onNavigate('inventory')}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
