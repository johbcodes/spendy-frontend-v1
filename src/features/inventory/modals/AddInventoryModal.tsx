import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { INVENTORY_CONDITIONS } from '../rules';
import { UploadIcon, ImageIcon } from 'lucide-react';
interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}
export function AddInventoryModal({
  isOpen,
  onClose,
  onSuccess
}: AddInventoryModalProps) {
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({
      ...formData,
      quantity: Number(formData.quantity),
      costPerItem: Number(formData.costPerItem),
      rentalPrice: Number(formData.rentalPrice),
      totalCost: Number(formData.quantity) * Number(formData.costPerItem),
      image: imagePreview,
      checkoutStatus: 'available'
    });
    setFormData({
      name: '',
      description: '',
      category: '',
      quantity: '',
      location: '',
      condition: 'Excellent',
      costPerItem: '',
      rentalPrice: ''
    });
    setImagePreview(null);
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Add Inventory Item" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-gray mb-2">
            Item Image
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="item-image" />
            <label htmlFor="item-image" className="cursor-pointer">
              {imagePreview ? <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover mx-auto rounded-lg mb-2" /> : <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />}
              <p className="text-sm text-gray-600">
                {imagePreview ? 'Click to change image' : 'Click to upload image'}
              </p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 5MB)</p>
            </label>
          </div>
        </div>

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
        })} required />
        </div>

        <Select label="Category" options={[{
        value: '',
        label: 'Select category'
      }, {
        value: 'Electronics',
        label: 'Electronics'
      }, {
        value: 'Audio Equipment',
        label: 'Audio Equipment'
      }, {
        value: 'Marketing Materials',
        label: 'Marketing Materials'
      }, {
        value: 'Furniture',
        label: 'Furniture'
      }, {
        value: 'Lighting',
        label: 'Lighting'
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
          <Button type="submit">Add Item</Button>
        </div>
      </form>
    </Modal>;
}
