import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Table, Column } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Supplier } from '../../../types';
import { PlusIcon, SearchIcon, PackageIcon, CheckCircleIcon, DollarSignIcon, AlertCircleIcon, EyeIcon, CreditCardIcon, TrashIcon, FilterIcon, EditIcon } from 'lucide-react';
interface SuppliersProps {
  onOpenModal: (modal: string, data?: any) => void;
  suppliers: Supplier[];
  onDeleteSupplier: (id: string) => void;
  onNavigate?: (page: string, id?: string) => void;
}
export function Suppliers({
  onOpenModal,
  suppliers,
  onDeleteSupplier,
  onNavigate
}: SuppliersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Group suppliers by category for metrics
  const categories = Array.from(new Set(suppliers.map(s => s.category).filter(Boolean)));
  const activeSuppliers = suppliers.filter(s => s.status === 'Active');
  const columns: Column<Supplier>[] = [{
    key: 'name',
    label: 'Supplier Name',
    sortable: true
  }, {
    key: 'category',
    label: 'Category',
    sortable: true
  }, {
    key: 'contactPerson',
    label: 'Contact Person'
  }, {
    key: 'phone',
    label: 'Phone'
  }, {
    key: 'email',
    label: 'Email'
  }, {
    key: 'actions',
    label: 'Actions',
    render: supplier => <div className="flex items-center gap-1">
            <Button variant="secondary" size="xs" onClick={() => onNavigate?.('supplier-detail', supplier.id)}>
            <EyeIcon className="w-3 h-3" />
            View
          </Button>
          <Button variant="ghost" size="xs" onClick={() => onOpenModal('edit-supplier', supplier)} title="Edit">
            <EditIcon className="w-3 h-3 text-azure" />
          </Button>
          <Button variant="ghost" size="xs" onClick={() => {
        if (window.confirm(`Are you sure you want to delete ${supplier.name}?`)) {
          onDeleteSupplier(supplier.id);
        }
      }} title="Delete">
            <TrashIcon className="w-3 h-3 text-red-600" />
          </Button>
        </div>
  }];
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">Suppliers</h1>
          <p className="text-gray-600 mt-1">Manage your supplier relationships</p>
        </div>
        <Button onClick={() => onOpenModal('add-supplier')}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
              <PackageIcon className="w-6 h-6 text-azure" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Suppliers</p>
          <p className="text-3xl font-bold text-dark-gray">
            {suppliers.length}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Active Suppliers</p>
          <p className="text-3xl font-bold text-green-600">
            {activeSuppliers.length}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-azure bg-opacity-10 rounded-lg">
              <FilterIcon className="w-6 h-6 text-azure" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Categories</p>
          <p className="text-3xl font-bold text-azure">
            {categories.length}
          </p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search suppliers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Button variant="secondary" size="sm" onClick={() => setFilterStatus(filterStatus === 'all' ? 'pending' : filterStatus === 'pending' ? 'completed' : 'all')}>
            <FilterIcon className="w-4 h-4 mr-2" />
            {filterStatus === 'all' ? 'All' : filterStatus === 'pending' ? 'Pending' : 'Completed'}
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-gray">All Suppliers</h3>
        </div>
        <Table columns={columns} data={filteredSuppliers} />
      </Card>
    </div>;
}
