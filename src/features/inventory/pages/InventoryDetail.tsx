
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table, Column } from '../../../components/ui/Table';
import { InventoryItem, User } from '../../../types';
import { PackageIcon, EditIcon, ArrowUpIcon, ArrowDownIcon, ArrowLeftIcon, CheckIcon, XIcon } from 'lucide-react';
import type { InventoryMovementDraft } from '../rules';

interface InventoryDetailProps {
  item: InventoryItem;
  onNavigate: (page: string, id?: string) => void;
  onOpenModal: (modal: string, data?: any) => void;
  movements: InventoryMovementDraft[];
  currentUser: User;
}
export function InventoryDetail({
  item,
  onNavigate,
  onOpenModal,
  movements,
  currentUser: _currentUser
}: InventoryDetailProps) {
  const getConditionVariant = (condition: string) => {
    switch (condition) {
      case 'Excellent':
        return 'success';
      case 'Good':
        return 'info';
      case 'Fair':
        return 'warning';
      case 'Damaged':
        return 'danger';
      default:
        return 'default';
    }
  };
  const columns: Column<InventoryMovementDraft>[] = [{
    key: 'date',
    label: 'Date',
    sortable: true,
    render: movement => new Date(movement.date).toLocaleString()
  }, {
    key: 'type',
    label: 'Type',
    render: movement => <Badge variant={movement.type === 'Check Out' ? 'warning' : 'success'}>
          {movement.type}
        </Badge>
  }, {
    key: 'quantity',
    label: 'Quantity',
    render: movement => <span className={movement.type === 'Check Out' ? 'text-red-600' : 'text-green-600'}>
          {movement.type === 'Check Out' ? '-' : '+'}
          {movement.quantity}
        </span>
  }, {
    key: 'event',
    label: 'Event',
    render: movement => movement.event || 'N/A'
  }, {
    key: 'givenBy',
    label: 'Given By / Received By',
    render: movement => {
      if (movement.type === 'Check Out') {
        return (
          <div>
            <p className="font-medium">Given To: {movement.givenBy || 'Unknown'}</p>
            <p className="text-xs text-gray-500">Event: {movement.event || 'N/A'}</p>
          </div>
        );
      } else {
        return (
          <div>
            <p className="font-medium">Received From: {movement.receivedBy || 'Unknown'}</p>
            <p className="text-xs text-gray-500">Event: {movement.event || 'N/A'}</p>
            {movement.condition && (
              <p className="text-xs text-gray-500">Condition: <Badge variant={getConditionVariant(movement.condition)}>{movement.condition}</Badge></p>
            )}
          </div>
        );
      }
    }
  }, {
    key: 'balance',
    label: 'Balance',
    render: movement => movement.balance
  }, {
    key: 'cost',
    label: 'Cost',
    render: movement => `KES ${movement.cost?.toLocaleString() || '0'}`
  }];
  const checkedOut = movements.filter(m => m.type === 'Check Out').reduce((sum, m) => sum + m.quantity, 0);
  const checkedIn = movements.filter(m => m.type === 'Check In').reduce((sum, m) => sum + m.quantity, 0);

  // Calculate current available quantity
  const currentAvailable = item.quantity - checkedOut;

  // Calculate condition counts from movements
  const conditionStats = {
    Excellent: 0,
    Good: 0,
    Fair: 0,
    Damaged: 0
  };

  movements.forEach(movement => {
    if (movement.condition && movement.type === 'Check In') {
      conditionStats[movement.condition] += movement.quantity;
    }
  });

  // Count total checkouts and checkins
  const totalCheckouts = movements.filter(m => m.type === 'Check Out').length;
  const totalCheckins = movements.filter(m => m.type === 'Check In').length;

  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('inventory')}>
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-dark-gray">{item.name}</h1>
            <p className="text-gray-600 mt-1">{item.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => onNavigate('edit-inventory', item.id)}>
            <EditIcon className="w-4 h-4" />
            Edit
          </Button>
          <Button variant="success" onClick={() => onNavigate('checkout', item.id)}>
            <ArrowUpIcon className="w-4 h-4" />
            Check Out
          </Button>
          <Button variant="info" onClick={() => onNavigate('checkin', item.id)}>
            <ArrowDownIcon className="w-4 h-4" />
            Check In
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
              <PackageIcon className="w-6 h-6 text-azure" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Inventory</p>
          <p className="text-3xl font-bold text-dark-gray">{item.totalInventoryAdded || item.quantity}</p>
          <p className="text-xs text-gray-500 mt-1">
            Value: KES {Number((item.totalInventoryAdded || item.quantity) * item.costPerItem).toLocaleString()}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <ArrowDownIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Checked In Items</p>
          <p className="text-3xl font-bold text-green-600">{checkedIn}</p>
          <p className="text-xs text-gray-500 mt-1">
            Value: KES {Number(checkedIn * item.costPerItem).toLocaleString()}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <ArrowUpIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Checked Out Items</p>
          <p className="text-3xl font-bold text-yellow-600">{checkedOut}</p>
          <p className="text-xs text-gray-500 mt-1">
            Value: KES {Number(checkedOut * item.costPerItem).toLocaleString()}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-azure bg-opacity-10 rounded-lg">
              <PackageIcon className="w-6 h-6 text-azure" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Current Available</p>
          <p className="text-3xl font-bold text-dark-gray">{currentAvailable}</p>
          <p className="text-xs text-gray-500 mt-1">
            Value: KES {Number(currentAvailable * item.costPerItem).toLocaleString()}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-dark-gray mb-4">Item Details & Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <p className="text-xs text-gray-600 mb-1">Category</p>
            <p className="text-sm font-semibold">{item.category}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Location</p>
            <p className="text-sm font-semibold">{item.location}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Condition</p>
            <Badge variant={getConditionVariant(item.condition)}>
              {item.condition}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Cost Per Item</p>
            <p className="text-sm font-semibold">
              KES {item.costPerItem.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Rental Price</p>
            <p className="text-sm font-semibold">
              KES {item.rentalPrice.toLocaleString()}
            </p>
          </div>
        </div>

        <h4 className="text-md font-semibold text-dark-gray mb-3">Movement Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-blue-50 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Total Checkouts</p>
            <p className="text-2xl font-bold text-blue-600">{totalCheckouts}</p>
            <p className="text-xs text-gray-500 mt-1">Since day 1</p>
          </Card>
          <Card className="p-4 bg-green-50 border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Total Checkins</p>
            <p className="text-2xl font-bold text-green-600">{totalCheckins}</p>
            <p className="text-xs text-gray-500 mt-1">Since day 1</p>
          </Card>
          <Card className="p-4 bg-purple-50 border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Items by Condition</p>
            <div className="space-y-1 mt-2">
              <div className="flex items-center gap-2">
                <CheckIcon className="w-3 h-3 text-green-600" />
                <span className="text-xs">Excellent: {conditionStats.Excellent}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-3 h-3 text-blue-600" />
                <span className="text-xs">Good: {conditionStats.Good}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-3 h-3 text-yellow-600" />
                <span className="text-xs">Fair: {conditionStats.Fair}</span>
              </div>
              <div className="flex items-center gap-2">
                <XIcon className="w-3 h-3 text-red-600" />
                <span className="text-xs">Damaged: {conditionStats.Damaged}</span>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-dark-gray mb-4">Movement History</h3>
        <Table columns={columns} data={movements} />
      </Card>
    </div>;
}
