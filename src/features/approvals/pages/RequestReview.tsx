import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import type { Request, Wallet, Expense, Supplier } from '../types';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, RotateCcwIcon, EditIcon, SaveIcon, DownloadIcon } from 'lucide-react';
import { DateTimeDisplay } from '../../../utils/dateFormatter';
import { ApproveExpenseModal } from '../modals/ApproveExpenseModal';

interface RequestReviewProps {
  request: Request;
  wallets: Wallet[];
  expenses?: Expense[];
  suppliers?: Supplier[];
  currentUser?: any;
  onNavigate: (page: string, id?: string) => void;
  onApprove: (walletId: string, supplierId?: string, supplierName?: string) => void;
  onReject: (reason: string) => void;
  onUndoRejection?: (requestId?: string) => void;
  onEditRequest?: (requestId: string, data: any) => void;
}

export function RequestReview({
  request,
  wallets,
  expenses,
  suppliers = [],
  currentUser,
  onNavigate,
  onApprove,
  onReject,
  onUndoRejection,
  onEditRequest
}: RequestReviewProps) {
  // Normalize wallets prop
  const walletsArray: Wallet[] = Array.isArray(wallets)
    ? wallets
    : ((wallets as { data?: Wallet[] })?.data || []);

  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: request.name,
    category: request.category,
    amount: request.amount.toString(),
    description: request.description || '',
    paymentRequestType: request.paymentRequestType || 'single',
    batchPaymentDetails: request.batchPaymentDetails || []
  });
  const [newRecipient, setNewRecipient] = useState<{
    name: string;
    idNumber: string;
    phone?: string;
    paybillNumber?: string;
    accountNumber?: string;
    tillNumber?: string;
    amount: number;
    reference: string;
    paymentMethod: 'mpesa' | 'paybill' | 'till';
  }>({
    name: '',
    idNumber: '',
    phone: '',
    paybillNumber: '',
    accountNumber: '',
    tillNumber: '',
    amount: 0,
    reference: '',
    paymentMethod: 'mpesa'
  });

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Event':
        return 'bg-blue-50 border-blue-200';
      case 'Activation':
        return 'bg-purple-50 border-purple-200';
      case 'Operation':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const isAdmin = currentUser?.role === 'Admin';

  const handleApprove = () => {
    if (isAdmin) {
      // For admins, show the modal with supplier assignment option
      setShowApproveModal(true);
    } else {
      // For non-admins, direct approval (shouldn't happen for event expenses)
      if (!selectedWalletId) {
        alert('Please select a wallet to process this approval');
        return;
      }
      onApprove(selectedWalletId);
    }
  };

  const handleApproveWithFunds = (walletId: string) => {
    onApprove(walletId);
    setShowApproveModal(false);
  };

  const handleAssignToSupplier = (supplierId: string, supplierName: string) => {
    onApprove('', supplierId, supplierName);
    setShowApproveModal(false);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    onReject(rejectionReason);
  };

  const handleSaveEdit = () => {
    if (!editFormData.name.trim() || !editFormData.category.trim() || !editFormData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    if (onEditRequest) {
      onEditRequest(request.id, {
        name: editFormData.name,
        category: editFormData.category,
        amount: Number(editFormData.amount),
        description: editFormData.description,
        paymentRequestType: editFormData.paymentRequestType,
        batchPaymentDetails: editFormData.batchPaymentDetails
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditFormData({
      name: request.name,
      category: request.category,
      amount: request.amount.toString(),
      description: request.description || '',
      paymentRequestType: request.paymentRequestType || 'single',
      batchPaymentDetails: request.batchPaymentDetails || []
    });
    setIsEditing(false);
  };

  const canEdit = request.status === 'Pending' || request.status === 'Rejected';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('approvals')}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Approvals
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-dark-gray">Request Review</h1>
            <p className="text-gray-600 mt-1">Review and process this request</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Request Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Header Card */}
          <Card className={`p-6 border-2 ${getTypeColor(request.type)}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-dark-gray mb-2">{request.name}</h2>
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusVariant(request.status)}>
                    {request.status}
                  </Badge>
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                    {request.type}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Amount</p>
                <p className="text-3xl font-bold text-azure">
                  KES {request.amount.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Request Details Grid */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-gray">Request Information</h3>
              {canEdit && onEditRequest && !isEditing && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <EditIcon className="w-4 h-4" />
                  Edit Request
                </Button>
              )}
              {isEditing && (
                <div className="flex gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleSaveEdit}
                    className="flex items-center gap-2"
                  >
                    <SaveIcon className="w-4 h-4" />
                    Save Changes
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <Input
                  label="Request Name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
                <Input
                  label="Category"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  required
                />
                <Input
                  label="Amount (KES)"
                  type="number"
                  value={editFormData.amount}
                  onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure"
                    rows={4}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  />
                </div>

                {/* Batch Approval Editing Section */}
                {editFormData.paymentRequestType === 'bulk' && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-dark-gray mb-3">Edit Batch Approval Details</h4>

                    {/* Add New Recipient Form */}
                    <div className="space-y-3 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          label="Full Name"
                          placeholder="John Doe"
                          value={newRecipient.name || ''}
                          onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                        />
                        <Input
                          label="ID Number"
                          placeholder="12345678"
                          value={newRecipient.idNumber || ''}
                          onChange={(e) => setNewRecipient({ ...newRecipient, idNumber: e.target.value })}
                        />
                        <Input
                          label="Amount"
                          type="number"
                          placeholder="5000"
                          value={newRecipient.amount || ''}
                          onChange={(e) => setNewRecipient({ ...newRecipient, amount: parseFloat(e.target.value) || 0 })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          label="Reference"
                          placeholder="Payment for services"
                          value={newRecipient.reference || ''}
                          onChange={(e) => setNewRecipient({ ...newRecipient, reference: e.target.value })}
                        />
                        <div>
                          <label className="block text-sm font-medium text-dark-gray mb-1">Payment Method</label>
                          <select
                            value={newRecipient.paymentMethod || 'mpesa'}
                            onChange={(e) => setNewRecipient({ ...newRecipient, paymentMethod: e.target.value as 'mpesa' | 'paybill' | 'till' })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure"
                          >
                            <option value="mpesa">M-Pesa</option>
                            <option value="paybill">Paybill</option>
                            <option value="till">Till</option>
                          </select>
                        </div>
                      </div>

                      {/* Payment Method Specific Fields */}
                        {newRecipient.paymentMethod === 'mpesa' && (
                          <PhoneInput
                            label="Phone Number"
                            placeholder="7XXXXXXXX"
                            value={newRecipient.phone || ''}
                            onChange={(value) => setNewRecipient({ ...newRecipient, phone: value })}
                          />
                        )}
                      {newRecipient.paymentMethod === 'paybill' && (
                        <>
                          <Input
                            label="Paybill Number"
                            placeholder="123456"
                            value={newRecipient.paybillNumber || ''}
                            onChange={(e) => setNewRecipient({ ...newRecipient, paybillNumber: e.target.value })}
                          />
                          <Input
                            label="Account Number"
                            placeholder="ACC001"
                            value={newRecipient.accountNumber || ''}
                            onChange={(e) => setNewRecipient({ ...newRecipient, accountNumber: e.target.value })}
                          />
                        </>
                      )}
                      {newRecipient.paymentMethod === 'till' && (
                        <Input
                          label="Till Number"
                          placeholder="654321"
                          value={newRecipient.tillNumber || ''}
                          onChange={(e) => setNewRecipient({ ...newRecipient, tillNumber: e.target.value })}
                        />
                      )}

                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          if (!newRecipient.name || !newRecipient.idNumber || newRecipient.amount <= 0) {
                            alert('Please fill in all required fields for the recipient');
                            return;
                          }
                          setEditFormData({
                            ...editFormData,
                            batchPaymentDetails: [...editFormData.batchPaymentDetails, newRecipient]
                          });
                          setNewRecipient({
                            name: '',
                            idNumber: '',
                            phone: '',
                            paybillNumber: '',
                            accountNumber: '',
                            tillNumber: '',
                            amount: 0,
                            reference: '',
                            paymentMethod: 'mpesa'
                          });
                        }}
                        disabled={!newRecipient.name || !newRecipient.idNumber || newRecipient.amount <= 0}
                      >
                        Add Recipient
                      </Button>
                    </div>

                    {/* Existing Recipients List */}
                    {editFormData.batchPaymentDetails && editFormData.batchPaymentDetails.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-dark-gray mb-2">Recipients ({editFormData.batchPaymentDetails.length})</h5>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {editFormData.batchPaymentDetails.map((recipient, index) => (
                            <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 flex justify-between items-center">
                              <div>
                                <p className="font-medium text-sm">{recipient.name}</p>
                                <p className="text-xs text-gray-500">ID: {recipient.idNumber} | KES {recipient.amount.toLocaleString()}</p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => {
                                  const updatedRecipients = [...editFormData.batchPaymentDetails];
                                  updatedRecipients.splice(index, 1);
                                  setEditFormData({ ...editFormData, batchPaymentDetails: updatedRecipients });
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>KES {editFormData.batchPaymentDetails.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Requested By</p>
                    <p className="text-sm font-medium text-dark-gray">{request.requestedBy}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Date Requested</p>
                    <DateTimeDisplay dateTime={request.dateRequested} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Request Type</p>
                    <p className="text-sm font-medium text-dark-gray">{request.type}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Request Name</p>
                  <p className="text-sm font-medium text-dark-gray">{request.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Category</p>
                  <p className="text-sm font-medium text-dark-gray">{request.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Amount</p>
                  <p className="text-sm font-medium text-dark-gray">KES {request.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Requested By</p>
                  <p className="text-sm font-medium text-dark-gray">{request.requestedBy}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Date Requested</p>
                  <DateTimeDisplay dateTime={request.dateRequested} />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Request Type</p>
                  <p className="text-sm font-medium text-dark-gray">{request.type}</p>
                </div>
              </div>
            )}

            {!isEditing && request.description && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-600 mb-2">Description</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {request.description}
                </p>
              </div>
            )}

            {request.location && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-600 mb-2">Location</p>
                <p className="text-sm font-medium text-dark-gray">{request.location}</p>
              </div>
            )}

            {/* Batch Approval Details Section */}
            {request.paymentRequestType === 'bulk' && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-dark-gray">Batch Approval Details</h4>
                  {request.batchPaymentDetails && request.batchPaymentDetails.length > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        // Download CSV functionality
                        let csvContent = 'Full Name,ID Number,Amount,Reference';
                        const batchDetails = request.batchPaymentDetails || [];
                        const hasMpesa = batchDetails.some(r => r.paymentMethod === 'mpesa');
                        const hasPaybill = batchDetails.some(r => r.paymentMethod === 'paybill');
                        const hasTill = batchDetails.some(r => r.paymentMethod === 'till');

                        if (hasMpesa) csvContent += ',Phone Number';
                        if (hasPaybill) csvContent += ',Paybill Number,Account Number';
                        if (hasTill) csvContent += ',Till Number';

                        const csvRows = batchDetails.map(recipient => {
                          let row = `"${recipient.name}","${recipient.idNumber}",${recipient.amount},"${recipient.reference}"`;

                          if (hasMpesa) {
                            row += `,"${recipient.phone || ''}"`;
                          }
                          if (hasPaybill) {
                            row += `,"${recipient.paybillNumber || ''}","${recipient.accountNumber || ''}"`;
                          }
                          if (hasTill) {
                            row += `,"${recipient.tillNumber || ''}"`;
                          }

                          return row;
                        });

                        const csvData = `${csvContent}\n${csvRows.join('\n')}`;
                        const blob = new Blob([csvData], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `batch_approval_${request.name.replace(/\s+/g, '_')}.csv`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-2"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      Download CSV
                    </Button>
                  )}
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-dark-gray mb-2">Request Type: <span className="text-azure">Batch Approval</span></p>
                  {request.batchPaymentDetails && request.batchPaymentDetails.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">Recipients: {request.batchPaymentDetails.length}</p>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {request.batchPaymentDetails.map((recipient, index) => (
                          <div key={index} className="p-2 bg-white rounded border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{recipient.name}</p>
                                <p className="text-xs text-gray-500">ID: {recipient.idNumber}</p>
                                <p className="text-xs text-gray-500">Amount: KES {recipient.amount.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Method: {recipient.paymentMethod}</p>
                                {recipient.reference && (
                                  <p className="text-xs text-gray-500">Reference: {recipient.reference}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>KES {request.batchPaymentDetails.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No batch approval recipients added</p>
                  )}
                </div>
              </div>
            )}

            {/* Batch Expense Details Section - when request is linked to a batch expense */}
            {(() => {
              const linkedExpense = request.expenseId && expenses?.find(e => e.id === request.expenseId && e.expenseRequestType === 'batch');
              if (!linkedExpense) return null;

              const getPaymentMethodLabel = (method: string) => {
                switch (method) {
                  case 'sendMoney':
                    return 'Send Money';
                  case 'paybill':
                    return 'Paybill';
                  case 'buyGoods':
                    return 'Buy Goods & Services';
                  default:
                    return 'Send Money';
                }
              };

              const calculateTotalAmount = () => {
                let total = 0;
                if (linkedExpense.allRecipients && linkedExpense.allRecipients.length > 0) {
                  total = linkedExpense.allRecipients.reduce((sum, recipient) => sum + recipient.amount, 0);
                } else {
                  if (linkedExpense.batchCategories) {
                    linkedExpense.batchCategories.forEach(category => {
                      category.items.forEach(item => {
                        total += item.amount;
                      });
                    });
                  }
                  if (linkedExpense.csvData) {
                    linkedExpense.csvData.forEach(item => {
                      total += item.amount;
                    });
                  }
                  if (linkedExpense.expenses) {
                    linkedExpense.expenses.forEach(expense => {
                      total += expense.amount;
                    });
                  }
                }
                return total;
              };

              const getRecipientCount = () => {
                if (linkedExpense.allRecipients && linkedExpense.allRecipients.length > 0) {
                  return linkedExpense.allRecipients.length;
                }
                let count = 0;
                if (linkedExpense.batchCategories) {
                  linkedExpense.batchCategories.forEach(category => {
                    count += category.items.length;
                  });
                }
                if (linkedExpense.csvData) {
                  count += linkedExpense.csvData.length;
                }
                if (linkedExpense.expenses) {
                  count += linkedExpense.expenses.length;
                }
                return count;
              };

              return (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-dark-gray">Batch Expense Details</h4>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        // Download CSV for batch expense
                        let csvContent = 'Category,Recipient Name,Payment Method,Phone/Paybill/Till,Account Number,Amount,Reference\n';
                        const allRecipients: any[] = [];

                        if (linkedExpense.allRecipients && linkedExpense.allRecipients.length > 0) {
                          linkedExpense.allRecipients.forEach(item => {
                            allRecipients.push({
                              category: item.category,
                              recipientName: item.recipientName,
                              paymentMethod: item.paymentMethod,
                              phonePaybillTill: item.paymentMethod === 'sendMoney' ? item.phoneNumber : item.paymentMethod === 'paybill' ? item.paybillNumber : item.tillNumber,
                              accountNumber: item.accountNumber || '',
                              amount: item.amount,
                              reference: item.reference
                            });
                          });
                        } else {
                          // Fallback to old structure
                          if (linkedExpense.batchCategories) {
                            linkedExpense.batchCategories.forEach(category => {
                              category.items.forEach(item => {
                                allRecipients.push({
                                  category: category.category,
                                  recipientName: item.recipientName,
                                  paymentMethod: item.paymentMethod,
                                  phonePaybillTill: item.paymentMethod === 'sendMoney' ? item.phoneNumber : item.paymentMethod === 'paybill' ? item.paybillNumber : item.tillNumber,
                                  accountNumber: item.accountNumber || '',
                                  amount: item.amount,
                                  reference: item.reference
                                });
                              });
                            });
                          }
                          if (linkedExpense.csvData) {
                            linkedExpense.csvData.forEach(item => {
                              allRecipients.push({
                                category: item.category,
                                recipientName: item.recipientName,
                                paymentMethod: item.paymentMethod,
                                phonePaybillTill: item.phonePaybillTill || '',
                                accountNumber: item.accountNumber || '',
                                amount: item.amount,
                                reference: item.reference
                              });
                            });
                          }
                          if (linkedExpense.expenses) {
                            linkedExpense.expenses.forEach(expense => {
                              allRecipients.push({
                                category: expense.category,
                                recipientName: expense.recipientName,
                                paymentMethod: expense.paymentMethod,
                                phonePaybillTill: expense.paymentMethod === 'sendMoney' ? expense.phoneNumber : expense.paymentMethod === 'paybill' ? expense.paybillNumber : expense.tillNumber,
                                accountNumber: expense.accountNumber || '',
                                amount: expense.amount,
                                reference: expense.reference
                              });
                            });
                          }
                        }

                        allRecipients.forEach(recipient => {
                          csvContent += `"${recipient.category}","${recipient.recipientName}","${recipient.paymentMethod}","${recipient.phonePaybillTill}","${recipient.accountNumber}",${recipient.amount},"${recipient.reference}"\n`;
                        });

                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `batch_expense_${linkedExpense.title.replace(/\s+/g, '_')}_${Date.now()}.csv`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-2"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      Download CSV
                    </Button>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Batch Expense</p>
                        <p className="font-medium text-dark-gray">{linkedExpense.title}</p>
                        <p className="text-xs text-gray-500">Context: {linkedExpense.expenseContextType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-lg font-bold text-azure">
                          KES {calculateTotalAmount().toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-blue-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Categories Breakdown:</p>
                      {linkedExpense.batchCategories && linkedExpense.batchCategories.length > 0 ? (
                        <div className="space-y-1">
                          {linkedExpense.batchCategories.map((category, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span className="text-gray-600">{category.category}</span>
                              <span className="font-medium">KES {category.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">No categories</p>
                      )}
                    </div>

                    {/* Recipients */}
                    <div className="pt-3 border-t border-blue-200">
                      <h5 className="font-semibold text-dark-gray mb-3">Recipients ({getRecipientCount()})</h5>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {linkedExpense.allRecipients && linkedExpense.allRecipients.length > 0 ? (
                          // Group recipients by category for display
                          Object.entries(
                            linkedExpense.allRecipients.reduce((acc, recipient) => {
                              if (!acc[recipient.category]) {
                                acc[recipient.category] = [];
                              }
                              acc[recipient.category].push(recipient);
                              return acc;
                            }, {} as Record<string, typeof linkedExpense.allRecipients>)
                          ).map(([categoryName, recipients]) => (
                            <div key={categoryName} className="mb-4">
                              <h6 className="font-medium text-sm text-dark-gray mb-2">{categoryName}</h6>
                              {recipients.map((item, itemIndex) => (
                                <div key={itemIndex} className="p-3 bg-white rounded-lg border border-gray-200 mb-2">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm text-dark-gray">{item.recipientName}</p>
                                      <p className="text-xs text-gray-500">
                                        {getPaymentMethodLabel(item.paymentMethod)} | {item.reference}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-azure">KES {item.amount.toLocaleString()}</p>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-600 space-y-0.5">
                                    {item.paymentMethod === 'sendMoney' && item.phoneNumber && (
                                      <p>Phone: {item.phoneNumber}</p>
                                    )}
                                    {item.paymentMethod === 'paybill' && (
                                      <>
                                        {item.paybillNumber && <p>Paybill: {item.paybillNumber}</p>}
                                        {item.accountNumber && <p>Account: {item.accountNumber}</p>}
                                      </>
                                    )}
                                    {item.paymentMethod === 'buyGoods' && item.tillNumber && (
                                      <p>Till: {item.tillNumber}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))
                        ) : (
                          // Fallback to old structure
                          <>
                            {linkedExpense.batchCategories && linkedExpense.batchCategories.map((category, categoryIndex) => (
                              <div key={categoryIndex} className="mb-4">
                                <h6 className="font-medium text-sm text-dark-gray mb-2">{category.category}</h6>
                                {category.items.map((item, itemIndex) => (
                                  <div key={itemIndex} className="p-3 bg-white rounded-lg border border-gray-200 mb-2">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <p className="font-medium text-sm text-dark-gray">{item.recipientName}</p>
                                        <p className="text-xs text-gray-500">
                                          {getPaymentMethodLabel(item.paymentMethod)} | {item.reference}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-azure">KES {item.amount.toLocaleString()}</p>
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-600 space-y-0.5">
                                      {item.paymentMethod === 'sendMoney' && item.phoneNumber && (
                                        <p>Phone: {item.phoneNumber}</p>
                                      )}
                                      {item.paymentMethod === 'paybill' && (
                                        <>
                                          {item.paybillNumber && <p>Paybill: {item.paybillNumber}</p>}
                                          {item.accountNumber && <p>Account: {item.accountNumber}</p>}
                                        </>
                                      )}
                                      {item.paymentMethod === 'buyGoods' && item.tillNumber && (
                                        <p>Till: {item.tillNumber}</p>
                                      )}
                                {item.description && <p className="text-gray-500 italic">Description: {item.description}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}

                            {linkedExpense.csvData && linkedExpense.csvData.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h6 className="font-medium text-sm text-dark-gray mb-2">CSV Recipients</h6>
                                {linkedExpense.csvData.map((item, index) => (
                                  <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 mb-2">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <p className="font-medium text-sm text-dark-gray">{item.recipientName}</p>
                                        <p className="text-xs text-gray-500">
                                          {item.paymentMethod} | {item.reference}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-azure">KES {item.amount.toLocaleString()}</p>
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-600 space-y-0.5">
                                      <p>Category: {item.category}</p>
                                      {item.phonePaybillTill && <p>Details: {item.phonePaybillTill}</p>}
                                      {item.accountNumber && <p>Account: {item.accountNumber}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {linkedExpense.expenses && linkedExpense.expenses.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h6 className="font-medium text-sm text-dark-gray mb-2">Quick Add Recipients</h6>
                                {linkedExpense.expenses.map((expense, index) => (
                                  <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 mb-2">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <p className="font-medium text-sm text-dark-gray">{expense.recipientName}</p>
                                        <p className="text-xs text-gray-500">
                                          {getPaymentMethodLabel(expense.paymentMethod)} | {expense.reference}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-azure">KES {expense.amount.toLocaleString()}</p>
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-600 space-y-0.5">
                                      <p>Category: {expense.category}</p>
                                      {expense.paymentMethod === 'sendMoney' && expense.phoneNumber && (
                                        <p>Phone: {expense.phoneNumber}</p>
                                      )}
                                      {expense.paymentMethod === 'paybill' && (
                                        <>
                                          {expense.paybillNumber && <p>Paybill: {expense.paybillNumber}</p>}
                                          {expense.accountNumber && <p>Account: {expense.accountNumber}</p>}
                                        </>
                                      )}
                                      {expense.paymentMethod === 'buyGoods' && expense.tillNumber && (
                                        <p>Till: {expense.tillNumber}</p>
                                      )}
                                      {expense.description && <p className="text-gray-500 italic">Description: {expense.description}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-dark-gray">Total Amount:</span>
                          <div className="text-right">
                            <span className="text-xl font-bold text-azure">
                              KES {calculateTotalAmount().toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>

          {/* Processed Information (if already processed) */}
          {(request.status === 'Approved' || request.status === 'Completed' || request.status === 'Rejected') && (
            <Card className="p-6 bg-gray-50 space-y-4">
              <h3 className="text-lg font-semibold text-dark-gray">Processing Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Processed By</p>
                  <p className="text-sm font-medium text-dark-gray">
                    {request.processedBy || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Date Processed</p>
                  <p className="text-sm font-medium text-dark-gray">
                    {request.dateProcessed || 'N/A'}
                  </p>
                </div>
              </div>
              {request.status === 'Rejected' && request.rejectionReason && (
                <div className="border-t border-gray-300 pt-4">
                  <p className="text-xs text-gray-600 mb-2">Rejection Reason</p>
                  <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
                    {request.rejectionReason}
                  </p>
                </div>
              )}
              {request.status === 'Completed' && (
                <div className="border-t border-gray-300 pt-4">
                  <p className="text-xs text-gray-600 mb-2">Payment Status</p>
                  <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg font-medium">
                    Payment processed successfully
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Action Panel */}
        <div className="space-y-4">
          {request.status === 'Pending' ? (
            <>
              {!showRejectForm ? (
                <>
                  {/* Approval Section */}
                  <Card className="p-6 border-2 border-green-200 bg-green-50">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">Approve Request</h3>
                    <div className="space-y-3">
                      {isAdmin ? (
                        <>
                          <p className="text-sm text-gray-700 mb-3">
                            Choose how to approve this expense:
                          </p>
                          <Button
                            variant="success"
                            onClick={handleApprove}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Approve Request
                          </Button>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Wallet
                            </label>
                            <select
                              value={selectedWalletId}
                              onChange={(e) => setSelectedWalletId(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              <option value="">Choose a wallet...</option>
                              {walletsArray.map(wallet => (
                                <option key={wallet.id} value={wallet.id}>
                                  {wallet.name} - KES {wallet.balance.toLocaleString()}
                                </option>
                              ))}
                            </select>
                          </div>
                          <Button
                            variant="success"
                            onClick={handleApprove}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Approve Request
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>

                  {/* Rejection Section */}
                  <Card className="p-6 border-2 border-red-200 bg-red-50">
                    <h3 className="text-lg font-semibold text-red-900 mb-4">Reject Request</h3>
                    <Button
                      variant="danger"
                      onClick={() => setShowRejectForm(true)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Reject Request
                    </Button>
                  </Card>
                </>
              ) : (
                /* Rejection Form */
                <Card className="p-6 border-2 border-red-300 bg-red-50">
                  <h3 className="text-lg font-semibold text-red-900 mb-4">Rejection Reason</h3>
                  <div className="space-y-3">
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setShowRejectForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        onClick={handleReject}
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        Confirm Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          ) : (
            /* Status Display for already processed requests */
            <Card className={`p-6 border-2 ${request.status === 'Approved' || request.status === 'Completed' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center gap-3 mb-4">
                {request.status === 'Approved' || request.status === 'Completed' ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                )}
                <h3 className={`text-lg font-semibold ${request.status === 'Approved' || request.status === 'Completed' ? 'text-green-900' : 'text-red-900'}`}>
                  {request.status === 'Completed' ? 'Completed & Paid' : request.status === 'Approved' ? 'Approved' : 'Rejected'}
                </h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                This request has already been {request.status === 'Completed' ? 'completed and paid' : request.status.toLowerCase()}{request.status === 'Rejected' ? '. You can edit the details or move it back to pending.' : ' and cannot be modified.'}.
              </p>
              {request.status === 'Rejected' && onUndoRejection && (
                <Button
                  variant="warning"
                  onClick={() => onUndoRejection()}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <RotateCcwIcon className="w-4 h-4" />
                  Undo Rejection - Move to Pending
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Admin Approval Modal */}
      {isAdmin && (
        <ApproveExpenseModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          request={request}
          wallets={walletsArray}
          suppliers={suppliers}
          onApproveWithFunds={handleApproveWithFunds}
          onAssignToSupplier={handleAssignToSupplier}
        />
      )}
    </div>
  );
}

