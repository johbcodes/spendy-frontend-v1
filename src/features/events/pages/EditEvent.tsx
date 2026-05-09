import { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Event } from '../../../types';
import { ArrowLeftIcon, PlusIcon, XIcon } from 'lucide-react';

interface EditEventProps {
  event: Event;
  users: any[];
  clients: any[];
  eventCategories: any[];
  activationCategories: any[];
  onSave: (eventId: string, data: Partial<Event>) => void;
  onCancel: () => void;
}

export function EditEvent({
  event,
  users,
  clients,
  eventCategories,
  activationCategories,
  onSave,
  onCancel
}: EditEventProps) {
  const [formData, setFormData] = useState({
    type: 'Project' as 'Project' | 'Activation',
    name: '',
    category: '',
    client: '',
    brand: '',
    brands: [] as string[],
    budget: '',
    startDate: '',
    endDate: '',
    projectLead: '',
    location: ''
  });

  const [newBrand, setNewBrand] = useState('');

  useEffect(() => {
    if (event) {
      setFormData({
        type: (event.type === 'Project' || event.type === 'Activation' ? event.type : 'Project') as 'Project' | 'Activation',
        name: event.name || '',
        category: event.category || '',
        client: event.client || '',
        brand: event.brand || '',
        brands: event.brands || [],
        budget: event.budget != null ? event.budget.toString() : '',
        startDate: event.startDate || '',
        endDate: event.endDate || '',
        projectLead: event.projectLead || '',
        location: event.location || ''
      });
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(event.id, {
      ...formData,
      budget: Number(formData.budget)
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddBrand = (brand?: string) => {
    const brandToAdd = brand || newBrand;
    if (brandToAdd && !formData.brands.includes(brandToAdd)) {
      setFormData(prev => ({
        ...prev,
        brands: [...prev.brands, brandToAdd]
      }));
      if (!brand) setNewBrand('');
    }
  };

  const handleRemoveBrand = (brandToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      brands: prev.brands.filter(b => b !== brandToRemove)
    }));
  };

  const categories = formData.type === 'Project' ? (eventCategories || []) : (activationCategories || []);
  const selectedClient = (clients || []).find(c => c.name === formData.client);
  const availableBrands = selectedClient?.brands || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" onClick={onCancel} className="p-2">
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-dark-gray">Edit {formData.type || 'Project'}</h1>
          </div>
          <p className="text-gray-600 ml-14">Update event details and information</p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Type of Event"
              options={[
                { value: 'Project', label: 'Project' },
                { value: 'Activation', label: 'Activation' }
              ]}
              value={formData.type}
              onChange={e => {
                handleChange('type', e.target.value);
                handleChange('category', '');
              }}
              required
            />

            <Input
              label={formData.type === 'Project' ? 'Project Name' : 'Activation Name'}
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              required
            />

            <Select
              label={formData.type === 'Project' ? 'Project Category' : 'Activation Category'}
              options={[
                { value: '', label: 'Select category' },
                ...categories.map(cat => ({
                  value: cat.name,
                  label: cat.name
                }))
              ]}
              value={formData.category}
              onChange={e => handleChange('category', e.target.value)}
              required
            />

            <Select
              label="Client Name"
              options={[
                { value: '', label: 'Select client' },
                ...(clients || []).map(client => ({
                  value: client.name,
                  label: client.name
                }))
              ]}
              value={formData.client}
              onChange={e => {
                handleChange('client', e.target.value);
                handleChange('brand', '');
                setFormData(prev => ({ ...prev, brands: [] }));
              }}
              required
            />
          </div>

          {/* Multiple Brands Section */}
          {availableBrands.length > 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">
                  Brands
                </label>
                
                {/* Selected Brands */}
                {formData.brands.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.brands.map((brand, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-azure text-white rounded-lg text-sm"
                      >
                        <span>{brand}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBrand(brand)}
                          className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
                        >
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Brand from Dropdown */}
                <div className="flex gap-2">
                  <Select
                    label=""
                    options={[
                      { value: '', label: 'Select brand to add' },
                      ...availableBrands
                        .filter((brand: string) => !formData.brands.includes(brand))
                        .map((brand: string) => ({
                          value: brand,
                          label: brand
                        }))
                    ]}
                    value=""
                    onChange={e => {
                      if (e.target.value) {
                        handleAddBrand(e.target.value);
                      }
                    }}
                  />
                </div>

                {/* Custom Brand Input */}
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Or add custom brand
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={newBrand}
                      onChange={e => setNewBrand(e.target.value)}
                      placeholder="Enter brand name"
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddBrand();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleAddBrand()}
                      disabled={!newBrand}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Budget (KES)"
              type="number"
              value={formData.budget}
              onChange={e => handleChange('budget', e.target.value)}
              required
            />

            <Input
              label="Start Date & Time"
              type="datetime-local"
              value={formData.startDate}
              onChange={e => handleChange('startDate', e.target.value)}
              required
            />

            <Input
              label="End Date & Time"
              type="datetime-local"
              value={formData.endDate}
              onChange={e => handleChange('endDate', e.target.value)}
              required
            />

            <Select
              label="Project Lead"
              options={[
                { value: '', label: 'Select project lead' },
                ...(users || []).map(user => ({
                  value: `${user.firstName} ${user.lastName}`,
                  label: `${user.firstName} ${user.lastName}`
                }))
              ]}
              value={formData.projectLead}
              onChange={e => handleChange('projectLead', e.target.value)}
              required
            />

            <Input
              label="Location"
              value={formData.location}
              onChange={e => handleChange('location', e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Update {formData.type}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
