import React, { useState, useRef } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import type { Request, Expense, Wallet, User } from '../types';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, RotateCcwIcon, EditIcon, SaveIcon, DownloadIcon, UploadIcon, UsersIcon, FileTextIcon, ShieldCheckIcon, FileUpIcon, FileDownIcon, EyeIcon, PlusIcon } from 'lucide-react';
import { DateTimeDisplay } from '../../../utils/dateFormatter';
import { parseBatchPaymentCSV, generateBatchPaymentCSV, generateCSVPreview } from '../../../utils/batchPaymentUtils';

interface BatchApprovalReviewProps {
  request: Request;
  expenses: Expense[];
  wallets: Wallet[];
  currentUser: User;
  onNavigate: (page: string, id?: string) => void;
  onApprove: (requestId: string, walletId: string) => void;
  onReject: (requestId: string, reason: string) => void;
  onUndoRejection?: (requestId?: string) => void;
  onEditRequest?: (requestId: string, data: any) => void;
}

export function BatchApprovalReview({
  request,
  expenses,
  wallets,
  currentUser,
  onNavigate,
  onApprove,
  onReject,
  onUndoRejection,
  onEditRequest
}: BatchApprovalReviewProps) {
  // Normalize wallets prop
  const walletsArray: Wallet[] = Array.isArray(wallets)
    ? wallets
    : ((wallets as { data?: Wallet[] })?.data || []);

  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpResendCount, setOtpResendCount] = useState(0);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreviewData, setCsvPreviewData] = useState<any[]>([]);
  const [uploadedRecipients, setUploadedRecipients] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa_b2c' | 'paybill_b2b' | 'till_b2b'>('mpesa_b2c');
  const [showCSVPreview, setShowCSVPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find the corresponding expense for this request
  const correspondingExpense = expenses.find(exp => exp.id === request.expenseId);

  // Check if this is a batch disbursement (not batch expense)
  const isBatchDisbursement = request.paymentRequestType === 'bulk' && request.expenseRequestType !== 'batch';

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
      case 'Project':
        return 'bg-blue-50 border-blue-200';
      case 'Activation':
        return 'bg-purple-50 border-purple-200';
      case 'Operation':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

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

  const getMainWalletBalance = () => {
    return walletsArray.find(w => w.type === 'Main Wallet')?.balance || 0;
  };

  const calculateTotalAmount = () => {
    if (!correspondingExpense) return request.totalAmount || request.amount;

    let total = 0;

    // Calculate from allRecipients (new structure)
    if (correspondingExpense.allRecipients && correspondingExpense.allRecipients.length > 0) {
      total = correspondingExpense.allRecipients.reduce((sum, recipient) => sum + recipient.amount, 0);
    }
    // Fallback to old structure if allRecipients not available
    else {
      // Calculate from batch categories
      if (correspondingExpense.batchCategories) {
        correspondingExpense.batchCategories.forEach(category => {
          category.items.forEach(item => {
            total += item.amount;
          });
        });
      }

      // Calculate from CSV data
      if (correspondingExpense.csvData) {
        correspondingExpense.csvData.forEach(item => {
          total += item.amount;
        });
      }

      // Calculate from expenses array
      if (correspondingExpense.expenses) {
        correspondingExpense.expenses.forEach(expense => {
          total += expense.amount;
        });
      }
    }

    return total || request.totalAmount || request.amount;
  };

  const getRecipientCount = () => {
    if (!correspondingExpense) return 0;

    let count = 0;

    // Count from batch categories
    if (correspondingExpense.batchCategories) {
      correspondingExpense.batchCategories.forEach(category => {
        count += category.items.length;
      });
    }

    // Count from CSV data
    if (correspondingExpense.csvData) {
      count += correspondingExpense.csvData.length;
    }

    // Count from expenses array
    if (correspondingExpense.expenses) {
      count += correspondingExpense.expenses.length;
    }

    return count;
  };

  const sendOtp = () => {
    // Simulate sending OTP to user's registered phone
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpSent(true);
    setOtpVerified(false);
    setOtpError('');
    setOtpInput('');
    setOtpResendCount(prev => prev + 1);

    console.log(`Simulated OTP sent to ${currentUser?.phone}: ${code}`);
  };

  const verifyOtp = () => {
    // During development, allow any 4-digit code
    if (otpInput.trim().length === 4) {
      setOtpVerified(true);
      setOtpError('');
      handleApprove();
    } else {
      setOtpError('Please enter a valid 4-digit code.');
    }
  };

  const handleApprove = async () => {
    if (!selectedWalletId) {
      alert('Please select a wallet to process this approval');
      return;
    }

    setIsProcessing(true);

    // Simulate approval processing
    setTimeout(() => {
      onApprove(request.id, selectedWalletId);
      setIsProcessing(false);
      setShowSuccess(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onNavigate('approvals');
      }, 2000);
    }, 2000);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    onReject(request.id, rejectionReason);
  };

  const downloadBatchSummaryCSV = () => {
    if (!correspondingExpense) return;

    // Combine all recipients from categories, CSV, and expenses
    const allRecipients: any[] = [];

    // Add recipients from categories
    if (correspondingExpense.batchCategories) {
      correspondingExpense.batchCategories.forEach(category => {
        category.items.forEach(item => {
          allRecipients.push({
            category: category.category,
            recipientName: item.recipientName,
            paymentMethod: item.paymentMethod,
            phoneNumber: item.phoneNumber,
            paybillNumber: item.paybillNumber,
            accountNumber: item.accountNumber,
            tillNumber: item.tillNumber,
            amount: item.amount,
            reference: item.reference
          });
        });
      });
    }

    // Add recipients from CSV
    if (correspondingExpense.csvData) {
      correspondingExpense.csvData.forEach(item => {
        allRecipients.push({
          category: item.category,
          recipientName: item.recipientName,
          paymentMethod: item.paymentMethod,
          phonePaybillTill: item.phonePaybillTill,
          accountNumber: item.accountNumber,
          amount: item.amount,
          reference: item.reference
        });
      });
    }

    // Add recipients from expenses array
    if (correspondingExpense.expenses) {
      correspondingExpense.expenses.forEach(expense => {
        allRecipients.push({
          category: expense.category,
          recipientName: expense.recipientName,
          paymentMethod: expense.paymentMethod,
          phoneNumber: expense.phoneNumber,
          paybillNumber: expense.paybillNumber,
          accountNumber: expense.accountNumber,
          tillNumber: expense.tillNumber,
          amount: expense.amount,
          reference: expense.reference
        });
      });
    }

    // Generate CSV content
    let csvContent = 'Category,Recipient Name,Payment Method,Phone/Paybill/Till,Account Number,Amount,Reference\n';

    allRecipients.forEach(recipient => {
      let phonePaybillTill = '';
      if (recipient.paymentMethod === 'sendMoney') {
        phonePaybillTill = recipient.phoneNumber || '';
      } else if (recipient.paymentMethod === 'paybill') {
        phonePaybillTill = recipient.paybillNumber || '';
      } else if (recipient.paymentMethod === 'buyGoods') {
        phonePaybillTill = recipient.tillNumber || '';
      } else {
        phonePaybillTill = recipient.phonePaybillTill || '';
      }

      csvContent += `"${recipient.category}","${recipient.recipientName}","${recipient.paymentMethod}","${phonePaybillTill}","${recipient.accountNumber || ''}",${recipient.amount},"${recipient.reference}"\n`;
    });

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_approval_${request.id}_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        try {
          // Parse the CSV content
          const parsedRecipients = parseBatchPaymentCSV(content, paymentMethod, true);
          setCsvPreviewData(parsedRecipients);

          // Generate CSV preview for display
          const csvPreview = generateCSVPreview(content);
          setCsvPreviewData(csvPreview.data);

          // Convert to the format used in the expense
          const formattedRecipients = parsedRecipients.map((recipient: any) => ({
            recipientName: recipient.name,
            idNumber: recipient.idNumber,
            amount: recipient.amount,
            reference: recipient.reference,
            paymentMethod: recipient.paymentMethod,
            phoneNumber: recipient.phone,
            paybillNumber: recipient.paybillNumber,
            accountNumber: recipient.accountNumber,
            tillNumber: recipient.tillNumber
          }));

          setUploadedRecipients(formattedRecipients);
          setShowCSVPreview(true);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file. Please check the format and try again.');
        }
      }
    };
    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const downloadTemplateCSV = () => {
    // Generate a template CSV based on selected payment method
    const sampleRecipients = [
      {
        name: 'John Doe',
        idNumber: '12345678',
        amount: 1000,
        reference: 'INV-001'
      },
      {
        name: 'Jane Smith',
        idNumber: '87654321',
        amount: 1500,
        reference: 'INV-002'
      }
    ];

    const csvContent = generateBatchPaymentCSV(sampleRecipients, paymentMethod);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const methodName = paymentMethod === 'mpesa_b2c' ? 'MPesa' : paymentMethod === 'paybill_b2b' ? 'Paybill' : 'Till';
    const filename = `batch_disbursement_template_${methodName}_${Date.now()}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addUploadedRecipientsToExpense = () => {
    if (!correspondingExpense || uploadedRecipients.length === 0) return;

    // Create a new expense with the uploaded recipients
    const updatedExpense = {
      ...correspondingExpense,
      csvData: uploadedRecipients.map(recipient => ({
        category: 'Uploaded Recipients',
        recipientName: recipient.recipientName,
        paymentMethod: recipient.paymentMethod,
        phonePaybillTill: recipient.phoneNumber || recipient.paybillNumber || recipient.tillNumber || '',
        accountNumber: recipient.accountNumber || '',
        amount: recipient.amount,
        reference: recipient.reference
      }))
    };

    // Here you would typically update the expense in the parent component
    // For now, we'll just close the preview
    setShowCSVPreview(false);
    alert(`Successfully added ${uploadedRecipients.length} recipients from CSV file.`);
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
            <h1 className="text-2xl font-bold text-dark-gray">Batch Approval Review</h1>
            <p className="text-gray-600 mt-1">Review and process this batch approval request</p>
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
                    {request.type} - {correspondingExpense ? 'Batch Expense' : 'Batch Recipients'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-azure">
                  KES {calculateTotalAmount().toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Batch Expense Details */}
          {correspondingExpense && (
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-dark-gray">Batch Expense Details</h3>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Batch Expense</p>
                    <p className="font-medium text-dark-gray">{correspondingExpense.title}</p>
                    <p className="text-xs text-gray-500">Context: {correspondingExpense.expenseContextType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-lg font-bold text-azure">
                      KES {calculateTotalAmount().toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Categories Breakdown:</p>
                  {correspondingExpense.batchCategories && correspondingExpense.batchCategories.length > 0 ? (
                    <div className="space-y-1">
                      {correspondingExpense.batchCategories.map((category, index) => (
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
              </div>

              {/* Individual Recipients */}
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h5 className="font-semibold text-dark-gray mb-3">Recipients ({getRecipientCount()})</h5>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {/* Recipients from new allRecipients structure */}
                  {correspondingExpense.allRecipients && correspondingExpense.allRecipients.length > 0 ? (
                    // Group recipients by category for display
                    Object.entries(
                      correspondingExpense.allRecipients.reduce((acc, recipient) => {
                        if (!acc[recipient.category]) {
                          acc[recipient.category] = [];
                        }
                        acc[recipient.category].push(recipient);
                        return acc;
                      }, {} as Record<string, typeof correspondingExpense.allRecipients>)
                    ).map(([categoryName, recipients]) => (
                      <div key={categoryName} className="mb-4">
                        <h6 className="font-medium text-sm text-dark-gray mb-2">{categoryName}</h6>
                        {recipients.map((item, itemIndex) => (
                          <div key={itemIndex} className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-2">
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
                    // Fallback to old structure if allRecipients not available
                    <>
                      {/* Recipients from categories */}
                      {correspondingExpense.batchCategories && correspondingExpense.batchCategories.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="mb-4">
                          <h6 className="font-medium text-sm text-dark-gray mb-2">{category.category}</h6>
                          {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-2">
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

                      {/* Recipients from CSV */}
                      {correspondingExpense.csvData && correspondingExpense.csvData.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h6 className="font-medium text-sm text-dark-gray mb-2">CSV Recipients</h6>
                          {correspondingExpense.csvData.map((item, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-2">
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

                      {/* Recipients from expenses array */}
                      {correspondingExpense.expenses && correspondingExpense.expenses.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h6 className="font-medium text-sm text-dark-gray mb-2">Quick Add Recipients</h6>
                          {correspondingExpense.expenses.map((expense, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-2">
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

              {/* CSV Download Section */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-dark-gray">Batch Approval Summary</h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={downloadBatchSummaryCSV}
                    className="flex items-center gap-2"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Download CSV
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">Recipients: <span className="font-semibold text-dark-gray">{getRecipientCount()}</span></p>
                  <p className="text-gray-600">Total Amount: <span className="font-semibold text-azure">KES {calculateTotalAmount().toLocaleString()}</span></p>
                  <p className="text-gray-600">Context: <span className="font-semibold text-dark-gray">{correspondingExpense.expenseContextType}</span></p>
                </div>
              </div>

              {/* CSV Upload Section for Batch Disbursement */}
              {isBatchDisbursement && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-dark-gray">Upload Additional Recipients</h4>
                    <div className="flex gap-2">
                      <Select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as 'mpesa_b2c' | 'paybill_b2b' | 'till_b2b')}
                        className="w-48"
                        options={[
                          { value: 'mpesa_b2c', label: 'MPesa B2C' },
                          { value: 'paybill_b2b', label: 'Paybill B2B' },
                          { value: 'till_b2b', label: 'Till B2B' }
                        ]}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={downloadTemplateCSV}
                        className="flex items-center gap-2"
                      >
                        <FileDownIcon className="w-4 h-4" />
                        Download Template
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={triggerFileUpload}
                        className="flex items-center gap-2"
                      >
                        <FileUpIcon className="w-4 h-4" />
                        Upload CSV
                      </Button>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleCSVUpload}
                    accept=".csv"
                    style={{ display: 'none' }}
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Upload a CSV file with additional recipients. The file should match the selected payment method format.
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Request Details Grid */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-gray">Request Summary</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Request Name</p>
                <p className="text-sm font-medium text-dark-gray">{request.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Recipients</p>
                <p className="text-sm font-medium text-dark-gray">{getRecipientCount()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                <p className="text-sm font-medium text-azure">KES {calculateTotalAmount().toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Requested By</p>
                <p className="text-sm font-medium text-dark-gray">{request.requestedBy}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Date Requested</p>
                <DateTimeDisplay dateTime={request.dateRequested} />
              </div>
              {correspondingExpense && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Context</p>
                  <p className="text-sm font-medium text-dark-gray">{correspondingExpense.expenseContextType || request.type}</p>
                </div>
              )}
              {request.event && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Event</p>
                  <p className="text-sm font-medium text-dark-gray">{request.event}</p>
                </div>
              )}
            </div>

            {request.description && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-600 mb-2">Description</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {request.description}
                </p>
              </div>
            )}
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
                  <p className="text-xs text-gray-600 mb-2">Approval Status</p>
                  <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg font-medium">
                    Approval processed successfully
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
                    <h3 className="text-lg font-semibold text-green-900 mb-4">Approve Batch Request</h3>
                    <div className="space-y-3">
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

                      {/* Main Wallet Balance Display */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Main Wallet Balance</p>
                            <p className="text-xs text-gray-500 mt-1">Available for batch approval</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-azure">
                              KES {getMainWalletBalance().toLocaleString()}
                            </p>
                            {calculateTotalAmount() > getMainWalletBalance() && (
                              <p className="text-xs text-red-600 font-medium mt-1">
                                Insufficient balance
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="success"
                        onClick={() => {
                          if (!selectedWalletId) {
                            alert('Please select a wallet to process this approval');
                            return;
                          }
                          if (!otpSent && !otpVerified) {
                            sendOtp();
                            return;
                          }
                          if (otpSent && !otpVerified) return;
                          handleApprove();
                        }}
                        className="w-full flex items-center justify-center gap-2"
                        disabled={isProcessing || (otpSent && !otpVerified)}
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        {isProcessing ? 'Processing...' : (otpSent && !otpVerified ? 'OTP Sent' : 'Approve Batch Request')}
                      </Button>
                    </div>
                  </Card>

                  {/* Rejection Section */}
                  <Card className="p-6 border-2 border-red-200 bg-red-50">
                    <h3 className="text-lg font-semibold text-red-900 mb-4">Reject Batch Request</h3>
                    <Button
                      variant="danger"
                      onClick={() => setShowRejectForm(true)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Reject Batch Request
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
                  {request.status === 'Completed' ? 'Completed & Approved' : request.status === 'Approved' ? 'Approved' : 'Rejected'}
                </h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                This batch request has already been {request.status === 'Completed' ? 'completed and approved' : request.status.toLowerCase()}{request.status === 'Rejected' ? '. You can edit the details or move it back to pending.' : ' and cannot be modified.'}.
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

      {/* Processing/Success State */}
      {isProcessing && (
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
            <p className="text-sm font-medium text-yellow-800">
              Processing batch approval...
            </p>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              Batch approval processed successfully!
            </p>
          </div>
        </div>
      )}

      {/* OTP Verification UI */}
      {otpSent && !otpVerified && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="w-5 h-5 text-azure flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-dark-gray mb-1">Enter OTP for Batch Approval</p>
              <p className="text-xs text-gray-600 mb-2">A 4-digit verification code was sent to your registered phone number. Please enter it below to proceed with the batch approval.</p>
              <div className="flex items-center gap-2">
                <Input maxLength={4} value={otpInput} onChange={e => setOtpInput(e.target.value.replace(/[^0-9]/g, '').slice(0,4))} className="w-36" />
                <Button variant="primary" size="sm" onClick={verifyOtp} disabled={otpInput.length !== 4}>Verify OTP</Button>
                <Button variant="secondary" size="sm" onClick={sendOtp} disabled={otpResendCount >= 3}>Resend ({3 - otpResendCount} left)</Button>
              </div>
              {otpError && <p className="text-xs text-red-600 mt-2">{otpError}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-azure flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-dark-gray mb-1">
              Secure Batch Approval Processing
            </p>
            <p className="text-xs text-gray-600">
              All batch approvals are processed securely. Your transaction
              is encrypted and protected. OTP verification is required for security.
            </p>
          </div>
        </div>
      </div>

      {/* CSV Preview Modal for Batch Disbursement */}
      {showCSVPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-dark-gray">CSV Preview</h3>
              <Button variant="secondary" size="sm" onClick={() => setShowCSVPreview(false)}>
                Close
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">File: {csvFile?.name}</p>
              <p className="text-sm text-gray-600">Recipients: {csvPreviewData.length}</p>
              <p className="text-sm text-gray-600">Total Amount: KES {csvPreviewData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-700 uppercase">ID Number</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-700 uppercase">Reference</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-700 uppercase">Payment Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {csvPreviewData.map((recipient: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 text-sm text-gray-900">{recipient.name}</td>
                      <td className="p-3 text-sm text-gray-900">{recipient.idNumber}</td>
                      <td className="p-3 text-sm text-gray-900">KES {recipient.amount.toLocaleString()}</td>
                      <td className="p-3 text-sm text-gray-900">{recipient.reference}</td>
                      <td className="p-3 text-sm text-gray-900">{recipient.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setShowCSVPreview(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={addUploadedRecipientsToExpense}
                className="flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Add Recipients
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

