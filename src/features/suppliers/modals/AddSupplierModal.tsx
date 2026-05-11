import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import { UploadIcon, FileIcon, XIcon, PlusIcon } from 'lucide-react';
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
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Supplier" size="lg">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identity & Category */}
        <div className="space-y-6 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-[10px] font-black text-dark-gray uppercase tracking-[0.2em] opacity-40">Identity & Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Supplier Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            <Select
              label="Supply Category"
              options={[{ value: '', label: 'Select category' }, ...supplierCategories.map(cat => ({ value: cat.name, label: cat.name }))]}
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-6 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-[10px] font-black text-dark-gray uppercase tracking-[0.2em] opacity-40">Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input label="Contact Person" value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} required />
            <PhoneInput label="Phone Number" value={formData.phone} onChange={val => setFormData({ ...formData, phone: val })} placeholder="7XXXXXXXX" required />
            <Input label="Email Address" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
          </div>
        </div>

        {/* Services & Typical Costs */}
        <div className="space-y-6 bg-azure/5 p-8 rounded-[2.5rem] border border-azure/10">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-azure uppercase tracking-[0.2em]">Services & typical costs</h3>
            <Button type="button" variant="primary" size="sm" onClick={addServiceRow} className="!bg-azure !text-white !shadow-lg text-[10px] font-black uppercase tracking-widest">
              <PlusIcon className="w-3 h-3 mr-2" /> Add Service
            </Button>
          </div>

          <div className="space-y-3">
            {formData.servicesProvided.length === 0 ? (
              <div className="text-center py-8 bg-white/50 rounded-[2rem] border-2 border-dashed border-azure/20">
                <p className="text-[10px] font-black text-azure/40 uppercase tracking-widest">No services listed</p>
              </div>
            ) : (
              formData.servicesProvided.map((service, index) => (
                <div key={index} className="flex gap-3 group">
                  <input type="text" className="flex-1 px-5 py-3 text-sm border border-gray-100 rounded-[1.25rem] bg-white focus:outline-none focus:ring-2 focus:ring-azure shadow-sm" placeholder="Description (e.g., Photography)" value={service.description} onChange={e => updateService(index, 'description', e.target.value)} />
                  <input type="number" className="w-32 px-5 py-3 text-sm border border-gray-100 rounded-[1.25rem] bg-white focus:outline-none focus:ring-2 focus:ring-azure shadow-sm" placeholder="KES" value={service.amount} onChange={e => updateService(index, 'amount', e.target.value)} />
                  <button type="button" onClick={() => removeServiceRow(index)} className="w-11 h-11 flex items-center justify-center bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-6 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-[10px] font-black text-dark-gray uppercase tracking-[0.2em] opacity-40">Payment method</h3>
          <Select
            label=""
            options={[{ value: 'Mpesa B2C', label: 'M-Pesa Send Money (B2C)' }, { value: 'Paybill B2B', label: 'M-Pesa Paybill (B2B)' }, { value: 'Till B2B', label: 'M-Pesa Till Number (B2B)' }, { value: 'Bank', label: 'Bank Transfer' }]}
            value={formData.paymentMethod}
            onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
            required
          />

          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {formData.paymentMethod === 'Mpesa B2C' && <PhoneInput label="M-Pesa Phone Number" value={formData.mpesaPhone} onChange={val => setFormData({ ...formData, mpesaPhone: val })} placeholder="7XXXXXXXX" required />}
            {formData.paymentMethod === 'Paybill B2B' && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Paybill Number" placeholder="123456" value={formData.paybillNumber} onChange={e => setFormData({ ...formData, paybillNumber: e.target.value })} required />
                <Input label="Account Number" placeholder="Account #" value={formData.paybillAccount} onChange={e => setFormData({ ...formData, paybillAccount: e.target.value })} required />
              </div>
            )}
            {formData.paymentMethod === 'Till B2B' && <Input label="Till Number" placeholder="1234567" value={formData.tillNumber} onChange={e => setFormData({ ...formData, tillNumber: e.target.value })} required />}
            {formData.paymentMethod === 'Bank' && (
              <div className="space-y-4 p-6 bg-white rounded-[2rem] border border-gray-100">
                <Input label="Bank Name" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} required />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Account Name" value={formData.accountName} onChange={e => setFormData({ ...formData, accountName: e.target.value })} required />
                  <Input label="Account Number" value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Branch Name" value={formData.branchName} onChange={e => setFormData({ ...formData, branchName: e.target.value })} required />
                  <Input label="SWIFT Code" value={formData.swiftCode} onChange={e => setFormData({ ...formData, swiftCode: e.target.value })} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KYC Documents */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-dark-gray uppercase tracking-[0.2em] opacity-40">KYC Documents</h3>
            <span className="text-[10px] text-gray-400 font-medium">{uploadedDocuments.length} files attached</span>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-[2.5rem] p-8 text-center hover:border-azure hover:bg-azure/5 transition-all group cursor-pointer relative">
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-azure group-hover:text-white transition-all shadow-sm">
                <UploadIcon className="w-8 h-8 text-gray-300 group-hover:text-white" />
              </div>
              <p className="text-xs font-black text-dark-gray uppercase tracking-widest">Click or drag KYC files</p>
              <p className="text-[10px] text-gray-400 mt-2">PDF, JPG, PNG, DOC (Max 10MB each)</p>
            </div>
          </div>

          {uploadedDocuments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploadedDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-azure/5 rounded-xl flex items-center justify-center text-azure">
                      <FileIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-dark-gray truncate">{doc.name}</p>
                      <p className="text-[10px] text-gray-400">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeDocument(index)} className="w-8 h-8 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-4 pt-8 border-t border-gray-100">
          <Button type="button" variant="primary" className="!bg-gray-100 !text-gray-400 !shadow-none hover:!bg-gray-200 uppercase tracking-widest text-xs font-black" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="h-16 px-12 text-black font-black uppercase tracking-[0.2em] !shadow-2xl hover:scale-105 active:scale-95 transition-all">
            Register Supplier
          </Button>
        </div>
      </form>
    </Modal>
  );
}
