import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { ArrowLeftIcon, UploadIcon, FileIcon, CheckCircleIcon, XIcon } from 'lucide-react';

interface UploadDocumentPageProps {
  eventId: string;
  eventName: string;
  onNavigate: (page: string) => void;
  onUploadDocument: (documentData: any) => void;
}

export function UploadDocumentPage({
  eventId,
  eventName,
  onNavigate,
  onUploadDocument
}: UploadDocumentPageProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'other',
    description: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !fileName) {
      alert('Please fill in all required fields and select a file');
      return;
    }

    setIsProcessing(true);

    // Simulate file upload
    setTimeout(() => {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUploadDocument({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          fileName: fileName,
          fileData: reader.result,
          eventId: eventId,
          uploadedAt: new Date().toISOString()
        });

        setIsProcessing(false);
        setShowSuccess(true);
        setTimeout(() => {
          onNavigate('event-detail');
        }, 1500);
      };
      reader.readAsDataURL(file!);
    }, 1000);
  };

  if (showSuccess) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => onNavigate('event-detail')}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Event
        </Button>
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircleIcon className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Document Uploaded</h2>
          <p className="text-gray-600">
            "{formData.title}" has been successfully uploaded to "{eventName}".
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('event-detail')} className="p-0">
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-dark-gray">Upload Document</h1>
          <p className="text-gray-600 mt-1">Add documents to "{eventName}"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div>
                <h3 className="text-lg font-semibold text-dark-gray mb-4">Select File</h3>
                
                {!fileName ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                      dragActive
                        ? 'border-azure bg-blue-50'
                        : 'border-gray-300 bg-light-gray hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="document-upload"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="document-upload" className="cursor-pointer block">
                      <UploadIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-base font-medium text-dark-gray mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB)
                      </p>
                    </label>
                  </div>
                ) : (
                  <Card className="p-4 bg-green-50 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-dark-gray">{fileName}</p>
                          <p className="text-sm text-gray-500">Ready to upload</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </Card>
                )}
              </div>

              {/* Document Details */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-dark-gray mb-4">Document Details</h3>
                
                <div className="space-y-4">
                  <Input
                    label="Document Title *"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Event Budget Report, Invoice, Contract"
                    required
                  />

                  <Select
                    label="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    options={[
                      { value: 'invoice', label: 'Invoice' },
                      { value: 'receipt', label: 'Receipt' },
                      { value: 'contract', label: 'Contract' },
                      { value: 'proposal', label: 'Proposal' },
                      { value: 'report', label: 'Report' },
                      { value: 'budget', label: 'Budget' },
                      { value: 'other', label: 'Other' }
                    ]}
                  />

                  <div>
                    <label className="block text-sm font-medium text-dark-gray mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add any notes about this document..."
                    />
                  </div>
                </div>
              </div>

              {/* Processing State */}
              {isProcessing && (
                <Card className="p-4 bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                    <p className="text-sm font-medium text-yellow-800">Uploading document...</p>
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onNavigate('event-detail')}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!fileName || !formData.title || isProcessing}
                  className={(!fileName || !formData.title || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar - Info */}
        <div className="space-y-4">
          <Card className="p-6 bg-gradient-to-br from-azure to-blue-700 text-white">
            <h3 className="font-semibold mb-4">Upload Guidelines</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-blue-200">✓</span>
                <span>Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-200">✓</span>
                <span>Maximum file size: 10MB</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-200">✓</span>
                <span>Documents are associated with this event</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-200">✓</span>
                <span>You can upload multiple documents</span>
              </li>
            </ul>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold text-dark-gray mb-2">Event Information</h4>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600 text-xs mb-1">Event Name</p>
                <p className="font-medium text-dark-gray">{eventName}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
