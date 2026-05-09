import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import { DownloadIcon, UploadIcon, CheckCircleIcon, ShieldCheckIcon, UsersIcon, FileTextIcon, EyeIcon, FileUpIcon, FileDownIcon, TableIcon, PlusIcon } from 'lucide-react';
import type { BatchRecipient } from '../../../types';
import type { Expense, Payment, Wallet } from '../types';

interface BatchCategory {
  category: string;
  items: BatchRecipient[];
}
import { downloadBatchPaymentCSV, generateBatchPaymentCSV, parseBatchPaymentCSV, convertExpenseToBatchRecipients, generateCSVPreview } from '../../../utils/batchPaymentUtils';

interface BatchDisbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  wallets?: Wallet[];
  currentUser?: any;
  onSuccess?: (payment: Payment) => void;
}

export function BatchDisbursementModal({
  isOpen,
  onClose,
  expenses,
  wallets = [],
  currentUser,
  onSuccess
}: BatchDisbursementModalProps) {
  // Normalize props to ensure they are arrays
  const walletsArray: Wallet[] = Array.isArray(wallets)
    ? wallets
    : ((wallets as { data?: Wallet[] })?.data || []);
  const expensesArray: Expense[] = Array.isArray(expenses)
    ? expenses
    : ((expenses as { data?: Expense[] })?.data || []);

  const [selectedBatchExpense, setSelectedBatchExpense] = useState<Expense | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpResendCount, setOtpResendCount] = useState(0);
  const [showCSVPreview, setShowCSVPreview] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreviewData, setCsvPreviewData] = useState<any[]>([]);
  const [uploadedRecipients, setUploadedRecipients] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa_b2c' | 'paybill_b2b' | 'till_b2b'>('mpesa_b2c');
  const [showRecipientForm, setShowRecipientForm] = useState(false);
  const [batchCategories, setBatchCategories] = useState<BatchCategory[]>([]);
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentRecipient, setCurrentRecipient] = useState<BatchRecipient>({
    recipientName: '',
    amount: 0,
    paymentMethod: 'sendMoney',
    phoneNumber: '',
    paybillNumber: '',
    accountNumber: '',
    tillNumber: '',
    reference: '',
    idNumber: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter all approved expenses
  const approvedExpenses = expensesArray.filter(expense =>
    expense.status === 'Approved'
  );

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSelectedBatchExpense(null);
      setIsProcessing(false);
      setShowSuccess(false);
      setOtpSent(false);
      setOtpInput('');
      setOtpVerified(false);
      setOtpError('');
      setOtpResendCount(0);
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
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
    if (!selectedBatchExpense) return 0;

    let total = 0;

    // Calculate from batch categories
    if (selectedBatchExpense.batchCategories) {
      selectedBatchExpense.batchCategories.forEach(category => {
        category.items.forEach(item => {
          total += item.amount;
        });
      });
    }

    // Calculate from CSV data
    if (selectedBatchExpense.csvData) {
      selectedBatchExpense.csvData.forEach(item => {
        total += item.amount;
      });
    }

    return total;
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
      handlePayment();
    } else {
      setOtpError('Please enter a valid 4-digit code.');
    }
  };

  const handlePayment = async () => {
    if (!selectedBatchExpense) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const totalAmount = calculateTotalAmount();

      const newPayment: Payment = {
        id: Date.now().toString(),
        eventId: selectedBatchExpense.eventId || '',
        eventName: selectedBatchExpense.eventName || 'Batch Disbursement',
        expenseId: selectedBatchExpense.id,
        initiatedBy: currentUser?.id || 'Current User',
        recipient: `Batch Disbursement (${getRecipientCount()} recipients)`,
        amount: totalAmount,
        mpesaCode: `MPESA-${Date.now()}`,
        type: 'M-Pesa',
        status: 'Completed',
        dateTime: new Date().toISOString(),
        description: `Batch disbursement for ${selectedBatchExpense.title}`
      };

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(newPayment);
      }

      setIsProcessing(false);
      setShowSuccess(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        handleClose();
      }, 2000);
    }, 2000);
  };

  const getRecipientCount = () => {
    if (!selectedBatchExpense) return 0;

    let count = 0;

    // Count from batch categories
    if (selectedBatchExpense.batchCategories) {
      selectedBatchExpense.batchCategories.forEach(category => {
        count += category.items.length;
      });
    }

    // Count from CSV data
    if (selectedBatchExpense.csvData) {
      count += selectedBatchExpense.csvData.length;
    }

    return count;
  };

  const downloadBatchSummaryCSV = () => {
    if (!selectedBatchExpense) return;

    // Combine all recipients from categories and CSV
    const allRecipients: any[] = [];

    // Add recipients from categories
    if (selectedBatchExpense.batchCategories) {
      selectedBatchExpense.batchCategories.forEach(category => {
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

    // Add recipients from CSV data
    if (selectedBatchExpense.csvData) {
      selectedBatchExpense.csvData.forEach(item => {
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
    a.download = `batch_disbursement_${selectedBatchExpense.id}_${Date.now()}.csv`;
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

    const methodName = paymentMethod === 'mpesa_b2c' ? 'MPesa_B2C' : paymentMethod === 'paybill_b2b' ? 'Paybill_B2B' : 'Till_B2B';
    const filename = `batch_payment_template_${methodName}_${Date.now()}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addRecipient = () => {
    if (!currentRecipient.recipientName || currentRecipient.amount <= 0 || !currentRecipient.reference) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate payment method specific fields
    if (currentRecipient.paymentMethod === 'sendMoney' && !currentRecipient.phoneNumber) {
      alert('Phone number is required for Send Money payment method');
      return;
    }

    if (currentRecipient.paymentMethod === 'paybill' && (!currentRecipient.paybillNumber || !currentRecipient.accountNumber)) {
      alert('Paybill number and account number are required for Paybill payment method');
      return;
    }

    if (currentRecipient.paymentMethod === 'buyGoods' && !currentRecipient.tillNumber) {
      alert('Till number is required for Buy Goods & Services payment method');
      return;
    }

    // Use the recipient's category or default to a general category
    const recipientCategory = currentCategory || (selectedBatchExpense?.title || 'General Recipients');

    // Add recipient to category
    const updatedCategories = [...batchCategories];
    const categoryIndex = updatedCategories.findIndex(cat => cat.category === recipientCategory);

    if (categoryIndex >= 0) {
      // Category exists, add to it
      updatedCategories[categoryIndex].items.push({
        recipientName: currentRecipient.recipientName,
        amount: currentRecipient.amount,
        paymentMethod: currentRecipient.paymentMethod,
        phoneNumber: currentRecipient.phoneNumber,
        paybillNumber: currentRecipient.paybillNumber,
        accountNumber: currentRecipient.accountNumber,
        tillNumber: currentRecipient.tillNumber,
        reference: currentRecipient.reference,
        idNumber: currentRecipient.idNumber
      });
    } else {
      // Category doesn't exist, create new one
      updatedCategories.push({
        category: recipientCategory,
        items: [{
          recipientName: currentRecipient.recipientName,
          amount: currentRecipient.amount,
          paymentMethod: currentRecipient.paymentMethod,
          phoneNumber: currentRecipient.phoneNumber,
          paybillNumber: currentRecipient.paybillNumber,
          accountNumber: currentRecipient.accountNumber,
          tillNumber: currentRecipient.tillNumber,
          reference: currentRecipient.reference,
          idNumber: currentRecipient.idNumber
        }]
      });
    }

    setBatchCategories(updatedCategories);

    // Reset current recipient form
                        setCurrentRecipient({
                          recipientName: '',
                          amount: 0,
                          paymentMethod: 'sendMoney',
                          phoneNumber: '',
                          paybillNumber: '',
                          accountNumber: '',
                          tillNumber: '',
                          reference: '',
                          idNumber: ''
                        });
  };

  const removeRecipient = (categoryIndex: number, itemIndex: number) => {
    const updatedCategories = [...batchCategories];
    updatedCategories[categoryIndex].items.splice(itemIndex, 1);

    // Remove category if empty
    if (updatedCategories[categoryIndex].items.length === 0) {
      updatedCategories.splice(categoryIndex, 1);
    }

    setBatchCategories(updatedCategories);
  };

  const addUploadedRecipientsToExpense = () => {
    if (!selectedBatchExpense || uploadedRecipients.length === 0) return;

    // Create a new expense with the uploaded recipients
    const updatedExpense = {
      ...selectedBatchExpense,
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

    setSelectedBatchExpense(updatedExpense);
    setShowCSVPreview(false);
    setUploadedRecipients([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Batch Disbursement"
      size="lg"
    >
      <div className="space-y-6">
        {/* Step 1: Select Approved Batch Expense */}
        <div className="space-y-4">
          <h4 className="font-semibold text-dark-gray">Step 1: Select Approved Batch Expense</h4>
          <p className="text-sm text-gray-600">Choose an approved batch expense to disburse</p>

          <Select
            label="Select Approved Expense"
            value={selectedBatchExpense?.id || ''}
            onChange={(e) => {
              const expenseId = e.target.value;
              const expense = expenses.find(exp => exp.id === expenseId);
              setSelectedBatchExpense(expense || null);
            }}
            options={[
              { value: '', label: 'Choose approved expense...' },
              ...approvedExpenses.map((expense: Expense) => ({
                value: expense.id,
                label: `${expense.title} - KES ${expense.totalAmount?.toLocaleString() || '0'} (${expense.expenseContextType})`
              }))
            ]}
            required
          />
        </div>

        {/* Step 2: Batch Disbursement Details */}
        {selectedBatchExpense && (
          <div className="space-y-4">
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-dark-gray">Batch Disbursement Details</h4>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setShowRecipientForm(!showRecipientForm)}
                  className="flex items-center gap-2"
                >
                  <UsersIcon className="w-4 h-4" />
                  {showRecipientForm ? 'Hide Form' : 'Add Recipients'}
                </Button>
              </div>

              <p className="text-sm text-gray-600">You can manually add recipients using the button below, or download a template to fill in recipient details based on your payment method. Once completed, upload your batch file to preview and process the payments.</p>

              {/* Download Templates */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={downloadTemplateCSV}
                  className="flex items-center gap-2"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Download Send Money Template
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={downloadTemplateCSV}
                  className="flex items-center gap-2"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Download Paybill Template
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={downloadTemplateCSV}
                  className="flex items-center gap-2"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Download Buy Goods Template
                </Button>
              </div>

              {/* Add Recipient Form */}
              {showRecipientForm && (
                <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Recipient Name"
                      value={currentRecipient.recipientName}
                      onChange={e => setCurrentRecipient({ ...currentRecipient, recipientName: e.target.value })}
                      required
                    />

                    <Input
                      label="Amount (KES)"
                      type="number"
                      value={currentRecipient.amount || ''}
                      onChange={e => setCurrentRecipient({ ...currentRecipient, amount: Number(e.target.value) })}
                      required
                    />

                    <Select
                      label="Payment Method"
                      options={[
                        { value: 'sendMoney', label: 'Send Money' },
                        { value: 'paybill', label: 'Paybill' },
                        { value: 'buyGoods', label: 'Buy Goods & Services' }
                      ]}
                      value={currentRecipient.paymentMethod}
                      onChange={e => setCurrentRecipient({ ...currentRecipient, paymentMethod: e.target.value as any })}
                      required
                    />

                    {currentRecipient.paymentMethod === 'sendMoney' && (
                      <PhoneInput
                        label="Phone Number"
                        placeholder="7XXXXXXXX"
                        value={currentRecipient.phoneNumber || ''}
                        onChange={(value) => setCurrentRecipient({ ...currentRecipient, phoneNumber: value })}
                        required
                      />
                    )}

                    {currentRecipient.paymentMethod === 'paybill' && (
                      <>
                        <Input
                          label="Paybill Number"
                          value={currentRecipient.paybillNumber}
                          onChange={e => setCurrentRecipient({ ...currentRecipient, paybillNumber: e.target.value })}
                          required
                        />
                        <Input
                          label="Account Number"
                          value={currentRecipient.accountNumber}
                          onChange={e => setCurrentRecipient({ ...currentRecipient, accountNumber: e.target.value })}
                          required
                        />
                      </>
                    )}

                    {currentRecipient.paymentMethod === 'buyGoods' && (
                      <Input
                        label="Till Number"
                        value={currentRecipient.tillNumber}
                        onChange={e => setCurrentRecipient({ ...currentRecipient, tillNumber: e.target.value })}
                        required
                      />
                    )}

                    <Input
                      label="Reference"
                      value={currentRecipient.reference}
                      onChange={e => setCurrentRecipient({ ...currentRecipient, reference: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowRecipientForm(false);
                        setCurrentRecipient({
                          recipientName: '',
                          amount: 0,
                          paymentMethod: 'sendMoney',
                          phoneNumber: '',
                          paybillNumber: '',
                          accountNumber: '',
                          tillNumber: '',
                          reference: '',
                          idNumber: ''
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={addRecipient}
                    >
                      Add Recipient
                    </Button>
                  </div>
                </div>
              )}

              {/* Upload Batch File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Batch File
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-azure hover:bg-blue-50 transition-colors">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleCSVUpload}
                      accept=".csv"
                      className="hidden"
                    />
                    <UploadIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {csvFile ? csvFile.name : 'Choose CSV file'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Recipients List */}
              {(batchCategories.length > 0 || uploadedRecipients.length > 0) && (
                <div className="mt-4">
                  <h5 className="font-medium text-dark-gray mb-3">Recipients Preview</h5>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {/* Recipients from categories */}
                    {batchCategories.map((category, categoryIndex) => (
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
                            <div className="flex gap-1 mt-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => {
                                  const categoryName = category.category;
                                  // Find and edit recipient
                                  setCurrentRecipient(item);
                                  setCurrentCategory(categoryName);
                                  setShowRecipientForm(true);
                                  // Remove from list temporarily
                                  removeRecipient(categoryIndex, itemIndex);
                                }}
                                className="text-blue-500 hover:text-blue-700"
                                title="Edit"
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => removeRecipient(categoryIndex, itemIndex)}
                                className="text-red-500 hover:text-red-700"
                                title="Remove"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}

                    {/* Recipients from uploaded CSV */}
                    {uploadedRecipients.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h6 className="font-medium text-sm text-dark-gray mb-2">Uploaded Recipients</h6>
                        {uploadedRecipients.map((recipient, index) => (
                          <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 mb-2">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-medium text-sm text-dark-gray">{recipient.recipientName}</p>
                                <p className="text-xs text-gray-500">
                                  {recipient.paymentMethod} | {recipient.reference}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-azure">KES {recipient.amount.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 space-y-0.5">
                              {recipient.phoneNumber && <p>Phone: {recipient.phoneNumber}</p>}
                              {recipient.paybillNumber && <p>Paybill: {recipient.paybillNumber}</p>}
                              {recipient.accountNumber && <p>Account: {recipient.accountNumber}</p>}
                              {recipient.tillNumber && <p>Till: {recipient.tillNumber}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between font-semibold">
                      <span>Recipients Total:</span>
                      <span>KES {(batchCategories.reduce((sum, cat) => sum + cat.items.reduce((catSum, item) => catSum + item.amount, 0), 0) + uploadedRecipients.reduce((sum, item) => sum + item.amount, 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CSV Preview */}
              {csvPreviewData.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-dark-gray mb-2">CSV Preview ({csvPreviewData.length} items)</h5>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left">Name</th>
                          <th className="p-2 text-left">ID Number</th>
                          <th className="p-2 text-left">Amount</th>
                          <th className="p-2 text-left">Reference</th>
                          <th className="p-2 text-left">Payment Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreviewData.map((recipient: any, index: number) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="p-2">{recipient.name}</td>
                            <td className="p-2">{recipient.idNumber}</td>
                            <td className="p-2">KES {recipient.amount.toLocaleString()}</td>
                            <td className="p-2">{recipient.reference}</td>
                            <td className="p-2">{recipient.paymentMethod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between font-semibold">
                      <span>CSV Total:</span>
                      <span>KES {csvPreviewData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {batchCategories.length === 0 && uploadedRecipients.length === 0 && csvPreviewData.length === 0 && (
                <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-500">No recipients added yet</p>
                  <p className="text-xs text-gray-400 mt-1">Add recipients manually or upload a CSV file to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CSV Preview Modal */}
        {showCSVPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-dark-gray">CSV Preview</h3>
                <Button variant="secondary" size="sm" onClick={() => setShowCSVPreview(false)}>
                  Close
                </Button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">File: {csvFile?.name}</p>
                <p className="text-sm text-gray-600">Recipients: {csvPreviewData.length}</p>
                <p className="text-sm text-gray-600">Total Amount: KES {csvPreviewData.reduce((sum: number, item: any) => sum + item.amount, 0).toLocaleString()}</p>
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

        {/* Main Wallet Balance Display */}
        {selectedBatchExpense && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Main Wallet Balance</p>
                <p className="text-xs text-gray-500 mt-1">Available for batch disbursement</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-azure">
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
        )}

        {/* Processing/Success State */}
        {isProcessing && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
              <p className="text-sm font-medium text-yellow-800">
                Processing batch disbursement...
              </p>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                Batch disbursement processed successfully!
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
                <p className="text-sm font-medium text-dark-gray mb-1">Enter OTP for Batch Disbursement</p>
                <p className="text-xs text-gray-600 mb-2">A 4-digit verification code was sent to your registered phone number. Please enter it below to proceed with the batch disbursement.</p>
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
                Secure Batch Disbursement Processing
              </p>
              <p className="text-xs text-gray-600">
                All batch disbursements are processed securely via M-Pesa API. Your transaction
                is encrypted and protected. OTP verification is required for security.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!selectedBatchExpense) {
                alert('Please select a batch expense');
                return;
              }

              // Check if OTP is required and not yet verified
              if (!otpSent && !otpVerified) {
                sendOtp();
                return;
              }

              // If OTP was already sent and not verified, do nothing
              if (otpSent && !otpVerified) return;

              // Otherwise proceed to payment (for already verified OTP)
              handlePayment();
            }}
            disabled={
              isProcessing ||
              !selectedBatchExpense ||
              calculateTotalAmount() > getMainWalletBalance() ||
              (otpSent && !otpVerified)
            }
            className="transition-all duration-200 hover:scale-105"
          >
            <UsersIcon className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing...' : (otpSent && !otpVerified ? 'OTP Sent' : 'Make Batch Disbursement')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

