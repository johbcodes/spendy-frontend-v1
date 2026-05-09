import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { InventoryItem } from '../../../types';
import { ArrowUpIcon, ChevronLeftIcon, PackageIcon } from 'lucide-react';

interface CheckOutProps {
  item: InventoryItem | null;
  events?: any[];
  onNavigate: (page: string, id?: string) => void;
  onCheckOut: (data: any) => void;
}

export function CheckOut({ item, events = [], onNavigate, onCheckOut }: CheckOutProps) {
  const [quantity, setQuantity] = useState('1');
  const [eventId, setEventId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [dateError, setDateError] = useState('');

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

  const quantityToCheckOut = Number(quantity) || 0;
  const isValid = quantityToCheckOut > 0 && quantityToCheckOut <= item.quantity && eventId.trim();
  const selectedEvent = events.find(e => e.id === eventId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDateError('');

    if (!isValid) {
      setDateError('Please fill in all required fields and ensure quantity does not exceed available stock');
      return;
    }

    onCheckOut({
      itemId: item.id,
      quantity: quantityToCheckOut,
      event: selectedEvent?.name || 'Unknown Event',
      eventId: eventId,
      purpose: purpose,
      checkoutDate: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="secondary" onClick={() => onNavigate('inventory')}>
            <ChevronLeftIcon className="w-4 h-4 mr-2" />
            Back to Inventory
          </Button>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">Check Out Item</h1>
          <p className="text-gray-600 mt-1">Remove item from inventory</p>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        {/* Item Information */}
        <div className="bg-light-gray p-4 rounded-lg">
          <div className="flex items-center gap-4">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <PackageIcon className="w-10 h-10 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-dark-gray">{item.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              <div className="mt-2 text-sm">
                <span className="text-gray-600">Category: </span>
                <span className="font-medium text-dark-gray">{item.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Information */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-blue-50 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Available Quantity</p>
            <p className="text-2xl font-bold text-azure">{item.quantity - (item.checkedOut || 0)}</p>
          </Card>
          <Card className="p-4 bg-green-50 border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Cost Per Item</p>
            <p className="text-xl font-bold text-green-600">KES {item.costPerItem.toLocaleString()}</p>
          </Card>
          <Card className="p-4 bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-gray-600 mb-1">Rental Price</p>
            <p className="text-xl font-bold text-yellow-600">KES {item.rentalPrice.toLocaleString()}</p>
          </Card>
        </div>

        {/* Check Out Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Quantity to Check Out *"
            type="number"
            min="1"
            max={item.quantity}
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setDateError('');
            }}
            required
          />

          <Select
            label="Event *"
            value={eventId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setEventId(e.target.value);
              setDateError('');
            }}
            options={[
              { value: '', label: 'Select an event' },
              ...events.map(e => ({
                value: e.id,
                label: `${e.name} (${e.type})`
              }))
            ]}
            required
          />

          <div>
            <label className="block text-sm font-medium text-dark-gray mb-1">
              Purpose / Notes
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure focus:border-transparent"
              rows={4}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="What is this item being used for?"
            />
          </div>

          {/* Summary */}
          {quantityToCheckOut > 0 && quantityToCheckOut <= item.quantity && (
            <Card className="p-4 bg-blue-50 border border-blue-200">
              <p className="text-sm text-gray-600 mb-2">Summary</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Item:</span>
                  <span className="font-medium text-dark-gray">{item.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium text-dark-gray">{quantityToCheckOut} unit(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining After:</span>
                  <span className="font-medium text-dark-gray">{item.quantity - quantityToCheckOut} unit(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="font-bold text-azure">KES {(quantityToCheckOut * item.costPerItem).toLocaleString()}</span>
                </div>
              </div>
            </Card>
          )}

          {dateError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{dateError}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onNavigate('inventory')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className={!isValid ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <ArrowUpIcon className="w-4 h-4 mr-2" />
              Confirm Check Out
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
