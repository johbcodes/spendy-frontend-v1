import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Table, Column } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Tabs } from '../../../components/ui/Tabs';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import type { User, Category, CategoryType, Client, SystemItem } from '../types';
import { PlusIcon, EditIcon, TrashIcon } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { DateTimeDisplay } from '../../../utils/dateFormatter';
import {
  createCategory,
  createClient,
  deleteCategory,
  deleteClient,
  loadSystemSetupData,
  updateCategory,
  updateClient,
} from '../api';
import { filterSystemItems, mapModalTypeToCategoryType } from '../rules';

interface SystemSetupProps {
  currentUser: User;
}

export function SystemSetup({ currentUser: _currentUser }: SystemSetupProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    status: 'Active'
  });
  const [clientFormData, setClientFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    brands: [] as string[],
    status: 'Active'
  });
  const [brandInput, setBrandInput] = useState('');
  const [activeTab, setActiveTab] = useState('event-categories');

  // Category state
  const [eventCategories, setEventCategories] = useState<Category[]>([]);
  const [activationCategories, setActivationCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [operationCategories, setOperationCategories] = useState<Category[]>([]);
  const [supplierCategories, setSupplierCategories] = useState<Category[]>([]);
  const [inventoryCategories, setInventoryCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const {
          events,
          activations,
          expenses,
          operations,
          suppliers,
          inventory,
          clients: clientsList,
        } = await loadSystemSetupData();

        setEventCategories(events);
        setActivationCategories(activations);
        setExpenseCategories(expenses);
        setOperationCategories(operations);
        setSupplierCategories(suppliers);
        setInventoryCategories(inventory);
        setClients(clientsList);
      } catch (error) {
        console.error('Error loading system data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get current categories based on active modal
  const getCurrentCategories = (): Category[] => {
    if (!activeModal) return [];
    if (activeModal === 'event-category') return eventCategories;
    if (activeModal === 'activation-category') return activationCategories;
    if (activeModal === 'expense-category') return expenseCategories;
    if (activeModal === 'operation-category') return operationCategories;
    if (activeModal === 'supplier-category') return supplierCategories;
    if (activeModal === 'inventory-category') return inventoryCategories;
    return [];
  };

  // Update categories state
  const updateCategoriesState = (type: CategoryType, categories: Category[]) => {
    if (type === 'event') setEventCategories(categories);
    else if (type === 'activation') setActivationCategories(categories);
    else if (type === 'expense') setExpenseCategories(categories);
    else if (type === 'operation') setOperationCategories(categories);
    else if (type === 'supplier') setSupplierCategories(categories);
    else if (type === 'inventory') setInventoryCategories(categories);
  };

  const filterData = filterSystemItems;

  const handleOpenAddModal = (type: string) => {
    setEditingItem(null);
    setFormData({
      name: '',
      status: 'Active'
    });
    setClientFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      brands: [],
      status: 'Active'
    });
    setBrandInput('');
    setActiveModal(type);
  };

  const handleOpenEditModal = (type: string, item: any) => {
    setEditingItem(item);
    if (type === 'client') {
      setClientFormData({
        name: item.name,
        contactPerson: item.contactPerson,
        email: item.email,
        phone: item.phone,
        brands: item.brands || [],
        status: item.status
      });
    } else {
      setFormData({
        name: item.name,
        status: item.status
      });
    }
    setActiveModal(type);
  };

  const handleSubmit = async () => {
    if (!activeModal) return;

    const categoryType = mapModalTypeToCategoryType(activeModal);
    if (!categoryType) return;

    try {
      if (editingItem) {
        // Update existing category
        const updated = await updateCategory(categoryType, editingItem.id, formData);
        const current = getCurrentCategories();
        const updatedList = current.map(item => item.id === editingItem.id ? updated : item);
        updateCategoriesState(categoryType, updatedList);
      } else {
        // Create new category
        const newCategory = await createCategory(categoryType, formData);
        const current = getCurrentCategories();
        updateCategoriesState(categoryType, [...current, newCategory]);
      }
      setActiveModal(null);
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category. Please try again.');
    }
  };

  const handleClientSubmit = async () => {
    try {
      if (editingItem) {
        // Update existing client
        const updated = await updateClient(editingItem.id, clientFormData);
        setClients(clients.map(c => c.id === editingItem.id ? updated : c));
      } else {
        // Create new client
        const newClient = await createClient(clientFormData);
        setClients([...clients, newClient]);
      }
      setActiveModal(null);
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Failed to save client. Please try again.');
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      if (type === 'client') {
        await deleteClient(id);
        setClients(clients.filter(c => c.id !== id));
      } else {
        const categoryType = mapModalTypeToCategoryType(type);
        if (!categoryType) return;
        await deleteCategory(categoryType, id);
        const current = getCurrentCategories();
        updateCategoriesState(categoryType, current.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleAddBrand = () => {
    if (brandInput.trim() && !clientFormData.brands.includes(brandInput.trim())) {
      setClientFormData({
        ...clientFormData,
        brands: [...clientFormData.brands, brandInput.trim()]
      });
      setBrandInput('');
    }
  };

  const handleRemoveBrand = (brand: string) => {
    setClientFormData({
      ...clientFormData,
      brands: clientFormData.brands.filter(b => b !== brand)
    });
  };

  const createColumns = (type: string): Column<SystemItem>[] => [{
    key: 'name',
    label: 'Name',
    sortable: true
  }, {
    key: 'dateCreated',
    label: 'Date Created',
    sortable: true,
    render: item => item.dateCreated ? <DateTimeDisplay dateTime={item.dateCreated} /> : ''
  }, {
    key: 'status',
    label: 'Status',
    render: item => <Badge variant={item.status === 'Active' ? 'success' : 'default'}>
          {item.status}
        </Badge>
  }, {
    key: 'actions',
    label: 'Actions',
    render: item => <div className="flex items-center gap-1">
          <Button variant="ghost" size="xs" onClick={() => handleOpenEditModal(type, item)}>
            <EditIcon className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="xs" onClick={() => handleDelete(type, item.id)}>
            <TrashIcon className="w-3 h-3 text-red-600" />
          </Button>
        </div>
  }];

  const clientColumns: Column<Client>[] = [{
    key: 'name',
    label: 'Client Name',
    sortable: true
  }, {
    key: 'contactPerson',
    label: 'Contact Person'
  }, {
    key: 'email',
    label: 'Email'
  }, {
    key: 'phone',
    label: 'Phone'
  }, {
    key: 'brands',
    label: 'Brands',
    render: item => <div className="flex flex-wrap gap-1">
          {item.brands && item.brands.map(brand => <Badge key={brand} variant="info" className="text-xs">
              {brand}
            </Badge>)}
        </div>
  }, {
    key: 'dateCreated',
    label: 'Date Created',
    sortable: true,
    render: item => item.dateCreated ? <DateTimeDisplay dateTime={item.dateCreated} /> : ''
  }, {
    key: 'status',
    label: 'Status',
    render: item => <Badge variant={item.status === 'Active' ? 'success' : 'default'}>
          {item.status}
        </Badge>
  }, {
    key: 'actions',
    label: 'Actions',
    render: item => <div className="flex items-center gap-1">
          <Button variant="ghost" size="xs" onClick={() => handleOpenEditModal('client', item)}>
            <EditIcon className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="xs" onClick={() => handleDelete('client', item.id)}>
            <TrashIcon className="w-3 h-3 text-red-600" />
          </Button>
        </div>
  }];

  const tabs = [{
    id: 'event-categories',
    label: 'Event Categories',
    content: <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Input placeholder="Search event categories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-md" />
            <Button variant="primary" onClick={() => handleOpenAddModal('event-category')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Event Category
            </Button>
          </div>
          <Table columns={createColumns('event-category')} data={filterData(eventCategories || [], searchTerm)} />
        </div>
  }, {
    id: 'activation-categories',
    label: 'Activation Categories',
    content: <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Input placeholder="Search activation categories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-md" />
            <Button variant="primary" onClick={() => handleOpenAddModal('activation-category')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Activation Category
            </Button>
          </div>
          <Table columns={createColumns('activation-category')} data={filterData(activationCategories || [], searchTerm)} />
        </div>
  }, {
    id: 'expense-categories',
    label: 'Expense Categories',
    content: <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Input placeholder="Search expense categories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-md" />
            <Button variant="primary" onClick={() => handleOpenAddModal('expense-category')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Expense Category
            </Button>
          </div>
          <Table columns={createColumns('expense-category')} data={filterData(expenseCategories || [], searchTerm)} />
        </div>
  }, {
    id: 'operation-categories',
    label: 'Operation Categories',
    content: <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Input placeholder="Search operation categories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-md" />
            <Button variant="primary" onClick={() => handleOpenAddModal('operation-category')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Operation Category
            </Button>
          </div>
          <Table columns={createColumns('operation-category')} data={filterData(operationCategories || [], searchTerm)} />
        </div>
  }, {
    id: 'supplier-categories',
    label: 'Supplier Categories',
    content: <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Input placeholder="Search supplier categories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-md" />
            <Button variant="primary" onClick={() => handleOpenAddModal('supplier-category')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Supplier Category
            </Button>
          </div>
          <Table columns={createColumns('supplier-category')} data={filterData(supplierCategories || [], searchTerm)} />
        </div>
  }, {
    id: 'inventory-categories',
    label: 'Inventory Categories',
    content: <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Input placeholder="Search inventory categories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-md" />
            <Button variant="primary" onClick={() => handleOpenAddModal('inventory-category')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Inventory Category
            </Button>
          </div>
          <Table columns={createColumns('inventory-category')} data={filterData(inventoryCategories || [], searchTerm)} />
        </div>
  }, {
    id: 'clients',
    label: 'Clients',
    content: <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Input placeholder="Search clients..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-md" />
            <Button variant="primary" onClick={() => handleOpenAddModal('client')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </div>
          <Table columns={clientColumns} data={filterData(clients || [], searchTerm, 'client')} />
        </div>
  }];

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-lg text-gray-600">Loading system data...</div>
    </div>;
  }

  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-gray">System Setup</h1>
        <p className="text-gray-600 mt-1">
          Configure system settings and options
        </p>
      </div>
      <Card className="p-6">
        <Tabs tabs={tabs} />
      </Card>

      {/* Generic Add/Edit Modal */}
      <Modal isOpen={activeModal !== null && activeModal !== 'client'} onClose={() => setActiveModal(null)} title={`${editingItem ? 'Edit' : 'Add'} ${activeModal?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`} size="md">
        <div className="space-y-4">
          <Input label="Name" value={formData.name} onChange={e => setFormData({
          ...formData,
          name: e.target.value
        })} required />
          <Select label="Status" value={formData.status} onChange={e => setFormData({
          ...formData,
          status: e.target.value
        })} options={[{
          value: 'Active',
          label: 'Active'
        }, {
          value: 'Inactive',
          label: 'Inactive'
        }]} />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Client Add/Edit Modal */}
      <Modal isOpen={activeModal === 'client'} onClose={() => setActiveModal(null)} title={`${editingItem ? 'Edit' : 'Add'} Client`} size="lg">
        <div className="space-y-4">
          <Input label="Client Name" value={clientFormData.name} onChange={e => setClientFormData({
          ...clientFormData,
          name: e.target.value
        })} required />
          <Input label="Contact Person" value={clientFormData.contactPerson} onChange={e => setClientFormData({
          ...clientFormData,
          contactPerson: e.target.value
        })} required />
          <Input label="Email" type="email" value={clientFormData.email} onChange={e => setClientFormData({
          ...clientFormData,
          email: e.target.value
        })} required />
          <PhoneInput
            label="Phone"
            value={clientFormData.phone}
            onChange={value => setClientFormData({
              ...clientFormData,
              phone: value
            })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-dark-gray mb-2">
              Brands
            </label>
            <div className="flex gap-2 mb-2">
              <Input placeholder="Enter brand name" value={brandInput} onChange={e => setBrandInput(e.target.value)} onKeyPress={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddBrand();
              }
            }} />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddBrand}>
                <PlusIcon className="w-4 h-4" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {clientFormData.brands.map(brand => <Badge key={brand} variant="info" className="flex items-center gap-1">
                  {brand}
                  <button type="button" onClick={() => handleRemoveBrand(brand)} className="ml-1 hover:text-red-600 transition-colors">
                    x
                  </button>
                </Badge>)}
            </div>
          </div>
          <Select label="Status" value={clientFormData.status} onChange={e => setClientFormData({
          ...clientFormData,
          status: e.target.value
        })} options={[{
          value: 'Active',
          label: 'Active'
        }, {
          value: 'Inactive',
          label: 'Inactive'
        }]} />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleClientSubmit}>
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>;
}
