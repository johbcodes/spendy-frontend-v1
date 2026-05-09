import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { InventoryItem } from '../../../types';
import { ArrowDownIcon, ChevronLeftIcon, PackageIcon } from 'lucide-react';

interface CheckInProps {
  item: InventoryItem | null;
  movements?: any[];
  events?: any[];
  onNavigate: (page: string, id?: string) => void;
  onCheckIn: (data: any) => void;
}

export function CheckIn({ item, movements = [], events = [], onNavigate, onCheckIn }: CheckInProps) {
  const [quantity, setQuantity] = useState('1');
  const [eventId, setEventId] = useState('');
  const [conditionQuantities, setConditionQuantities] = useState({
    Excellent: 0,
    Good: 0,
    Fair: 0,
    Damaged: 0
  });
  const [notes, setNotes] = useState('');
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

  // Check if item has any checkout records
  const itemCheckouts = movements.filter(m => m.itemId === item.id && m.type === 'Check Out');
  const hasCheckedOut = itemCheckouts.length > 0;

  const quantityToCheckIn = Number(quantity) || 0;
  const totalConditionQuantity = Object.values(conditionQuantities).reduce((sum, qty) => sum + qty, 0);
  const isValid = quantityToCheckIn > 0 && hasCheckedOut && totalConditionQuantity === quantityToCheckIn;

  const selectedEvent = events.find(e => e.id === eventId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDateError('');

    if (!hasCheckedOut) {
      setDateError('Cannot check in - this item has not been checked out');
      return;
    }

    if (!isValid) {
      if (totalConditionQuantity !== quantityToCheckIn) {
        setDateError('Condition quantities must total the quantity to check in');
      } else {
        setDateError('Please enter a valid quantity');
      }
      return;
    }

    onCheckIn({
      itemId: item.id,
      quantity: quantityToCheckIn,
      event: selectedEvent?.name || notes || 'N/A',
      eventId: eventId,
      conditionQuantities: conditionQuantities,
      notes: notes,
      checkinDate: new Date().toISOString()
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
          <h1 className="text-2xl font-bold text-dark-gray">Check In Item</h1>
          <p className="text-gray-600 mt-1">Return item to inventory</p>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        {!hasCheckedOut && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-700">
              ⚠️ This item has not been checked out yet. You can only check in items that have been previously checked out.
            </p>
          </div>
        )}

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

        {/* Current Status */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-blue-50 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Current Quantity</p>
            <p className="text-2xl font-bold text-azure">{item.quantity}</p>
          </Card>
          <Card className="p-4 bg-purple-50 border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Checked Out</p>
            <p className="text-lg font-bold text-purple-600">{item.checkedOut || 0}</p>
          </Card>
          <Card className="p-4 bg-green-50 border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <p className="text-lg font-bold text-green-600">{item.checkoutStatus || 'Available'}</p>
          </Card>
        </div>

        {/* Check In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Quantity to Check In *"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setDateError('');
            }}
            required
          />

          <Select
            label="Event"
            value={eventId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setEventId(e.target.value);
              setDateError('');
            }}
            options={[
              { value: '', label: 'Select an event (optional)' },
              ...events.map(e => ({
                value: e.id,
                label: `${e.name} (${e.type})`
              }))
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-dark-gray mb-2">
              Item Condition Breakdown *
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Distribute the {quantityToCheckIn} item{quantityToCheckIn !== 1 ? 's' : ''} across different conditions. Total must equal {quantityToCheckIn}.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(conditionQuantities).map(([condition, qty]) => (
                <div key={condition} className="space-y-1">
                  <label className="block text-sm text-gray-600">{condition}</label>
                  <Input
                    type="number"
                    min="0"
                    value={qty}
                    onChange={(e) => {
                      const newQty = Number(e.target.value) || 0;
                      setConditionQuantities(prev => ({
                        ...prev,
                        [condition]: newQty
                      }));
                      setDateError('');
                    }}
                  />
                </div>
              ))}
            </div>
            {totalConditionQuantity !== quantityToCheckIn && quantityToCheckIn > 0 && (
              <p className="text-sm text-red-600 mt-2">
                Total condition quantities ({totalConditionQuantity}) must equal quantity to check in ({quantityToCheckIn})
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-gray mb-1">
              Notes / Damage Report
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure focus:border-transparent"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any damage, maintenance required, or other notes?"
            />
          </div>

          {/* Summary */}
          {quantityToCheckIn > 0 && (
            <Card className="p-4 bg-green-50 border border-green-200">
              <p className="text-sm text-gray-600 mb-2">Summary</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Item:</span>
                  <span className="font-medium text-dark-gray">{item.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity to Check In:</span>
                  <span className="font-medium text-dark-gray">{quantityToCheckIn} unit(s)</span>
                </div>
                {Object.entries(conditionQuantities).some(([_, qty]) => qty > 0) && (
                  <div className="space-y-1 mt-2">
                    <p className="text-xs text-gray-600 font-medium">Condition Breakdown:</p>
                    {Object.entries(conditionQuantities)
                      .filter(([_, qty]) => qty > 0)
                      .map(([condition, qty]) => (
                        <div key={condition} className="flex justify-between ml-2">
                          <span className="text-gray-600">{condition}:</span>
                          <span className="font-medium text-dark-gray">{qty} unit(s)</span>
                        </div>
                      ))}
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Quantity:</span>
                  <span className="font-medium text-dark-gray">{item.quantity} unit(s)</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600 font-medium">Total After Check In:</span>
                  <span className="font-bold text-green-600">{item.quantity + quantityToCheckIn} unit(s)</span>
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
              disabled={!isValid || !hasCheckedOut}
              className={(!isValid || !hasCheckedOut) ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <ArrowDownIcon className="w-4 h-4 mr-2" />
              Confirm Check In
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
