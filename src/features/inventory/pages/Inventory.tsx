import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, Column } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { InventoryItem, User } from '../../../types';
import { PlusIcon, SearchIcon, PackageIcon, ArrowDownIcon, ArrowUpIcon, BoxIcon, EditIcon, EyeIcon, TrashIcon } from 'lucide-react';
import { exportToCSV, exportToPDF, exportToExcel } from '../../../utils/exportUtils';
import { ExportButton } from '../../../components/ui/ExportButton';
import { filterInventory, getInventoryConditionVariant, summarizeInventory } from '../rules';
import type { InventoryFilters } from '../types';
interface InventoryProps {
  onOpenModal: (modal: string, data?: any) => void;
  inventory: InventoryItem[];
  onNavigate: (page: string, id?: string) => void;
  onDeleteInventory: (id: string) => void;
  currentUser: User;
}
export function Inventory({
  onOpenModal,
  inventory,
  onNavigate,
  onDeleteInventory,
  currentUser: _currentUser
}: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<InventoryFilters['status']>('all');
  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    const exportData = filteredInventory.map(i => ({
      Name: i.name,
      Description: i.description,
      Quantity: i.quantity,
      Location: i.location,
      Condition: i.condition,
      'Cost Per Item': i.costPerItem,
      'Total Cost': i.totalCost,
      'Rental Price': i.rentalPrice
    }));
    switch (format) {
      case 'csv':
        exportToCSV(exportData, 'inventory');
        break;
      case 'pdf':
        exportToPDF(exportData, 'inventory', 'Inventory Report');
        break;
      case 'excel':
        exportToExcel(exportData, 'inventory');
        break;
    }
  };
  const filteredInventory = filterInventory(inventory, { searchTerm, status: filterStatus });
  const columns: Column<InventoryItem>[] = [{
    key: 'image',
    label: 'Image',
    mobilePriority: 1,
    render: item => <div className="w-12 h-12 rounded-lg overflow-hidden bg-light-gray flex items-center justify-center">
          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <PackageIcon className="w-6 h-6 text-gray-400" />}
        </div>
  }, {
    key: 'name',
    label: 'Item Name',
    mobilePriority: 2,
    render: item => <div>
          <p className="font-medium text-dark-gray">{item.name}</p>
          <p className="text-xs text-gray-500">{item.description}</p>
        </div>
  }, {
    key: 'category',
    label: 'Category',
    mobilePriority: 3
  }, {
    key: 'quantity',
    label: 'Qty',
    sortable: true,
    mobilePriority: 4
  }, {
    key: 'location',
    label: 'Location',
    mobilePriority: 5
  }, {
    key: 'condition',
    label: 'Condition',
    mobilePriority: 6,
    render: item => <Badge variant={getInventoryConditionVariant(item.condition)}>
          {item.condition}
        </Badge>
  }, {
    key: 'costPerItem',
    label: 'Cost/Item',
    hideOnMobile: true,
    render: item => `KES ${item.costPerItem.toLocaleString()}`
  }, {
    key: 'totalCost',
    label: 'Total Cost',
    hideOnMobile: true,
    render: item => `KES ${item.totalCost.toLocaleString()}`
  }, {
    key: 'rentalPrice',
    label: 'Rental',
    hideOnMobile: true,
    render: item => `KES ${item.rentalPrice.toLocaleString()}`
  }, {
    key: 'actions',
    label: 'Actions',
    hideOnMobile: true,
    render: item => <div className="flex items-center gap-1">
          <Button variant="secondary" size="xs" onClick={() => onNavigate('inventory-detail', item.id)} title="View">
            <EyeIcon className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="xs" onClick={() => onNavigate('edit-inventory', item.id)} title="Edit">
            <EditIcon className="w-3 h-3" />
          </Button>
          <Button variant="success" size="xs" onClick={() => onNavigate('checkout', item.id)} title="Check Out">
            <ArrowUpIcon className="w-3 h-3" />
          </Button>
          <Button variant="info" size="xs" onClick={() => onNavigate('checkin', item.id)} title="Check In">
            <ArrowDownIcon className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="xs" onClick={() => {
        if (window.confirm('Are you sure you want to delete this item?')) {
          onDeleteInventory(item.id);
        }
      }} title="Delete">
            <TrashIcon className="w-3 h-3 text-red-600" />
          </Button>
        </div>
  }];
  const {
    totalValue,
    totalItems,
    checkedOutItems,
    checkedInItems,
    currentItems
  } = summarizeInventory(inventory);
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">Inventory</h1>
          <p className="text-gray-600 mt-1">Manage event equipment and assets</p>
        </div>
        <Button onClick={() => onOpenModal('add-inventory')}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Inventory
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
              <BoxIcon className="w-6 h-6 text-azure" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Items</p>
          <p className="text-3xl font-bold text-dark-gray">{totalItems}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <ArrowDownIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Checked In</p>
          <p className="text-3xl font-bold text-green-600">{checkedInItems}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <ArrowUpIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Checked Out</p>
          <p className="text-3xl font-bold text-yellow-600">
            {checkedOutItems}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-azure bg-opacity-10 rounded-lg">
              <PackageIcon className="w-6 h-6 text-azure" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Value</p>
          <p className="text-2xl font-bold text-dark-gray">
            KES {(totalValue / 1000).toFixed(0)}K
          </p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search inventory..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select options={[{
            value: 'all',
            label: 'All Categories'
          }, {
            value: 'electronics',
            label: 'Electronics'
          }, {
            value: 'audio',
            label: 'Audio Equipment'
          }]} />
            <ExportButton onExport={handleExport} />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant={filterStatus === 'all' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilterStatus('all')}>
              All Items ({inventory.length})
            </Button>
            <Button variant={filterStatus === 'current' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilterStatus('current')}>
              <BoxIcon className="w-4 h-4" />
              Current Inventory ({currentItems})
            </Button>
            <Button variant={filterStatus === 'checked-out' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilterStatus('checked-out')}>
              <ArrowUpIcon className="w-4 h-4" />
              Checked Out ({checkedOutItems})
            </Button>
            <Button variant={filterStatus === 'checked-in' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilterStatus('checked-in')}>
              <ArrowDownIcon className="w-4 h-4" />
              Checked In ({checkedInItems})
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-gray">Inventory Items</h3>
          <ExportButton onExport={handleExport} />
        </div>
        <Table columns={columns} data={filteredInventory} compact />
      </Card>
    </div>;
}
