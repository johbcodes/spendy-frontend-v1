import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { UploadIcon } from 'lucide-react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSuccess: (documentData: { title: string; category: string; fileName: string; eventId: string }) => void;
}

export function UploadDocumentModal({
  isOpen,
  onClose,
  eventId,
  onSuccess
}: UploadDocumentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    file: null as File | null
  });
  const [fileName, setFileName] = useState('');
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        file: e.target.files[0]
      });
      setFileName(e.target.files[0].name);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !fileName) {
      return;
    }
    if (!eventId) {
      console.error('UploadDocumentModal: No eventId available');
      return;
    }
    onSuccess({
      title: formData.title,
      category: formData.category || 'other',
      fileName: fileName,
      eventId: eventId
    });
    // Reset form
    setFormData({ title: '', category: '', description: '', file: null });
    setFileName('');
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Upload Document" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input type="file" id="document-upload" className="hidden" onChange={handleFileChange} />
          <label htmlFor="document-upload" className="cursor-pointer block">
            <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              {fileName || 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500">
              PDF, DOC, XLS, JPG, PNG (Max 10MB)
            </p>
          </label>
        </div>
        <Input label="Document Title" value={formData.title} onChange={e => setFormData({
        ...formData,
        title: e.target.value
      })} required />
        <Select label="Category" options={[{
        value: 'invoice',
        label: 'Invoice'
      }, {
        value: 'receipt',
        label: 'Receipt'
      }, {
        value: 'contract',
        label: 'Contract'
      }, {
        value: 'proposal',
        label: 'Proposal'
      }, {
        value: 'report',
        label: 'Report'
      }, {
        value: 'other',
        label: 'Other'
      }]} value={formData.category} onChange={e => setFormData({
        ...formData,
        category: e.target.value
      })} required />
        <div>
          <label className="block text-sm font-medium text-dark-gray mb-1">
            Description
          </label>
          <textarea className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure" rows={3} value={formData.description} onChange={e => setFormData({
          ...formData,
          description: e.target.value
        })} />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!formData.file || !formData.title}>
            Upload Document
          </Button>
        </div>
      </form>
    </Modal>;
}