import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import {
  CreditCardIcon,
  UploadIcon,
  DownloadIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  UsersIcon,
  ArrowLeftIcon
} from 'lucide-react';
import { Expense, Request, Supplier, Wallet, Payment } from '../../../types';
import { parseBatchPaymentCSV, downloadBatchPaymentCSV } from '../../../utils/batchPaymentUtils';

interface MakePaymentPageProps {
  expenses: Expense[];
  requests: Request[];
  approvals: Request[];
  wallets?: Wallet[];
  supplier?: Supplier;
  selectedApproval?: Request;
  selectedExpense?: Expense;
  onSuccess?: (payment: Payment) => void;
  onNavigate?: (page: string, id?: string) => void;
}

type PaymentMethod = 'mpesa_b2c' | 'paybill_b2b' | 'till_b2b';
type PaymentSource = 'expense' | 'request' | 'approval';

interface BulkRecipient {
  name: string;
  idNumber: string;
  phone?: string;
  paybillNumber?: string;
  accountNumber?: string;
  tillNumber?: string;
  amount: number;
  reference: string;
  paymentMethod?: PaymentMethod;
}

export function MakePaymentPage({
  expenses,
  requests,
  approvals,
  wallets = [],
  supplier,
  selectedApproval,
  selectedExpense,
  onSuccess,
  onNavigate
}: MakePaymentPageProps) {
  // Normalize wallets data - handle both array and API response object
  const walletsArray = Array.isArray(wallets) ? wallets : (wallets as any)?.data || [];

  const [paymentSource, setPaymentSource] = useState<PaymentSource>('expense');
  const [selectedItem, setSelectedItem] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa_b2c');
  const [isBatchPayment, setIsBatchPayment] = useState(false);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchRecipients, setBatchRecipients] = useState<BulkRecipient[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRecipientForm, setShowRecipientForm] = useState(false);
  const [batchCategories, setBatchCategories] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentRecipient, setCurrentRecipient] = useState({
    recipientName: '',
    amount: 0,
    description: '' as string,
    paymentMethod: 'sendMoney' as 'sendMoney' | 'paybill' | 'buyGoods',
    phoneNumber: '',
    paybillNumber: '',
    accountNumber: '',
    businessName: '',
    tillNumber: '',
    merchantName: '',
    reference: '',
    idNumber: ''
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [uploadedRecipients, setUploadedRecipients] = useState<any[]>([]);

  // OTP states for external payment verification
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpResendCount, setOtpResendCount] = useState(0);

  // M-Pesa fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paybillNumber, setPaybillNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [tillNumber, setTillNumber] = useState('');

  // Pre-fill fields if supplier is provided
  useEffect(() => {
    if (supplier) {
      // Calculate total amount from services
      const totalAmount = Array.isArray(supplier.servicesProvided)
        ? supplier.servicesProvided.reduce((sum, service) => sum + (service.amount || 0), 0)
        : (supplier.amount || 0);
      setAmount(totalAmount.toString());

      // Set payment method and pre-fill fields based on supplier data
      if (supplier.paymentMethod === 'Mpesa B2C') {
        setPaymentMethod('mpesa_b2c');
        setPhoneNumber(supplier.mpesaPhone || '');
      } else if (supplier.paymentMethod === 'Paybill B2B') {
        setPaymentMethod('paybill_b2b');
        setPaybillNumber(supplier.paybillNumber || '');
        setAccountNumber(supplier.paybillAccount || '');
      } else if (supplier.paymentMethod === 'Till B2B') {
        setPaymentMethod('till_b2b');
        setTillNumber(supplier.tillNumber || '');
      }
    }
  }, [supplier]);

  // Pre-select approval if provided
  useEffect(() => {
    if (selectedApproval) {
      setPaymentSource('approval');
      setSelectedItem(selectedApproval.id);
      setAmount(selectedApproval.amount.toString());

      // If the approval has bulk payment details, auto-enable bulk payment and load recipients
      if (selectedApproval.batchPaymentDetails) {
        setIsBatchPayment(true);
        const recipients = selectedApproval.batchPaymentDetails.map(recipient => ({
          name: recipient.name,
          idNumber: recipient.idNumber,
          phone: recipient.phone,
          paybillNumber: recipient.paybillNumber,
          accountNumber: recipient.accountNumber,
          tillNumber: recipient.tillNumber,
          amount: recipient.amount,
          reference: recipient.reference
        }));
        setBatchRecipients(recipients);
      }
    }
  }, [selectedApproval]);

  // Pre-select expense if provided
  useEffect(() => {
    if (selectedExpense) {
      setPaymentSource('expense');
      setSelectedItem(selectedExpense.id);
      setAmount(selectedExpense.amount.toString());

      // If the expense has bulk payment details, auto-enable bulk payment and load recipients
      if (selectedExpense.batchPaymentDetails) {
        setIsBatchPayment(true);
        const recipients = selectedExpense.batchPaymentDetails.map(recipient => ({
          name: recipient.name,
          idNumber: recipient.idNumber,
          phone: recipient.phone,
          paybillNumber: recipient.paybillNumber,
          accountNumber: recipient.accountNumber,
          tillNumber: recipient.tillNumber,
          amount: recipient.amount,
          reference: recipient.reference
        }));
        setBatchRecipients(recipients);
      }
    }
  }, [selectedExpense]);

  // Helper function to map payment method strings to PaymentMethod type
  const mapPaymentMethod = (method: string): PaymentMethod | undefined => {
    switch (method) {
      case 'mpesa':
        return 'mpesa_b2c';
      case 'paybill':
        return 'paybill_b2b';
      case 'till':
        return 'till_b2b';
      default:
        return undefined;
    }
  };

  // Get available items based on payment source
  const getSourceItems = () => {
    switch (paymentSource) {
      case 'expense':
        // Show all approved expenses for both single and batch disbursements
        return expenses
          .filter(e => e.status === 'Approved')
          .map(e => ({
            value: e.id,
            label: `${e.title} - KES ${e.amount.toLocaleString()} (${e.eventName})`
          }));
      case 'request':
        // Show all pending requests for both single and batch disbursements
        return requests
          .filter(r => r.status === 'Pending')
          .map(r => ({
            value: r.id,
            label: `${r.name} - KES ${r.amount.toLocaleString()} (${r.category})`
          }));
      case 'approval':
        // Show all approved approvals for both single and batch disbursements
        return approvals
          .filter(a => a.status === 'Approved')
          .map(a => ({
            value: a.id,
            label: `${a.name} - KES ${a.amount.toLocaleString()} (${a.category})`
          }));
      default:
        return [];
    }
  };

  // Get selected item details
  const getSelectedItemDetails = () => {
    if (!selectedItem) return null;

    let item;
    switch (paymentSource) {
      case 'expense':
        item = expenses.find(e => e.id === selectedItem);
        return item ? { amount: item.amount, name: item.title } : null;
      case 'request':
        item = requests.find(r => r.id === selectedItem);
        return item ? { amount: item.amount, name: item.name } : null;
      case 'approval':
        item = approvals.find(a => a.id === selectedItem);
        return item ? { amount: item.amount, name: item.name } : null;
      default:
        return null;
    }
  };

  // When a selectedItem changes (from the dropdown), if it's an approved expense/request/approval
  // with stored batchPaymentDetails, load those recipients into the batchRecipients preview.
  useEffect(() => {
    if (!selectedItem) return;

    const loadFromSource = () => {
      const recipients: BulkRecipient[] = [];

      if (paymentSource === 'expense') {
        const exp = expenses.find(e => e.id === selectedItem);
        if (exp) {
          // Process batch categories
          if (exp.batchCategories) {
            exp.batchCategories.forEach(category => {
              category.items.forEach(item => {
                recipients.push({
                  name: item.recipientName,
                  idNumber: item.idNumber || '',
                  phone: item.paymentMethod === 'sendMoney' ? item.phoneNumber : undefined,
                  paybillNumber: item.paymentMethod === 'paybill' ? item.paybillNumber : undefined,
                  accountNumber: item.paymentMethod === 'paybill' ? item.accountNumber : undefined,
                  tillNumber: item.paymentMethod === 'buyGoods' ? item.tillNumber : undefined,
                  amount: Number(item.amount) || 0,
                  reference: item.reference || '',
                  paymentMethod: mapPaymentMethod(item.paymentMethod)
                });
              });
            });
          }

          // Process CSV data
          if (exp.csvData) {
            exp.csvData.forEach(item => {
              recipients.push({
                name: item.recipientName,
                idNumber: '',
                phone: item.paymentMethod === 'sendMoney' ? item.phonePaybillTill : undefined,
                paybillNumber: item.paymentMethod === 'paybill' ? item.phonePaybillTill : undefined,
                accountNumber: item.accountNumber || '',
                tillNumber: item.paymentMethod === 'buyGoods' ? item.phonePaybillTill : undefined,
                amount: Number(item.amount) || 0,
                reference: item.reference || '',
                paymentMethod: mapPaymentMethod(item.paymentMethod)
              });
            });
          }

          // Process legacy batch payment details
          if (exp.batchPaymentDetails && exp.batchPaymentDetails.length > 0) {
            exp.batchPaymentDetails.forEach((r: any) => {
              recipients.push({
                name: r.name,
                idNumber: r.idNumber,
                phone: r.phone,
                paybillNumber: r.paybillNumber,
                accountNumber: r.accountNumber,
                tillNumber: r.tillNumber,
                amount: Number(r.amount) || 0,
                reference: r.reference || '',
                paymentMethod: r.paymentMethod ? mapPaymentMethod(r.paymentMethod) : undefined
              });
            });
          }
        }
      } else if (paymentSource === 'request') {
        const req = requests.find(r => r.id === selectedItem);
        if (req && req.batchPaymentDetails && req.batchPaymentDetails.length > 0) {
          req.batchPaymentDetails.forEach((r: any) => {
            recipients.push({
              name: r.name,
              idNumber: r.idNumber,
              phone: r.phone,
              paybillNumber: r.paybillNumber,
              accountNumber: r.accountNumber,
              tillNumber: r.tillNumber,
              amount: Number(r.amount) || 0,
              reference: r.reference || '',
              paymentMethod: r.paymentMethod ? mapPaymentMethod(r.paymentMethod) : undefined
            });
          });
        }
      } else if (paymentSource === 'approval') {
        const app = approvals.find(a => a.id === selectedItem);
        if (app && app.batchPaymentDetails && app.batchPaymentDetails.length > 0) {
          app.batchPaymentDetails.forEach((r: any) => {
            recipients.push({
              name: r.name,
              idNumber: r.idNumber,
              phone: r.phone,
              paybillNumber: r.paybillNumber,
              accountNumber: r.accountNumber,
              tillNumber: r.tillNumber,
              amount: Number(r.amount) || 0,
              reference: r.reference || '',
              paymentMethod: r.paymentMethod ? mapPaymentMethod(r.paymentMethod) : undefined
            });
          });
        }
      }

      if (recipients.length > 0) {
        setIsBatchPayment(true);
        setBatchRecipients(recipients);
      } else {
        setBatchRecipients([]);
      }
    };

    loadFromSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, paymentSource]);

  // Handle batch file upload
  const handleBatchFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBatchFile(file);

      // Parse CSV file using utility function
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const recipients = parseBatchPaymentCSV(text, paymentMethod);
        setBatchRecipients(recipients);
      };
      reader.readAsText(file);
    }
  };

  // Handle payment submission
  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // Create payment object
      const itemDetails = getSelectedItemDetails();
      const paymentAmount = isBatchPayment ? totalBatchAmount : parseFloat(amount);

      // Map source to payment metadata
      let paymentEventId = '';
      let paymentEventName = 'External Payment';
      let paymentExpenseId: string | undefined = undefined;

      if (paymentSource === 'expense') {
        const exp = expenses.find(e => e.id === selectedItem);
        if (exp) {
          paymentEventId = exp.eventId || '';
          paymentEventName = exp.eventName || 'Expense Payment';
          paymentExpenseId = exp.id;
        }
      } else if (paymentSource === 'approval') {
        const approval = approvals.find(a => a.id === selectedItem);
        if (approval?.expenseId) {
          paymentExpenseId = approval.expenseId;
        }
      } else if (paymentSource === 'request') {
        const req = requests.find(r => r.id === selectedItem);
        if (req?.expenseId) {
          paymentExpenseId = req.expenseId;
        }
      }

      const newPayment: Payment = {
        id: Date.now().toString(),
        eventId: paymentEventId,
        eventName: paymentEventName,
        expenseId: paymentExpenseId,
        initiatedBy: 'Current User',
        recipient: isBatchPayment
          ? `Batch Disbursement (${batchRecipients.length} recipients)`
          : (supplier?.name || itemDetails?.name || 'External Payment'),
        amount: paymentAmount,
        mpesaCode: paymentMethod === 'mpesa_b2c' ? `MPESA-${Date.now()}` : undefined,
        type: paymentMethod === 'mpesa_b2c' ? 'M-Pesa' : 'Wallet Transfer',
        status: 'Completed',
        dateTime: new Date().toISOString(),
        description: `Payment via ${paymentMethod === 'mpesa_b2c' ? 'M-Pesa B2C' :
                     paymentMethod === 'paybill_b2b' ? 'Paybill B2B' : 'Till B2B'}`
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
        if (onNavigate) {
          onNavigate('payments');
        }
      }, 2000);
    }, 2000);
  };

  // Send OTP to recipient phone (simulated)
  const sendOtp = () => {
    // For bulk payments, we don't need a specific phone number - send to admin/user phone
    if (!isBatchPayment && paymentMethod === 'mpesa_b2c' && !phoneNumber) {
      setOtpError('Recipient phone number is required to send OTP.');
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    // otpCode removed; we only track whether OTP was sent and the input
    setOtpSent(true);
    setOtpVerified(false);
    setOtpError('');
    setOtpInput('');
    setOtpResendCount(prev => prev + 1);

    // Simulate sending SMS by logging to console (in real app integrate SMS provider)
    const targetPhone = isBatchPayment ? 'Admin Phone (Batch Disbursement)' : phoneNumber;
    // eslint-disable-next-line no-console
    console.log(`Simulated OTP sent to ${targetPhone}: ${code}`);
  };

  const verifyOtp = () => {
    // During development, allow any 4-digit code
    if (otpInput.trim().length === 4) {
      setOtpVerified(true);
      setOtpError('');
      // proceed with payment now that OTP verified
      handlePayment();
    } else {
      setOtpError('Please enter a valid 4-digit code.');
    }
  };

  const handleClose = () => {
    if (onNavigate) {
      onNavigate('payments');
    }
  };

  // Helper functions
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

    // Use the utility function to download the CSV directly
    downloadBatchPaymentCSV(sampleRecipients, paymentMethod, 'template');
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
    const recipientCategory = currentCategory || (selectedItem ? getSelectedItemDetails()?.name || 'General Recipients' : 'General Recipients');

    // Add recipient to category
    const updatedCategories = [...batchCategories];
    const categoryIndex = updatedCategories.findIndex(cat => cat.category === recipientCategory);

    if (categoryIndex >= 0) {
      // Category exists, add to it
      updatedCategories[categoryIndex].items.push({
        recipientName: currentRecipient.recipientName,
        amount: currentRecipient.amount,
        description: currentRecipient.description,
        paymentMethod: currentRecipient.paymentMethod,
        phoneNumber: currentRecipient.phoneNumber,
        paybillNumber: currentRecipient.paybillNumber,
        accountNumber: currentRecipient.accountNumber,
        businessName: currentRecipient.businessName,
        tillNumber: currentRecipient.tillNumber,
        merchantName: currentRecipient.merchantName,
        reference: currentRecipient.reference,
        idNumber: currentRecipient.idNumber || ''
      });
    } else {
      // Category doesn't exist, create new one
      updatedCategories.push({
        category: recipientCategory,
        items: [{
          recipientName: currentRecipient.recipientName,
          amount: currentRecipient.amount,
          description: currentRecipient.description,
          paymentMethod: currentRecipient.paymentMethod,
          phoneNumber: currentRecipient.phoneNumber,
          paybillNumber: currentRecipient.paybillNumber,
          accountNumber: currentRecipient.accountNumber,
          businessName: currentRecipient.businessName,
          tillNumber: currentRecipient.tillNumber,
          merchantName: currentRecipient.merchantName,
          reference: currentRecipient.reference,
          idNumber: currentRecipient.idNumber || ''
        }]
      });
    }

    setBatchCategories(updatedCategories);

    // Reset current recipient form
    setCurrentRecipient({
      recipientName: '',
      amount: 0,
      description: '',
      paymentMethod: 'sendMoney',
      phoneNumber: '',
      paybillNumber: '',
      accountNumber: '',
      businessName: '',
      tillNumber: '',
      merchantName: '',
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

  const removeCategory = (categoryIndex: number) => {
    const updatedCategories = [...batchCategories];
    updatedCategories.splice(categoryIndex, 1);
    setBatchCategories(updatedCategories);
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
          setUploadedRecipients(parsedRecipients);

          // Generate CSV preview for display
          const csvPreview = generateCSVPreview(content);
          setCsvPreview(csvPreview.data);

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
        } catch (error) {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file. Please check the format and try again.');
        }
      }
    };
    reader.readAsText(file);
  };

  const removeCsvItem = (index: number) => {
    const updatedPreview = [...csvPreview];
    updatedPreview.splice(index, 1);
    setCsvPreview(updatedPreview);
  };

  // Helper function for CSV preview generation
  const generateCSVPreview = (content: string) => {
    const lines = content.split('\n').slice(1).filter(line => line.trim());
    const data = lines.map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      return {
        category: values[0] || '',
        recipientName: values[1] || '',
        paymentMethod: values[2] || '',
        phonePaybillTill: values[3] || '',
        accountNumber: values[4] || '',
        amount: parseFloat(values[5]) || 0,
        reference: values[6] || ''
      };
    });
    return { data };
  };

  const itemDetails = getSelectedItemDetails();
  const totalBatchAmount = batchRecipients.reduce((sum, r) => sum + r.amount, 0);

  // Get Main Wallet balance
  const mainWallet = walletsArray.find(w => w.type === 'Main Wallet');
  const mainWalletBalance = mainWallet?.balance || 0;

  // If paying a supplier, disable batch payment
  const showBatchOption = !supplier;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={handleClose} className="flex items-center gap-2 text-azure hover:text-azure-dark transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Payments</span>
        </button>
      </div>

      <h1 className="text-2xl font-bold text-dark-gray">
        {supplier ? `Pay Supplier: ${supplier.name}` : "Make Payment Outside Platform"}
      </h1>

      <div className="space-y-6">
        {/* Bulk Payment Toggle - Only show if not paying a supplier */}
        {showBatchOption && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="bulkPayment"
              checked={isBatchPayment}
              onChange={(e) => setIsBatchPayment(e.target.checked)}
              className="w-4 h-4 text-azure border-gray-300 rounded focus:ring-azure"
            />
            <label htmlFor="bulkPayment" className="flex items-center gap-2 text-sm font-medium text-dark-gray cursor-pointer">
              <UsersIcon className="w-5 h-5 text-azure" />
              Batch Disbursement (Multiple Recipients)
            </label>
          </div>
        )}

        {isBatchPayment ? (
          // Batch Payment Section
          <div className="space-y-4">
            {/* Expense Selection for Batch Payment */}
            <div>
              <Select
                label="Select Approved Expense"
                value={selectedItem}
                onChange={(e) => {
                  setSelectedItem(e.target.value);
                }}
                options={[
                  { value: '', label: 'Choose expense to disburse...' },
                  ...getSourceItems()
                ]}
              />
            </div>

            {/* Show expense details */}
            {itemDetails && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Approved Expense</p>
                    <p className="font-medium text-dark-gray">{itemDetails.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-lg font-bold text-azure">
                      KES {itemDetails.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedItem && (
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
                            description: '',
                            paymentMethod: 'sendMoney',
                            phoneNumber: '',
                            paybillNumber: '',
                            accountNumber: '',
                            businessName: '',
                            tillNumber: '',
                            merchantName: '',
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
                        accept=".csv"
                        onChange={handleCSVUpload}
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
                {batchCategories.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-dark-gray mb-3">Recipients Preview</h5>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {batchCategories.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="mb-4">
                          <h6 className="font-medium text-sm text-dark-gray mb-2">{category.category}</h6>
                          {category.items.map((item: any, itemIndex: number) => (
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
                                  ??
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => removeRecipient(categoryIndex, itemIndex)}
                                  className="text-red-500 hover:text-red-700"
                                  title="Remove"
                                >
                                  ???
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between font-semibold">
                        <span>Recipients Total:</span>
                        <span>KES {batchCategories.reduce((sum: number, cat: any) => sum + cat.items.reduce((catSum: number, item: any) => catSum + item.amount, 0), 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* CSV Preview */}
                {csvPreview.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-dark-gray mb-2">CSV Preview ({csvPreview.length} items)</h5>
                    <div className="max-h-48 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-2 text-left">Category</th>
                            <th className="p-2 text-left">Recipient</th>
                            <th className="p-2 text-left">Method</th>
                            <th className="p-2 text-right">Amount</th>
                            <th className="p-2 text-left">Reference</th>
                            <th className="p-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreview.map((item, index) => (
                            <tr key={index} className="border-t border-gray-200">
                              <td className="p-2">{item.category}</td>
                              <td className="p-2">{item.recipientName}</td>
                              <td className="p-2">{item.paymentMethod}</td>
                              <td className="p-2 text-right">KES {item.amount.toLocaleString()}</td>
                              <td className="p-2">{item.reference}</td>
                              <td className="p-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => removeCsvItem(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between font-semibold">
                        <span>CSV Total:</span>
                        <span>KES {csvPreview.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {batchCategories.length === 0 && csvPreview.length === 0 && (
                  <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                    <p className="text-sm text-gray-500">No recipients added yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add recipients manually or upload a CSV file to get started</p>
                  </div>
                )}
              </div>
            )}

            {/* Main Wallet Balance Display - For Batch Payment */}
            {batchRecipients.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Main Wallet Balance</p>
                    <p className="text-xs text-gray-500 mt-1">Available for external payments</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-azure">
                      KES {(walletsArray.find(w => w.type === 'Main Wallet')?.balance || 0).toLocaleString()}
                    </p>
                    {totalBatchAmount > (walletsArray.find(w => w.type === 'Main Wallet')?.balance || 0) && (
                      <p className="text-xs text-red-600 font-medium mt-1">
                        Insufficient balance
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Show Recipients */}
            {batchRecipients.length > 0 && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-semibold text-dark-gray mb-3">
                  Recipients ({batchRecipients.length})
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {batchRecipients.map((recipient, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-dark-gray">
                            {recipient.name}
                          </p>
                          <p className="text-xs text-gray-500">ID: {recipient.idNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-azure">
                            KES {recipient.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 space-y-0.5">
                        {paymentMethod === 'mpesa_b2c' && recipient.phone && (
                          <p>M-Pesa: {recipient.phone}</p>
                        )}
                        {paymentMethod === 'paybill_b2b' && (
                          <>
                            {recipient.paybillNumber && <p>Paybill: {recipient.paybillNumber}</p>}
                            {recipient.accountNumber && <p>Account: {recipient.accountNumber}</p>}
                          </>
                        )}
                        {paymentMethod === 'till_b2b' && recipient.tillNumber && (
                          <p>Till: {recipient.tillNumber}</p>
                        )}
                        {recipient.reference && <p className="text-gray-500 italic">Ref: {recipient.reference}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-dark-gray">Total Amount:</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-azure">
                        KES {totalBatchAmount.toLocaleString()}
                      </span>
                      {itemDetails && totalBatchAmount > itemDetails.amount && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <span>??</span>
                          <span>Exceeds approved amount by KES {(totalBatchAmount - itemDetails.amount).toLocaleString()}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Batch Disbursement CSV Download Section */}
            {isBatchPayment && batchRecipients.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-dark-gray">Batch Disbursement Summary</h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const itemDetailsName = itemDetails?.name || selectedItem || 'batch_disbursement';
                      const inferredMethod = batchRecipients[0]?.paymentMethod || paymentMethod;
                      downloadBatchPaymentCSV(batchRecipients, inferredMethod, itemDetailsName);
                    }}
                    className="flex items-center gap-2"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Download CSV
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">Recipients: <span className="font-semibold text-dark-gray">{batchRecipients.length}</span></p>
                  <p className="text-gray-600">Total Amount: <span className="font-semibold text-azure">KES {totalBatchAmount.toLocaleString()}</span></p>
                  <p className="text-gray-600">Payment Method: <span className="font-semibold text-dark-gray">{paymentMethod === 'mpesa_b2c' ? 'M-Pesa B2C' : paymentMethod === 'paybill_b2b' ? 'Paybill B2B' : 'Till B2B'}</span></p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Single Payment Section
          <div className="space-y-4">
            {/* Show supplier info if supplier is provided */}
            {supplier && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Supplier</p>
                    <p className="font-medium text-dark-gray">{supplier.name}</p>
                    <p className="text-xs text-gray-500">{supplier.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-lg font-bold text-azure">
                      KES {amount ? parseFloat(amount).toLocaleString() : '0'}
                    </p>
                  </div>
                </div>
                {Array.isArray(supplier.servicesProvided) && supplier.servicesProvided.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Services:</p>
                    <div className="space-y-1">
                      {supplier.servicesProvided.map((service, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-gray-600">{service.description}</span>
                          <span className="font-medium">KES {service.amount?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Select Item - only show if not paying supplier */}
            {!supplier && (
              <Select
                label="Select Approved Expense"
                value={selectedItem}
                onChange={(e) => {
                  const newSelectedItem = e.target.value;
                  setSelectedItem(newSelectedItem);
                  if (newSelectedItem) {
                    const item = expenses.find(exp => exp.id === newSelectedItem);
                    if (item) {
                      setAmount(item.amount.toString());
                    }
                  }
                }}
                options={[
                  { value: '', label: 'Choose approved expense...' },
                  ...getSourceItems()
                ]}
              />
            )}

            {/* Show item details - only if not paying supplier */}
            {!supplier && itemDetails && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Selected Item</p>
                    <p className="font-medium text-dark-gray">{itemDetails.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Amount Due</p>
                    <p className="text-lg font-bold text-azure">
                      KES {itemDetails.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <Input
                label="Payment Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
                disabled={!!supplier}
              />
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-azure rounded-full"></span>
                Amount will be auto-filled based on selected expense
              </p>
            </div>
          </div>
        )}

        {/* Payment Method Selection - Only for Single Payment (not bulk, not supplier) */}
        {!isBatchPayment && !supplier && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('mpesa_b2c')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'mpesa_b2c'
                    ? 'border-azure bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCardIcon className={`w-6 h-6 mx-auto mb-2 ${
                  paymentMethod === 'mpesa_b2c' ? 'text-azure' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  paymentMethod === 'mpesa_b2c' ? 'text-azure' : 'text-gray-600'
                }`}>
                  M-Pesa B2C
                </p>
                <p className="text-xs text-gray-500 mt-1">Send Money</p>
              </button>

              <button
                onClick={() => setPaymentMethod('paybill_b2b')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'paybill_b2b'
                    ? 'border-azure bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCardIcon className={`w-6 h-6 mx-auto mb-2 ${
                  paymentMethod === 'paybill_b2b' ? 'text-azure' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  paymentMethod === 'paybill_b2b' ? 'text-azure' : 'text-gray-600'
                }`}>
                  Paybill B2B
                </p>
                <p className="text-xs text-gray-500 mt-1">Pay Bill</p>
              </button>

              <button
                onClick={() => setPaymentMethod('till_b2b')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'till_b2b'
                    ? 'border-azure bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCardIcon className={`w-6 h-6 mx-auto mb-2 ${
                  paymentMethod === 'till_b2b' ? 'text-azure' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  paymentMethod === 'till_b2b' ? 'text-azure' : 'text-gray-600'
                }`}>
                  Till B2B
                </p>
                <p className="text-xs text-gray-500 mt-1">Buy Goods</p>
              </button>
            </div>
          </div>
        )}

        {/* Main Wallet Balance Display - Only for Single Payment */}
        {!isBatchPayment && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Main Wallet Balance</p>
                <p className="text-xs text-gray-500 mt-1">Available for external payments</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-azure">
                  KES {(walletsArray.find(w => w.type === 'Main Wallet')?.balance || 0).toLocaleString()}
                </p>
                {amount && Number(amount) > (walletsArray.find(w => w.type === 'Main Wallet')?.balance || 0) && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    Insufficient balance
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Supplier Payment Details Display */}
        {supplier && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-dark-gray mb-3">Supplier Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Supplier Name:</span>
                <span className="font-medium text-dark-gray">{supplier.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-medium text-dark-gray">{supplier.paymentMethod || 'N/A'}</span>
              </div>
              {supplier.paymentMethod === 'Mpesa B2C' && supplier.mpesaPhone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-dark-gray">{supplier.mpesaPhone}</span>
                </div>
              )}
              {supplier.paymentMethod === 'Paybill B2B' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paybill:</span>
                    <span className="font-medium text-dark-gray">{supplier.paybillNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account:</span>
                    <span className="font-medium text-dark-gray">{supplier.paybillAccount || 'N/A'}</span>
                  </div>
                </>
              )}
              {supplier.paymentMethod === 'Till B2B' && supplier.tillNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Till Number:</span>
                  <span className="font-medium text-dark-gray">{supplier.tillNumber}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Method Specific Fields - Only for Single Payment */}
        {!isBatchPayment && (
          <div className="space-y-4">
            {paymentMethod === 'mpesa_b2c' && (
              <PhoneInput
                label="Recipient Phone Number"
                value={phoneNumber}
                onChange={(value) => setPhoneNumber(value)}
                placeholder="7XXXXXXXX"
                required
              />
            )}

            {paymentMethod === 'paybill_b2b' && (
              <>
                <Input
                  label="Paybill Number"
                  type="text"
                  value={paybillNumber}
                  onChange={(e) => setPaybillNumber(e.target.value)}
                  placeholder="Enter paybill number"
                  required
                />
                <Input
                  label="Account Number"
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter account number"
                  required
                />
              </>
            )}

            {paymentMethod === 'till_b2b' && (
              <Input
                label="Till Number"
                type="text"
                value={tillNumber}
                onChange={(e) => setTillNumber(e.target.value)}
                placeholder="Enter till number"
                required
              />
            )}
          </div>
        )}

        {/* Processing/Success State */}
        {isProcessing && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
              <p className="text-sm font-medium text-yellow-800">
                Processing payment...
              </p>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                Payment processed successfully!
              </p>
            </div>
          </div>
        )}

        {/* OTP Verification UI (shown when an OTP has been sent and not yet verified) */}
        {otpSent && !otpVerified && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-azure flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-dark-gray mb-1">Enter OTP</p>
                <p className="text-xs text-gray-600 mb-2">A 4-digit verification code was sent to {phoneNumber}. Please enter it below to proceed.</p>
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
                Secure Payment Processing
              </p>
              <p className="text-xs text-gray-600">
                All payments are processed securely via M-Pesa API. Your transaction
                is encrypted and protected.
              </p>
            </div>
          </div>
        </div>

        {/* OTP Verification UI for Bulk Payments (shown when an OTP has been sent and not yet verified) */}
        {isBatchPayment && otpSent && !otpVerified && (
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

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              // If OTP flow is required for single external payments and OTP not yet sent/verified, start OTP
              if (!isBatchPayment && !otpSent && !otpVerified) {
                // ensure phone number exists for mpesa payments
                if (paymentMethod === 'mpesa_b2c' && !phoneNumber) {
                  setOtpError('Recipient phone number is required to send OTP.');
                  return;
                }
                sendOtp();
                return;
              }
              // If OTP was already sent and not verified, do nothing (user should Verify OTP)
              if (!isBatchPayment && otpSent && !otpVerified) return;
              // For bulk payments, require OTP verification
              if (isBatchPayment && !otpSent && !otpVerified) {
                sendOtp();
                return;
              }
              if (isBatchPayment && otpSent && !otpVerified) return;
              // Otherwise proceed to payment (for batch or already verified OTP)
              handlePayment();
            }}
            disabled={
              isProcessing ||
              (!isBatchPayment && !supplier && (!selectedItem || !amount || Number(amount) <= 0)) ||
              (!isBatchPayment && supplier && (!amount || Number(amount) <= 0)) ||
              (isBatchPayment && (!selectedItem || batchRecipients.length === 0)) ||
              (isBatchPayment && itemDetails && totalBatchAmount > itemDetails.amount) ||
              (!isBatchPayment && paymentMethod === 'mpesa_b2c' && !phoneNumber) ||
              (!isBatchPayment && paymentMethod === 'paybill_b2b' && (!paybillNumber || !accountNumber)) ||
              (!isBatchPayment && paymentMethod === 'till_b2b' && !tillNumber) ||
              (!isBatchPayment && !supplier && Number(amount) > mainWalletBalance) ||
              (!isBatchPayment && supplier && Number(amount) > mainWalletBalance) ||
              (isBatchPayment && totalBatchAmount > mainWalletBalance) ||
              // Prevent clicking Pay Now while OTP is pending verification
              ((!isBatchPayment && otpSent && !otpVerified) || (isBatchPayment && otpSent && !otpVerified))
            }
            className="transition-all duration-200 hover:scale-105"
          >
            <CreditCardIcon className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing...' : (otpSent && !otpVerified ? 'OTP Sent' : 'Pay Now')}
          </Button>
        </div>
      </div>
    </div>
  );
}
