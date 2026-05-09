import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import { UploadIcon, FileIcon, XIcon } from 'lucide-react';
interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  supplierCategories: any[];
  events: any[];
}
export function AddSupplierModal({
  isOpen,
  onClose,
  onSuccess,
  supplierCategories,
  events
}: AddSupplierModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    contactPerson: '',
    phone: '',
    email: '',
    servicesProvided: [],
    paymentMethod: 'Mpesa B2C',
    // M-Pesa fields
    mpesaPhone: '',
    paybillNumber: '',
    paybillAccount: '',
    tillNumber: '',
    // Bank fields
    bankName: '',
    accountName: '',
    accountNumber: '',
    branchName: '',
    swiftCode: ''
  });
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{
    name: string;
    size: number;
    url: string;
  }>>([]);
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Services and costs are for record-keeping only, not for immediate payment
    onSuccess({
      ...formData,
      documents: uploadedDocuments,
      status: 'Active',
      paymentStatus: 'No Pending Payments',
      approvalRequired: false // Supplier onboarding doesn't require approval
    });
    setFormData({
      name: '',
      category: '',
      contactPerson: '',
      phone: '',
      email: '',
      servicesProvided: [],
      paymentMethod: 'Mpesa B2C',
      mpesaPhone: '',
      paybillNumber: '',
      paybillAccount: '',
      tillNumber: '',
      bankName: '',
      accountName: '',
      accountNumber: '',
      branchName: '',
      swiftCode: ''
    });
    setUploadedDocuments([]);
  };

  const addServiceRow = () => {
    setFormData(prev => ({
      ...prev,
      servicesProvided: [...prev.servicesProvided, { description: '', amount: '' }]
    }));
  };

  const removeServiceRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      servicesProvided: prev.servicesProvided.filter((_, i) => i !== index)
    }));
  };

  const updateService = (index: number, field: 'description' | 'amount', value: string) => {
    setFormData(prev => ({
      ...prev,
      servicesProvided: prev.servicesProvided.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Add Supplier" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Supplier Name" value={formData.name} onChange={e => setFormData({
        ...formData,
        name: e.target.value
      })} required />

        <Select label="Supply Category" options={[{
        value: '',
        label: 'Select category'
      }, ...supplierCategories.map(cat => ({
        value: cat.name,
        label: cat.name
      }))]} value={formData.category} onChange={e => setFormData({
        ...formData,
        category: e.target.value
      })} required />

        <Input label="Contact Person" value={formData.contactPerson} onChange={e => setFormData({
        ...formData,
        contactPerson: e.target.value
      })} required />

        <div className="grid grid-cols-2 gap-4">
          <PhoneInput 
            label="Phone" 
            value={formData.phone} 
            onChange={value => setFormData({
              ...formData,
              phone: value
            })} 
            placeholder="7XXXXXXXX"
            required 
          />
          <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({
          ...formData,
          email: e.target.value
        })} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-gray mb-2">
            Services Provided & Typical Costs (For Record Only)
          </label>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-blue-800">
              ℹ️ This information is for your records only. No payment will be created or requested at this stage.
              Payments will be handled separately when you assign suppliers to specific expenses.
            </p>
          </div>
          <div className="space-y-2">
            {formData.servicesProvided.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-500 mb-2">No services added yet</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addServiceRow}
                >
                  + Add Service
                </Button>
              </div>
            ) : (
              <>
                {formData.servicesProvided.map((service, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure"
                      placeholder="Service description (e.g., Event Photography)"
                      value={service.description}
                      onChange={(e) => updateService(index, 'description', e.target.value)}
                    />
                    <input
                      type="number"
                      className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure"
                      placeholder="Typical Cost"
                      value={service.amount}
                      onChange={(e) => updateService(index, 'amount', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => removeServiceRow(index)}
                    >
                      <XIcon className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addServiceRow}
                  className="w-full"
                >
                  + Add Another Service
                </Button>
              </>
            )}
          </div>
        </div>

        <Select label="Payment Method" options={[{
        value: 'Mpesa B2C',
        label: 'M-Pesa Send Money (B2C)'
      }, {
        value: 'Paybill B2B',
        label: 'M-Pesa Paybill (B2B)'
      }, {
        value: 'Till B2B',
        label: 'M-Pesa Till Number (B2B)'
      }, {
        value: 'Bank',
        label: 'Bank Transfer'
      }]} value={formData.paymentMethod} onChange={e => setFormData({
        ...formData,
        paymentMethod: e.target.value
      })} required />

        {/* M-Pesa B2C Fields */}
        {formData.paymentMethod === 'Mpesa B2C' && (
          <PhoneInput 
            label="M-Pesa Phone Number" 
            value={formData.mpesaPhone} 
            onChange={value => setFormData({ ...formData, mpesaPhone: value })} 
            placeholder="7XXXXXXXX"
            required 
          />
        )}

        {/* Paybill B2B Fields */}
        {formData.paymentMethod === 'Paybill B2B' && (
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Paybill Number" 
              type="text" 
              placeholder="123456" 
              value={formData.paybillNumber} 
              onChange={e => setFormData({ ...formData, paybillNumber: e.target.value })} 
              required 
            />
            <Input 
              label="Account Number" 
              type="text" 
              placeholder="Account number" 
              value={formData.paybillAccount} 
              onChange={e => setFormData({ ...formData, paybillAccount: e.target.value })} 
              required 
            />
          </div>
        )}

        {/* Till B2B Fields */}
        {formData.paymentMethod === 'Till B2B' && (
          <Input 
            label="Till Number" 
            type="text" 
            placeholder="1234567" 
            value={formData.tillNumber} 
            onChange={e => setFormData({ ...formData, tillNumber: e.target.value })} 
            required 
          />
        )}

        {/* Bank Transfer Fields */}
        {formData.paymentMethod === 'Bank' && (
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-semibold text-dark-gray">Bank Account Details</h4>
            <Input 
              label="Bank Name" 
              value={formData.bankName} 
              onChange={e => setFormData({ ...formData, bankName: e.target.value })} 
              required 
            />
            <Input 
              label="Account Name" 
              value={formData.accountName} 
              onChange={e => setFormData({ ...formData, accountName: e.target.value })} 
              required 
            />
            <Input 
              label="Account Number" 
              value={formData.accountNumber} 
              onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} 
              required 
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Branch Name" 
                value={formData.branchName} 
                onChange={e => setFormData({ ...formData, branchName: e.target.value })} 
                required 
              />
              <Input 
                label="SWIFT Code (Optional)" 
                value={formData.swiftCode} 
                onChange={e => setFormData({ ...formData, swiftCode: e.target.value })} 
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-dark-gray mb-2">
            Upload Documents (KYC)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFileUpload} className="hidden" id="supplier-documents" />
            <label htmlFor="supplier-documents" className="cursor-pointer">
              <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload KYC documents
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
          <Button type="submit">Add Supplier</Button>
        </div>
      </form>
    </Modal>;
}