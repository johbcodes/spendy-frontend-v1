import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import { UploadIcon, XIcon, FileIcon, PlusIcon } from 'lucide-react';
import { isPastDate, getPastDateErrorMessage } from '../../../utils/dateFormatter';
interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  users: any[];
  clients?: any[];
  eventCategories?: any[];
  activationCategories?: any[];
  operationCategories?: any[];
  systemData?: any;
  onAddEventCategory?: (category: string) => void;
  onAddActivationCategory?: (category: string) => void;
  onAddClient?: (client: any) => void;
  onAddBrand?: (clientId: string, brand: string) => void;
}
export function NewEventModal({
  isOpen,
  onClose,
  onSuccess,
  users,
  clients,
  eventCategories,
  activationCategories,
  operationCategories,
  systemData,
  onAddEventCategory,
  onAddActivationCategory,
  onAddClient,
  onAddBrand
}: NewEventModalProps) {
  const [eventGroup, setEventGroup] = useState<'Project' | 'Activation' | 'Operation'>('Project');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    client: '',
    budget: '',
    startDate: '',
    endDate: '',
    projectLead: '',
    location: '',
    description: ''
  });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandInput, setBrandInput] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{
    name: string;
    size: number;
    url: string;
  }>>([]);

  // Quick-add states
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: ''
  });
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [dateError, setDateError] = useState('');
  
  const selectedClient = clients?.find(c => c.name === formData.client);
  const availableBrands = selectedClient?.brands || [];
  const categories = eventGroup === 'Project' ? eventCategories : eventGroup === 'Activation' ? activationCategories : operationCategories;
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedDocuments(prev => [...prev, {
            name: file.name,
            size: file.size,
            url: reader.result as string
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };
  const removeDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };
  const handleAddBrand = () => {
    if (brandInput && !selectedBrands.includes(brandInput)) {
      setSelectedBrands([...selectedBrands, brandInput]);
      setBrandInput('');
    }
  };
  const handleRemoveBrand = (brand: string) => {
    setSelectedBrands(selectedBrands.filter(b => b !== brand));
  };

  const handleAddCategoryClick = () => {
    const categoryList = eventGroup === 'Project' ? systemData?.eventcategorys : systemData?.activationcategorys;
    if (newCategory.trim() && categoryList && !categoryList.some((c: any) => c.name === newCategory)) {
      const callback = eventGroup === 'Project' ? onAddEventCategory : onAddActivationCategory;
      if (callback) {
        callback(newCategory);
        handleChange('category', newCategory);
        setNewCategory('');
        setShowAddCategory(false);
      }
    }
  };

  const handleAddClientClick = () => {
    if (newClient.name.trim() && systemData?.clients && !systemData.clients.some((c: any) => c.name === newClient.name)) {
      if (onAddClient) {
        onAddClient(newClient);
        handleChange('client', newClient.name);
        setNewClient({ name: '', contactPerson: '', email: '', phone: '' });
        setShowAddClient(false);
      }
    }
  };

  const handleAddBrandClick = () => {
    if (newBrand.trim() && selectedClient && !selectedBrands.includes(newBrand)) {
      if (onAddBrand) {
        onAddBrand(selectedClient.id, newBrand);
        setSelectedBrands([...selectedBrands, newBrand]);
        setNewBrand('');
        setShowAddBrand(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dates are not in the past
    if (isPastDate(formData.startDate)) {
      setDateError('Start date cannot be in the past');
      return;
    }

    if (formData.endDate && isPastDate(formData.endDate)) {
      setDateError('End date cannot be in the past');
      return;
    }

    if (formData.endDate && formData.startDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      setDateError('End date must be after start date');
      return;
    }

    setDateError('');

    await onSuccess({
      ...formData,
      type: eventGroup,
      brands: selectedBrands,
      budget: Number(formData.budget),
      documents: uploadedDocuments
    });
    // Reset form
    setFormData({
      name: '',
      category: '',
      client: '',
      budget: '',
      startDate: '',
      endDate: '',
      projectLead: '',
      location: '',
      description: ''
    });
    setSelectedBrands([]);
    setUploadedDocuments([]);
    setEventGroup('Project');
    setDateError('');
  };
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  return <Modal isOpen={isOpen} onClose={onClose} title={`New ${eventGroup}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Event Group" options={[{
        value: 'Project',
        label: 'Project'
      }, {
        value: 'Activation',
        label: 'Activation'
      }, {
        value: 'Operation',
        label: 'Operation'
      }]} value={eventGroup} onChange={e => {
        setEventGroup(e.target.value as 'Project' | 'Activation' | 'Operation');
        setFormData({
          name: '',
          category: '',
          client: '',
          budget: '',
          startDate: '',
          endDate: '',
          projectLead: '',
          location: '',
          description: ''
        });
        setSelectedBrands([]);
      }} required />
        <Input label={eventGroup === 'Project' ? 'Project Name' : eventGroup === 'Activation' ? 'Activation Name' : 'Operation Name'} value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
        {!showAddCategory ? (
          // Hide category input entirely for Operation eventGroup
          eventGroup !== 'Operation' ? (
          <div className="flex gap-2">
            <Select label={eventGroup === 'Project' ? 'Project Category' : 'Activation Category'} options={[{
        value: '',
        label: 'Select category'
      }, ...(categories || []).map(cat => ({
        value: cat.name,
        label: cat.name
      }))]} value={formData.category} onChange={e => handleChange('category', e.target.value)} required />
            <Button type="button" variant="secondary" size="sm" className="mt-6" onClick={() => setShowAddCategory(true)}>
              <PlusIcon className="w-4 h-4" /> Add
            </Button>
          </div>
          ) : null
        ) : (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-dark-gray">
              New {eventGroup === 'Project' ? 'Project' : 'Activation'} Category
            </label>
            <Input placeholder="Category name" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
            <div className="flex gap-2">
              <Button type="button" variant="primary" size="sm" onClick={handleAddCategoryClick} disabled={!newCategory.trim()}>
                Add Category
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => {
        setShowAddCategory(false);
        setNewCategory('');
      }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
        {eventGroup !== 'Operation' && (
          <>
            {!showAddClient ? (
              <div className="flex gap-2">
                <Select label="Client Name (Optional)" options={[{
          value: '',
          label: 'Select client'
        }, ...(clients || []).map(client => ({
          value: client.name,
          label: client.name
        }))]} value={formData.client} onChange={e => {
          handleChange('client', e.target.value);
          setSelectedBrands([]);
        }} />
                <Button type="button" variant="secondary" size="sm" className="mt-6" onClick={() => setShowAddClient(true)}>
                  <PlusIcon className="w-4 h-4" /> Add
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-dark-gray">
                  New Client Details
                </label>
                <Input placeholder="Client name" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} required />
                <Input placeholder="Contact Person" value={newClient.contactPerson} onChange={e => setNewClient({...newClient, contactPerson: e.target.value})} />
                <Input placeholder="Email" type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} />
                <PhoneInput 
                  placeholder="7XXXXXXXX" 
                  value={newClient.phone} 
                  onChange={value => setNewClient({...newClient, phone: value})} 
                />
                <div className="flex gap-2">
                  <Button type="button" variant="primary" size="sm" onClick={handleAddClientClick} disabled={!newClient.name.trim()}>
                    Add Client
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => {
          setShowAddClient(false);
          setNewClient({ name: '', contactPerson: '', email: '', phone: '' });
        }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {formData.client && (
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">
                  Brand Names (Optional)
                </label>
                {!showAddBrand ? (
                  <div className="flex gap-2 mb-2">
                    <Select options={[{
                value: '',
                label: 'Select brand to add'
              }, ...availableBrands.filter((brand: string) => !selectedBrands.includes(brand)).map((brand: string) => ({
                value: brand,
                label: brand
              }))]} value={brandInput} onChange={e => setBrandInput(e.target.value)} />
                    <Button type="button" variant="secondary" size="sm" onClick={handleAddBrand} disabled={!brandInput}>
                      <PlusIcon className="w-4 h-4" />
                      Add
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddBrand(true)}>
                      <PlusIcon className="w-4 h-4" /> New
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 mb-2">
                    <Input placeholder="New brand name" value={newBrand} onChange={e => setNewBrand(e.target.value)} />
                    <Button type="button" variant="primary" size="sm" onClick={handleAddBrandClick} disabled={!newBrand.trim()}>
                      Add
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => {
          setShowAddBrand(false);
          setNewBrand('');
        }}>
                      Cancel
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {selectedBrands.map(brand => <Badge key={brand} variant="info" className="flex items-center gap-1">
                      {brand}
                      <button type="button" onClick={() => handleRemoveBrand(brand)} className="ml-1 hover:text-red-600 transition-colors">
                        �
                      </button>
                    </Badge>)}
                </div>
              </div>
            )}
          </>
        )}
        <Input label="Budget (KES) (Optional)" type="number" value={formData.budget} onChange={e => handleChange('budget', e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date & Time" type="datetime-local" value={formData.startDate} onChange={e => {
            handleChange('startDate', e.target.value);
            setDateError('');
          }} required />
          <Input label="End Date & Time" type="datetime-local" value={formData.endDate} onChange={e => {
            handleChange('endDate', e.target.value);
            setDateError('');
          }} required />
        </div>
        {dateError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">{dateError}</p>
          </div>
        )}
        <Select label="Project Lead" options={[{
        value: '',
        label: 'Select project lead'
      }, ...users.map(user => ({
        value: user.id,
        label: `${user.firstName} ${user.lastName}`
      }))]} value={formData.projectLead} onChange={e => handleChange('projectLead', e.target.value)} required />
        {eventGroup !== 'Operation' && (
          <Input label="Location" value={formData.location} onChange={e => handleChange('location', e.target.value)} required />
        )}
        <div>
          <label className="block text-sm font-medium text-dark-gray mb-1">
            Description
          </label>
          <textarea className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure focus:border-transparent" rows={3} value={formData.description} onChange={e => handleChange('description', e.target.value)} placeholder="Provide event details..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-gray mb-2">
            Upload Event Documents
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFileUpload} className="hidden" id="event-documents" />
            <label htmlFor="event-documents" className="cursor-pointer">
              <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload event documents
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, JPG, PNG, DOC (Max 10MB each)
              </p>
            </label>
          </div>
          {uploadedDocuments.length > 0 && <div className="mt-3 space-y-2">
              {uploadedDocuments.map((doc, index) => <div key={index} className="flex items-center justify-between p-3 bg-light-gray rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileIcon className="w-5 h-5 text-azure" />
                    <div>
                      <p className="text-sm font-medium text-dark-gray">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(doc.size)}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeDocument(index)} className="text-red-600 hover:text-red-700">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>)}
            </div>}
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create {eventGroup}</Button>
        </div>
      </form>
    </Modal>;
}
