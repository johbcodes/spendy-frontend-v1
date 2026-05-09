import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Supplier } from '../../../types';
import { FileIcon, MailIcon, PhoneIcon, PackageIcon, DollarSignIcon, EditIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

interface ViewSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onEdit?: (supplier: Supplier) => void;
  onDelete?: (supplierId: string) => void;
}
export function ViewSupplierModal({
  isOpen,
  onClose,
  supplier,
  onEdit,
  onDelete
}: ViewSupplierModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Supplier | null>(null);

  if (!isOpen) return null;
  if (!supplier) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Supplier Details" size="lg">
        <div className="text-center py-8">
          <p className="text-gray-500">No supplier data available</p>
        </div>
      </Modal>
    );
  }

  const handleEditMode = () => {
    setEditData({ ...supplier });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editData && onEdit) {
      onEdit(editData);
      setIsEditing(false);
      onClose();
    }
  };

  const handleDeleteSupplier = () => {
    if (onDelete && window.confirm(`Are you sure you want to delete ${supplier.name}? This action cannot be undone.`)) {
      onDelete(supplier.id);
      onClose();
    }
  };

  return <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Supplier" : "Supplier Details"} size="lg">
      <div className="space-y-6">
        {/* Header with Edit/Delete buttons */}
        {!isEditing && (
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-dark-gray">{supplier.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{supplier.category}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleEditMode}>
                <EditIcon className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteSupplier}>
                <TrashIcon className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-dark-gray">Edit Supplier</h2>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
            </div>
          </div>
        )}

        {!isEditing && (
          <>
            <div className="flex items-start justify-between">
              <div className="flex gap-2">
                <Badge variant={supplier.status === 'Active' ? 'success' : 'default'}>
                  {supplier.status}
                </Badge>
                <Badge variant={supplier.paymentStatus === 'Completed' ? 'success' : supplier.paymentStatus === 'Pending' ? 'warning' : 'default'}>
                  {supplier.paymentStatus || 'N/A'}
                </Badge>
              </div>
            </div>
          </>
        )}

        {isEditing && (
          <div className="bg-light-gray p-4 rounded-lg space-y-4">
            <Input
              label="Supplier Name"
              value={editData?.name || ''}
              onChange={e => setEditData(editData ? { ...editData, name: e.target.value } : null)}
            />
            <Input
              label="Category"
              value={editData?.category || ''}
              onChange={e => setEditData(editData ? { ...editData, category: e.target.value } : null)}
            />
            <Input
              label="Contact Person"
              value={editData?.contactPerson || ''}
              onChange={e => setEditData(editData ? { ...editData, contactPerson: e.target.value } : null)}
            />
            <Input
              label="Phone"
              value={editData?.phone || ''}
              onChange={e => setEditData(editData ? { ...editData, phone: e.target.value } : null)}
            />
            <Input
              label="Email"
              value={editData?.email || ''}
              onChange={e => setEditData(editData ? { ...editData, email: e.target.value } : null)}
            />
            <Input
              label="Amount (Optional)"
              type="number"
              value={editData?.amount || ''}
              onChange={e => setEditData(editData ? { ...editData, amount: Number(e.target.value) || undefined } : null)}
              placeholder="Leave blank to use service total"
            />
              <Select
              label="Approval Required"
              value={editData?.approvalRequired ? 'yes' : 'no'}
              onChange={e => setEditData(editData ? { ...editData, approvalRequired: e.target.value === 'yes' } : null)}
              options={[{ value: 'yes', label: 'Yes (Approval required)' }, { value: 'no', label: 'No (Skip approval)' }]}
            />
          </div>
        )}

        {/* Services Provided & Amount */}
        {supplier.servicesProvided && Array.isArray(supplier.servicesProvided) && supplier.servicesProvided.length > 0 && (
          <div className="bg-light-gray p-4 rounded-lg">
            <h3 className="font-semibold text-dark-gray mb-3">Services Provided & Amounts</h3>
            <div className="space-y-2">
              {supplier.servicesProvided.map((service: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-900">{service.description}</p>
                  <p className="text-sm font-bold text-azure">KES {Number(service.amount).toLocaleString()}</p>
                </div>
              ))}
              <div className="flex justify-between items-center p-3 bg-azure bg-opacity-10 rounded-lg border-t-2 border-azure">
                <p className="text-sm font-semibold text-dark-gray">Total Amount</p>
                <p className="text-lg font-bold text-azure">
                  KES {(supplier.amount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Information */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <DollarSignIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-dark-gray">Payment Information</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">Payment Method</p>
              <Badge variant="info">{supplier.paymentMethod || 'Not specified'}</Badge>
            </div>

            {/* M-Pesa B2C */}
            {supplier.paymentMethod === 'Mpesa B2C' && supplier.mpesaPhone && (
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">M-Pesa Phone Number</p>
                <p className="text-sm font-medium text-dark-gray">{supplier.mpesaPhone}</p>
              </div>
            )}

            {/* Paybill B2B */}
            {supplier.paymentMethod === 'Paybill B2B' && (
              <div className="bg-white p-3 rounded-lg space-y-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Paybill Number</p>
                  <p className="text-sm font-medium text-dark-gray">{supplier.paybillNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Account Number</p>
                  <p className="text-sm font-medium text-dark-gray">{supplier.paybillAccount || 'N/A'}</p>
                </div>
              </div>
            )}

            {/* Till B2B */}
            {supplier.paymentMethod === 'Till B2B' && supplier.tillNumber && (
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Till Number</p>
                <p className="text-sm font-medium text-dark-gray">{supplier.tillNumber}</p>
              </div>
            )}

            {/* Bank Transfer */}
            {supplier.paymentMethod === 'Bank' && (
              <div className="bg-white p-3 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Bank Name</p>
                    <p className="text-sm font-medium text-dark-gray">{supplier.bankName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Account Name</p>
                    <p className="text-sm font-medium text-dark-gray">{supplier.accountName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Account Number</p>
                    <p className="text-sm font-medium text-dark-gray">{supplier.accountNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Branch Name</p>
                    <p className="text-sm font-medium text-dark-gray">{supplier.branchName || 'N/A'}</p>
                  </div>
                  {supplier.swiftCode && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-600 mb-1">SWIFT Code</p>
                      <p className="text-sm font-medium text-dark-gray">{supplier.swiftCode}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {supplier.event && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Related Event</p>
                <p className="text-sm font-medium text-dark-gray">{supplier.event}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-light-gray p-4 rounded-lg">
          <h3 className="font-semibold text-dark-gray mb-3">
            Contact Information
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <PackageIcon className="w-4 h-4 text-azure" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Contact Person</p>
                <p className="text-sm font-medium">{supplier.contactPerson}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <PhoneIcon className="w-4 h-4 text-azure" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Phone</p>
                <p className="text-sm font-medium">{supplier.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <MailIcon className="w-4 h-4 text-azure" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Email</p>
                <p className="text-sm font-medium">{supplier.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        {supplier.documents && supplier.documents.length > 0 && <div>
            <h3 className="font-semibold text-dark-gray mb-3">Documents</h3>
            <div className="space-y-2">
              {supplier.documents.map((doc: any, index: number) => <div key={index} className="flex items-center gap-3 p-3 bg-light-gray rounded-lg">
                  <FileIcon className="w-5 h-5 text-azure" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-dark-gray">
                      {doc.name}
                    </p>
                  </div>
                  <Button variant="ghost" size="xs">
                    View
                  </Button>
                </div>)}
            </div>
          </div>}

        <div className="flex justify-end gap-2 pt-4">
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </Modal>;
}
