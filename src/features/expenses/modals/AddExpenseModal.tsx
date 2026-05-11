import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import { Button } from '../../../components/ui/Button';
import { UploadIcon, PlusIcon, DownloadIcon, UsersIcon } from 'lucide-react';
import { isPastDate } from '../../../utils/dateFormatter';
import { downloadBatchPaymentCSV } from '../../../utils/batchPaymentUtils';
import { RequestTypeHandler } from '../../../utils/requestTypeHandler';
import { RequestStatus } from '../../../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  events: any[];
  suppliers?: any[];
  systemData?: any;
  currentUser?: any;
  wallets?: any[];
  onAddCategory?: (category: string, expenseGroup?: string) => void;
  expense?: any; // Optional expense for edit mode
}

interface BatchExpenseCategory {
  category: string;
  items: Array<{
    recipientName: string;
    amount: number;
    description?: string;
    paymentMethod: 'sendMoney' | 'paybill' | 'buyGoods';
    phoneNumber?: string;
    paybillNumber?: string;
    accountNumber?: string;
    businessName?: string;
    tillNumber?: string;
    merchantName?: string;
    reference: string;
    idNumber?: string;
  }>;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  events,
  suppliers = [],
  systemData = {},
  currentUser,
  wallets = [],
  onAddCategory,
  expense
}: AddExpenseModalProps) {
  // Normalize props to ensure they are arrays
  const walletsArray = Array.isArray(wallets) ? wallets : (wallets as any)?.data || [];
  const eventsArray = Array.isArray(events) ? events : (events as any)?.data || [];

  const [expenseRequestType, setExpenseRequestType] = useState<'single' | 'batch'>('single');
  const [expenseGroup, setExpenseGroup] = useState<'Event Expenses' | 'Operational Expense' | 'Activation Expense'>('Event Expenses');
  const [expenseContextType, setExpenseContextType] = useState<'Event' | 'Activation' | 'Operation'>('Event');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [assignSupplier, setAssignSupplier] = useState(false);
  const [batchCategories, setBatchCategories] = useState<BatchExpenseCategory[]>([]);
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
  } as {
    recipientName: string;
    amount: number;
    description?: string;
    paymentMethod: 'sendMoney' | 'paybill' | 'buyGoods';
    phoneNumber?: string;
    paybillNumber?: string;
    accountNumber?: string;
    businessName?: string;
    tillNumber?: string;
    merchantName?: string;
    reference: string;
    idNumber?: string;
  });
  const [currentExpense, setCurrentExpense] = useState({
    category: '',
    amount: 0,
    reference: '',
    description: ''
  });
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showRecipientForm, setShowRecipientForm] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    event: '',
    category: '',
    amount: '',
    date: '',
    description: '',
    requestApproval: false,
    supplier: '',
    supplierCategory: '',
    paymentRequestType: 'single' as 'single' | 'bulk',
    batchPaymentDetails: [] as Array<{
      name: string;
      idNumber: string;
      phone?: string;
      paybillNumber?: string;
      accountNumber?: string;
      tillNumber?: string;
      amount: number;
      reference: string;
      paymentMethod: 'mpesa' | 'paybill' | 'till';
    }>,
    walletId: ''
  });
  const [isBatchDisbursement, setIsBatchDisbursement] = useState(false);
  const [dateError, setDateError] = useState('');
  const [totalMismatchError, setTotalMismatchError] = useState('');

  // Populate form when editing an expense
  useEffect(() => {
    if (expense && isOpen) {
      setFormData({
        event: expense.eventId || '',
        category: expense.category || '',
        amount: expense.amount?.toString() || '',
        date: expense.startDate || '',
        description: expense.description || '',
        requestApproval: expense.needsApproval || false,
        supplier: expense.supplier || '',
        supplierCategory: expense.supplierCategory || '',
        paymentRequestType: expense.paymentRequestType || 'single',
        batchPaymentDetails: expense.batchPaymentDetails || [],
        walletId: expense.walletId || ''
      });
      if (expense.expenseType) {
        setExpenseGroup(expense.expenseType);
      }
    }
  }, [expense, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setDateError('');
      setTotalMismatchError('');
      // Reset batch categories when modal closes
      setBatchCategories([]);
      setCsvFile(null);
      setCsvPreview([]);
    } else if (!expense) {
      // Auto-set request approval based on user role (only for new expenses)
      const isAdmin = currentUser?.role === 'Admin';
      if (!isAdmin) {
        // Staff and Approvers always request approval
        setFormData(prev => ({
          ...prev,
          requestApproval: true
        }));
      }
    }
  }, [isOpen, currentUser, expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate date is not in the past
    if (isPastDate(formData.date)) {
      setDateError('Expense date cannot be in the past');
      return;
    }

    setDateError('');

    const selectedEvent = events.find(ev => ev.id === formData.event);

    // Prevent expense creation on archived events
    if (selectedEvent?.status === 'Archived') {
      alert('Cannot create expenses on archived events');
      return;
    }

    // Prevent expense creation on expired events
    if (selectedEvent && new Date(selectedEvent.endDate) < new Date()) {
      alert('Cannot create expenses on expired events. The event has already ended.');
      return;
    }

    if (expenseRequestType === 'batch') {
      // Validate batch expense - now using the new expenses structure
      if (expenses.length === 0 && csvPreview.length === 0) {
        alert('Please add at least one expense or upload a CSV file for batch expense');
        return;
      }

      // Calculate total amount from expenses and CSV
      let totalAmount = 0;

      // Calculate from expenses
      expenses.forEach(expense => {
        totalAmount += expense.amount;
      });

      // Calculate from CSV preview
      csvPreview.forEach(item => {
        totalAmount += item.amount;
      });

      // Convert expenses to the expected batchCategories format for backward compatibility
      const batchCategoriesFromExpenses = expenses.reduce((acc: Array<{ category: string; items: Array<Record<string, unknown>> }>, expense: Record<string, unknown>) => {
        // Find if category already exists
        const existingCategory = acc.find((cat: { category: string; items: Array<Record<string, unknown>> }) => cat.category === expense.category);

        if (existingCategory) {
          // Add to existing category
          existingCategory.items.push({
            recipientName: '',
            amount: expense.amount,
              description: expense.description || '',
            paymentMethod: '',
            phoneNumber: '',
            paybillNumber: '',
            accountNumber: '',
            businessName: '',
            tillNumber: '',
            merchantName: '',
            reference: expense.reference || '',
            idNumber: ''
          });
        } else {
          // Create new category
          acc.push({
            category: typeof expense.category === 'string' ? expense.category : 'Unknown',
            items: [{
              recipientName: '',
              amount: typeof expense.amount === 'number' ? expense.amount : 0,
              description: expense.description || '',
              paymentMethod: '',
              phoneNumber: '',
              paybillNumber: '',
              accountNumber: '',
              businessName: '',
              tillNumber: '',
              merchantName: '',
              reference: expense.reference || '',
              idNumber: ''
            }]
          });
        }

        return acc;
      }, [] as BatchExpenseCategory[]);

      // Derive batch expense data from the added expenses list only
      const primaryExpense = expenses[0] || {};
      const batchExpenseData = {
        id: `batch-${Date.now()}`,
        title: `${selectedEvent?.name || getEventLabel()} - Batch Expense`,
        eventId: selectedEvent?.id || '',
        eventName: selectedEvent?.name || '',
        client: selectedEvent?.client || '',
        category: (primaryExpense.category as string) || 'Batch Expense',
        amount: totalAmount,
        budget: 0, // Default budget for batch expenses
        startDate: selectedEvent?.startDate || formData.date || new Date().toISOString().split('T')[0],
        dueDate: selectedEvent?.endDate || formData.date || new Date().toISOString().split('T')[0],
        status: formData.requestApproval ? 'Pending' : 'Approved' as RequestStatus,
        expenseType: expenseGroup,
        expenseContextType: expenseContextType,
        expenseRequestType: 'batch' as 'single' | 'batch',
        totalAmount: totalAmount,
        recipientCount: expenses.length + csvPreview.length,
        batchCategories: batchCategoriesFromExpenses,
        csvData: csvPreview,
        description: expenses.map((exp: any) => exp.description || '').filter((note: string) => note.trim()).join('; ') || '',
        supplier: assignSupplier ? formData.supplier : '',
        supplierCategory: assignSupplier ? formData.supplierCategory : '',
        createdBy: currentUser?.id || '',
        createdByUserId: currentUser?.id || '', // Required by Expense interface
        createdByRole: currentUser?.role || '',
        approvalRequired: formData.requestApproval,
        approvalStatus: formData.requestApproval ? 'pending' : 'approved' as 'pending' | 'approved' | 'rejected' | 'completed',
        // Include the new expenses structure for future use
        expenses: expenses,
        // Flag to indicate this is a complete batch expense entity
        isCompleteBatchExpense: true,
        // Include all recipient details from batchCategories in a standardized format for easy processing
        allRecipients: batchCategories.flatMap(category =>
          category.items.map(item => ({
            recipientName: item.recipientName,
            amount: item.amount,
            paymentMethod: item.paymentMethod,
            phoneNumber: item.phoneNumber,
            paybillNumber: item.paybillNumber,
            accountNumber: item.accountNumber,
            tillNumber: item.tillNumber,
            reference: item.reference,
            category: category.category,
            idNumber: item.idNumber || ''
          }))
        ),
        batchPaymentDetails: []
      };

      // Use RequestTypeHandler to ensure proper batch expense structure
      const processedBatchExpense = RequestTypeHandler.ensureBatchExpenseStructure(batchExpenseData);

      onSuccess(processedBatchExpense);
    } else {
      // Single expense flow - now supports batch disbursement
      const expenseData = {
        ...(expense?.id && { id: expense.id }), // Include ID when editing
        title: `${selectedEvent?.name || getEventLabel()} - ${formData.category}`,
        category: formData.category,
        amount: Number(formData.amount),
        eventId: formData.event,
        eventName: selectedEvent?.name || '',
        client: selectedEvent?.client || '',
        startDate: formData.date,
        dueDate: formData.date,
        status: expense ? expense.status : (formData.requestApproval ? 'Pending' : 'Approved'), // Keep original status when editing
        expenseType: expenseGroup,
        description: formData.description || '', // Include description
        supplier: assignSupplier ? formData.supplier : formData.category,
        supplierCategory: assignSupplier ? formData.supplierCategory : '',
        paymentRequestType: isBatchDisbursement ? 'bulk' : 'single',
        batchPaymentDetails: isBatchDisbursement ? batchCategories.flatMap(category =>
          category.items.map(item => ({
            name: item.recipientName,
            idNumber: item.idNumber || '',
            phone: item.paymentMethod === 'sendMoney' ? item.phoneNumber : undefined,
            paybillNumber: item.paymentMethod === 'paybill' ? item.paybillNumber : undefined,
            accountNumber: item.paymentMethod === 'paybill' ? item.accountNumber : undefined,
            tillNumber: item.paymentMethod === 'buyGoods' ? item.tillNumber : undefined,
            amount: Number(item.amount),
            reference: item.reference,
            paymentMethod: item.paymentMethod === 'sendMoney' ? 'mpesa' :
                         item.paymentMethod === 'paybill' ? 'paybill' : 'till'
          }))
        ) : []
      };

      onSuccess(expenseData);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      if (onAddCategory) {
        onAddCategory(newCategory, expenseGroup);
      }
      setFormData({ ...formData, category: newCategory });
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  const getExpenseLabel = () => {
    switch (expenseGroup) {
      case 'Event Expenses':
        return 'Event Expense';
      case 'Operational Expense':
        return 'Operational Expense';
      case 'Activation Expense':
        return 'Activation Expense';
      default:
        return 'Expense';
    }
  };

  const getEventLabel = () => {
    switch (expenseGroup) {
      case 'Event Expenses':
        return 'Event';
      case 'Operational Expense':
        return 'Department/Operation';
      case 'Activation Expense':
        return 'Activation';
      default:
        return 'Event';
    }
  };

  const getContextLabel = () => {
    switch (expenseContextType) {
      case 'Activation':
        return 'Activation';
      case 'Event':
        return 'Event';
      case 'Operation':
        return 'Operation';
      default:
        return 'Event';
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

  // Filter events based on expense group
  const filteredEvents = eventsArray.filter((e: any) => {
    if (e.status === 'Archived' || e.status === 'Cancelled') return false;
    if (!e.endDate) return false;

    const eventEndDate = new Date(e.endDate);
    const today = new Date();
    const eventDateOnly = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (eventDateOnly < todayDateOnly) return false;

    if (expenseGroup === 'Event Expenses') return e.type === 'Event' || e.type === 'Project';
    if (expenseGroup === 'Activation Expense') return e.type === 'Activation';
    if (expenseGroup === 'Operational Expense') return e.type === 'Operation';
    return true;
  });

  // Get categories from system data based on expense group
  const getCategories = () => {
    let categoriesArray = [];

    // Select the appropriate category array based on expense group
    if (expenseGroup === 'Event Expenses') {
      categoriesArray = systemData.expensecategorys || [];
    } else if (expenseGroup === 'Activation Expense') {
      categoriesArray = systemData.activationcategorys || [];
    } else if (expenseGroup === 'Operational Expense') {
      categoriesArray = systemData.operationcategorys || [];
    }

    return categoriesArray
      .map((cat: any) => {
        const name = typeof cat === 'string' ? cat : (cat?.name || '');
        return name.toString().trim();
      })
      .filter((name: string) => name !== '');
  };

  const getCategoryLabel = () => {
    // Return appropriate label based on expense group
    if (expenseGroup === 'Event Expenses') return 'Expense Category';
    if (expenseGroup === 'Activation Expense') return 'Activation Category';
    if (expenseGroup === 'Operational Expense') return 'Operation Category';
    return 'Category';
  };

  const categories = getCategories();

  const getModalTitle = () => {
    const prefix = expense ? 'Edit' : 'Add';
    switch (expenseGroup) {
      case 'Event Expenses':
        return `${prefix} Event Expense`;
      case 'Operational Expense':
        return `${prefix} Operational Expense`;
      case 'Activation Expense':
        return `${prefix} Activation Expense`;
      default:
        return `${prefix} Expense`;
    }
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
    const recipientCategory = currentCategory || (formData.category || 'General Recipients');

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

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          // Parse CSV and convert to batchCategories format for recipients
          const lines = text.split('\n').slice(1).filter(line => line.trim());
          const parsedRecipients = lines.map(line => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const paymentMethod = values[2] || 'sendMoney';

            return {
              recipientName: values[1] || '',
              paymentMethod: paymentMethod,
              phoneNumber: paymentMethod === 'sendMoney' ? values[3] || '' : undefined,
              paybillNumber: paymentMethod === 'paybill' ? values[3] || '' : undefined,
              accountNumber: values[4] || '',
              tillNumber: paymentMethod === 'buyGoods' ? values[3] || '' : undefined,
              amount: parseFloat(values[5]) || 0,
              reference: values[6] || '',
              idNumber: '',
              description: '',
              category: values[0] || 'Uploaded Recipients'
            };
          });

          // Group recipients by category and add to batchCategories
          const updatedCategories = [...batchCategories];
          parsedRecipients.forEach(recipient => {
            const categoryIndex = updatedCategories.findIndex(cat => cat.category === recipient.category);
            if (categoryIndex >= 0) {
              // Category exists, add to it
              updatedCategories[categoryIndex].items.push({
                recipientName: recipient.recipientName,
                amount: recipient.amount,
              description: recipient.description,
                paymentMethod: recipient.paymentMethod as 'sendMoney' | 'paybill' | 'buyGoods',
                phoneNumber: recipient.phoneNumber,
                paybillNumber: recipient.paybillNumber,
                accountNumber: recipient.accountNumber,
                tillNumber: recipient.tillNumber,
                reference: recipient.reference,
                idNumber: recipient.idNumber || ''
              });
            } else {
              // Category doesn't exist, create new one
              updatedCategories.push({
                category: recipient.category,
                items: [{
                  recipientName: recipient.recipientName,
                  amount: recipient.amount,
                  description: recipient.description,
                  paymentMethod: recipient.paymentMethod as 'sendMoney' | 'paybill' | 'buyGoods',
                  phoneNumber: recipient.phoneNumber,
                  paybillNumber: recipient.paybillNumber,
                  accountNumber: recipient.accountNumber,
                  tillNumber: recipient.tillNumber,
                  reference: recipient.reference,
                  idNumber: recipient.idNumber || ''
                }]
              });
            }
          });

          setBatchCategories(updatedCategories);
          alert(`Successfully imported ${parsedRecipients.length} recipients from CSV file.`);
        } catch (error) {
          alert('Error parsing CSV file. Please check the format and try again.');
          setCsvFile(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const removeCsvItem = (index: number) => {
    const updatedPreview = [...csvPreview];
    updatedPreview.splice(index, 1);
    setCsvPreview(updatedPreview);
  };

  const downloadSendMoneyTemplate = () => {
    // Create recipients from batchCategories for Send Money template
    const sendMoneyRecipients: any[] = batchCategories
      .flatMap(category => category.items
        .filter(item => item.paymentMethod === 'sendMoney')
        .map(item => ({
          name: item.recipientName,
          idNumber: (item.idNumber || '').toString(),
          phone: item.phoneNumber,
          amount: item.amount,
          reference: item.reference,
          paymentMethod: 'mpesa_b2c',
          category: category.category
        }))
      );

    // If no send money recipients, provide sample data
    if (sendMoneyRecipients.length === 0) {
      sendMoneyRecipients.push(
        {
          name: 'John Doe',
          idNumber: '12345678',
          phone: '254712345678',
          amount: 5000,
          reference: 'Payment for services',
          paymentMethod: 'mpesa_b2c',
          category: 'Marketing'
        },
        {
          name: 'Jane Smith',
          idNumber: '87654321',
          phone: '254723456789',
          amount: 3000,
          reference: 'Transportation costs',
          paymentMethod: 'mpesa_b2c',
          category: 'Logistics'
        }
      );
    }

    // Generate CSV using the utility function
    downloadBatchPaymentCSV(sendMoneyRecipients, 'mpesa_b2c', 'send_money_template', true);
  };

  const downloadPaybillTemplate = () => {
    // Create recipients from batchCategories for Paybill template
    const paybillRecipients: any[] = batchCategories
      .flatMap(category => category.items
        .filter(item => item.paymentMethod === 'paybill')
        .map(item => ({
          name: item.recipientName,
          idNumber: (item.idNumber || '').toString(),
          paybillNumber: item.paybillNumber,
          accountNumber: item.accountNumber,
          amount: item.amount,
          reference: item.reference,
          paymentMethod: 'paybill_b2b',
          category: category.category
        }))
      );

    // If no paybill recipients, provide sample data
    if (paybillRecipients.length === 0) {
      paybillRecipients.push(
        {
          name: 'ABC Company',
          idNumber: '12345678',
          paybillNumber: '123456',
          accountNumber: 'ACC001',
          amount: 10000,
          reference: 'Venue rental',
          paymentMethod: 'paybill_b2b',
          category: 'Venue'
        },
        {
          name: 'XYZ Caterers',
          idNumber: '87654321',
          paybillNumber: '789012',
          accountNumber: 'ACC002',
          amount: 8000,
          reference: 'Catering services',
          paymentMethod: 'paybill_b2b',
          category: 'Catering'
        }
      );
    }

    // Generate CSV using the utility function
    downloadBatchPaymentCSV(paybillRecipients, 'paybill_b2b', 'paybill_template', true);
  };

  const downloadBuyGoodsTemplate = () => {
    // Create recipients from batchCategories for Buy Goods template
    const buyGoodsRecipients: any[] = batchCategories
      .flatMap(category => category.items
        .filter(item => item.paymentMethod === 'buyGoods')
        .map(item => ({
          name: item.recipientName,
          idNumber: (item.idNumber || '').toString(),
          tillNumber: item.tillNumber,
          amount: item.amount,
          reference: item.reference,
          paymentMethod: 'till_b2b',
          category: category.category
        }))
      );

    // If no buy goods recipients, provide sample data
    if (buyGoodsRecipients.length === 0) {
      buyGoodsRecipients.push(
        {
          name: 'Tech Supplies',
          idNumber: '12345678',
          tillNumber: '654321',
          amount: 15000,
          reference: 'Equipment purchase',
          paymentMethod: 'till_b2b',
          category: 'Equipment'
        },
        {
          name: 'Office Mart',
          idNumber: '87654321',
          tillNumber: '987654',
          amount: 2000,
          reference: 'Office supplies',
          paymentMethod: 'till_b2b',
          category: 'Supplies'
        }
      );
    }

    // Generate CSV using the utility function
    downloadBatchPaymentCSV(buyGoodsRecipients, 'till_b2b', 'buy_goods_template', true);
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // New functions for the Quick Add Expense functionality
  const addExpense = () => {
    if (!currentExpense.category || currentExpense.amount <= 0 || !currentExpense.reference) {
      alert('Please fill in all required fields');
      return;
    }

    // Add the expense to the list (without recipient details as per requirements)
    setExpenses([...expenses, {
      ...currentExpense,
      amount: currentExpense.amount
    }]);

    // Reset the form but keep it open for adding more expenses
    setCurrentExpense({
      category: formData.category || '',
      amount: 0,
      reference: '',
      description: ''
    });

    // Keep the form open for continuous adding - remove setShowAddExpense(false)
  };

  // Function to add expense from main form fields
  const addExpenseFromMainForm = () => {
    // For batch expenses, allow adding even if form fields are empty
    if (expenseRequestType === 'batch') {
      // Use defaults if fields are empty
      const expenseCategory = formData.category || 'General';
      const expenseAmount = Number(formData.amount) || 0;
      const expenseReference = (formData.description && formData.description.trim()) ? formData.description : `Expense-${Date.now()}`;

      // Add the expense to the list using main form data or defaults
      setExpenses([...expenses, {
        category: expenseCategory,
        amount: expenseAmount,
        reference: expenseReference,
        description: formData.description || ''
      }]);

      // Reset the main form fields but keep modal open for adding more expenses
      setFormData({
        ...formData,
        amount: '',
        description: ''
      });
    } else {
      // For single expenses, require fields
      if (!formData.category || !formData.amount || Number(formData.amount) <= 0) {
        alert('Please fill in category and amount fields');
        return;
      }

      // Add the expense to the list using main form data
      setExpenses([...expenses, {
        category: formData.category,
        amount: Number(formData.amount),
        reference: (formData.description && formData.description.trim()) ? formData.description : `Expense-${Date.now()}`, // Use description as reference or generate one
        description: formData.description || ''
      }]);

      // Reset the main form fields but keep modal open for adding more expenses
      setFormData({
        ...formData,
        amount: '',
        description: ''
      });
    }
  };

  const editExpense = (index: number) => {
    // Set the current expense to the selected expense for editing
    const expenseToEdit = expenses[index];
    setCurrentExpense({
      category: (expenseToEdit.category as string) || '',
      amount: (expenseToEdit.amount as number) || 0,
      reference: (expenseToEdit.reference as string) || '',
      description: (expenseToEdit.description as string) || ''
    });
    // Remove the expense from the list temporarily
    const updatedExpenses = [...expenses];
    updatedExpenses.splice(index, 1);
    setExpenses(updatedExpenses);
    // Show the edit form
    setShowExpenseForm(true);
  };

  const removeExpense = (index: number) => {
    const updatedExpenses = [...expenses];
    updatedExpenses.splice(index, 1);
    setExpenses(updatedExpenses);
  };

  return <Modal isOpen={isOpen} onClose={onClose} title={expenseRequestType === 'single' ? getModalTitle() : `${getModalTitle()} (Batch)`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Batch Expenses Checkbox */}
        <label className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
          <input
            type="checkbox"
            checked={expenseRequestType === 'batch'}
            onChange={(e) => setExpenseRequestType(e.target.checked ? 'batch' : 'single')}
            className="rounded text-primary"
          />
          <span className="text-sm font-medium text-dark-gray">Batch Expenses (Check if expense involves multiple expenses)</span>
        </label>

        {expenseRequestType === 'single' ? (
          // Single Expense Flow (Unchanged)
          <>
            <Select
              label="Expense Group"
              options={[
                { value: 'Event Expenses', label: 'Event Expenses' },
                { value: 'Operational Expense', label: 'Operational Expense' },
                { value: 'Activation Expense', label: 'Activation Expense' }
              ]}
              value={expenseGroup}
              onChange={e => {
                setExpenseGroup(e.target.value as any);
                setFormData({
                  event: '',
                  category: '',
                  amount: '',
                  date: '',
                  description: '',
                  requestApproval: false,
                  supplier: '',
                  supplierCategory: '',
                  paymentRequestType: 'single',
                  batchPaymentDetails: [],
                  walletId: ''
                });
              }}
              required
            />

            <Select
              label={getEventLabel()}
              options={[
                { value: '', label: filteredEvents.length === 0 ? `No ${getEventLabel().toLowerCase()}s available (Total events: ${eventsArray.length})` : `Select ${getEventLabel().toLowerCase()}` },
                ...filteredEvents.map((e: any) => ({
                  value: e.id,
                  label: e.name
                }))
              ]}
              value={formData.event}
              onChange={e => setFormData({ ...formData, event: e.target.value })}
              required
            />

        {/* Wallet Selection - Only show for non-staff users with assigned wallets */}
        {currentUser?.role !== 'Staff' && currentUser?.assignedWallets && currentUser.assignedWallets.length > 0 && walletsArray && walletsArray.length > 0 && (
          <Select
            label="Source Wallet"
            options={[
              { value: '', label: 'Select source wallet' },
              ...(currentUser.assignedWallets || [])
                .map((walletId: string) => walletsArray.find((w: any) => w.id === walletId))
                .filter(Boolean)
                .map((wallet: any) => ({
                  value: wallet.id,
                  label: `${wallet.name} (${wallet.type}) - KES ${wallet.balance.toLocaleString()}`
                }))
            ]}
            value={formData.walletId}
            onChange={e => setFormData({ ...formData, walletId: e.target.value })}
            required
          />
        )}

        {/* Expense/Operation/Activation Category with Add Option */}
        <div>
          <label className="block text-sm font-medium text-dark-gray mb-2">{getCategoryLabel()}</label>
          {!showAddCategory ? (
            <div className="flex gap-2">
                  <Select
                    label=""
                    options={[
                      { value: '', label: 'Select category' },
                      ...categories.map((cat: string) => ({
                        value: cat,
                        label: cat
                      }))
                    ]}
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  />
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowAddCategory(true)}
                title="Add new category"
              >
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input 
                placeholder="Enter new category name" 
                value={newCategory} 
                onChange={e => setNewCategory(e.target.value)}
                autoFocus
              />
              <Button 
                type="button" 
                variant="primary" 
                size="sm" 
                onClick={handleAddCategory}
              >
                Add
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategory('');
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

            <Input
              label="Amount (KES)"
              type="number"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
            />

            <Input
              label="Date & Time Incurred"
              type="datetime-local"
              value={formData.date}
              onChange={e => {
                setFormData({ ...formData, date: e.target.value });
                setDateError('');
              }}
            />

            {dateError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{dateError}</p>
              </div>
            )}

            {totalMismatchError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{totalMismatchError}</p>
              </div>
            )}

            <div>
          <label className="block text-sm font-medium text-dark-gray mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure"
            rows={3}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter detailed reason for this expense"
          />
        </div>

            {/* Batch Disbursement Checkbox */}
            <label className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
              <input
                type="checkbox"
                checked={isBatchDisbursement}
                onChange={(e) => setIsBatchDisbursement(e.target.checked)}
                className="rounded text-primary"
              />
              <span className="text-sm font-medium text-dark-gray">Batch Disbursement (Check if payment involves multiple recipients)</span>
            </label>

            {/* Batch Disbursement Details Section */}
            {isBatchDisbursement && (
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
                onClick={downloadSendMoneyTemplate}
                className="flex items-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" />
                Download Send Money Template
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={downloadPaybillTemplate}
                className="flex items-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" />
                Download Paybill Template
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={downloadBuyGoodsTemplate}
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
                    onChange={handleCsvUpload}
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
                    <span>KES {batchCategories.reduce((sum, cat) => sum + cat.items.reduce((catSum, item) => catSum + item.amount, 0), 0).toLocaleString()}</span>
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

        {/* Assign Supplier Checkbox - Only for Admins on Event and Activation Expenses */}
        {currentUser?.role === 'Admin' && expenseGroup !== 'Operational Expense' && (
          <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={assignSupplier}
              onChange={e => {
                setAssignSupplier(e.target.checked);
                if (!e.target.checked) {
                  setFormData({ ...formData, supplier: '', supplierCategory: '' });
                }
              }}
              className="rounded text-primary"
            />
            <span className="text-sm font-medium text-dark-gray">Assign Supplier (Admin Only)</span>
          </label>
        )}

        {/* Supplier Selection Fields */}
        {assignSupplier && (
          <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Select
                  label="Supplier Category"
                  options={[
                    { value: '', label: 'Select supplier category' },
              ...(systemData.suppliercategorys || []).map((cat: { name?: string }) => {
                const name = cat.name || '';
                return {
                  value: name,
                  label: name
                };
              })
                  ]}
                  value={formData.supplierCategory}
                  onChange={e => setFormData({ ...formData, supplierCategory: e.target.value, supplier: '' })}
                  required={assignSupplier}
                />

                <Select
                  label="Supplier"
                  options={[
                    { value: '', label: 'Select supplier' },
                    ...suppliers
                      .filter((s: any) => !formData.supplierCategory || s.category === formData.supplierCategory)
                      .map((s: any) => ({
                        value: s.name || '',
                        label: `${s.name || 'Unknown'} (${s.category || 'No Category'})`
                      }))
                  ]}
                  value={formData.supplier}
                  onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                  required={assignSupplier}
                />
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Upload Receipt</p>
          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 10MB)</p>
        </div>

            {/* Rest of the single expense form remains unchanged */}
          </>
        ) : (
          // Batch Expense Flow (Updated to match single expense form)
          <>
            {/* Expense Group Selection - Same as single expense form */}
            <Select
              label="Expense Group"
              options={[
                { value: 'Event Expenses', label: 'Event Expenses' },
                { value: 'Operational Expense', label: 'Operational Expense' },
                { value: 'Activation Expense', label: 'Activation Expense' }
              ]}
              value={expenseGroup}
              onChange={e => {
                setExpenseGroup(e.target.value as any);
                // Update expenseContextType to match the expenseGroup
                const newContextType = e.target.value === 'Event Expenses' ? 'Event' :
                                      e.target.value === 'Activation Expense' ? 'Activation' : 'Operation';
                setExpenseContextType(newContextType);
              }}
              required
            />

            <Select
              label={getEventLabel()}
              options={[
                { value: '', label: `Select ${getEventLabel().toLowerCase()}` },
                ...filteredEvents.map((e: any) => ({
                  value: e.id,
                  label: e.name
                }))
              ]}
              value={formData.event}
              onChange={e => setFormData({ ...formData, event: e.target.value })}
            />

            {/* Expense Category with Add Option - Same as single expense form */}
            <div>
              <label className="block text-sm font-medium text-dark-gray mb-2">{getCategoryLabel()}</label>
              {!showAddCategory ? (
                <div className="flex gap-2">
                  <Select
                    label=""
                    options={[
                      { value: '', label: 'Select category' },
                      ...categories.map((cat: string) => ({
                        value: cat,
                        label: cat
                      }))
                    ]}
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAddCategory(true)}
                    title="Add new category"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter new category name"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleAddCategory}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowAddCategory(false);
                      setNewCategory('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <Input
              label="Amount (KES)"
              type="number"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              required
            />

            <Input
              label="Date & Time Incurred"
              type="datetime-local"
              value={formData.date}
              onChange={e => {
                setFormData({ ...formData, date: e.target.value });
                setDateError('');
              }}
              required
            />

            {dateError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{dateError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-gray mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter detailed reason for this expense"
                required
              />
            </div>

            {/* Added Expenses List */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-dark-gray">Added Expenses</h4>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={addExpenseFromMainForm}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Expense
                </Button>
              </div>

              <p className="text-sm text-gray-600">List of individual expenses in this batch</p>

              {/* Expenses List */}
              {expenses.length > 0 ? (
                <div className="mt-4">
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {expenses.map((expense, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{expense.category}</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">
                              KES {expense.amount.toLocaleString()} | Ref: {expense.reference}
                            </p>
            {expense.description && (
              <p className="text-xs text-gray-500 italic mt-1">Description: {expense.description}</p>
            )}
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              onClick={() => editExpense(index)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Edit"
                            >
                              ??
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              onClick={() => removeExpense(index)}
                              className="text-red-500 hover:text-red-700"
                              title="Remove"
                            >
                              ???
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Batch Total:</span>
                      <span>KES {expenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-500">No expenses added yet</p>
                  <p className="text-xs text-gray-400 mt-1">Fill the expense form above and click "Add Expense"</p>
                </div>
              )}
            </div>

            {/* Batch Disbursement Checkbox */}
            <label className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
              <input
                type="checkbox"
                checked={isBatchDisbursement}
                onChange={(e) => setIsBatchDisbursement(e.target.checked)}
                className="rounded text-primary"
              />
              <span className="text-sm font-medium text-dark-gray">Batch Disbursement (Check if payment involves multiple recipients)</span>
            </label>

            {/* Batch Disbursement Details Section */}
            {isBatchDisbursement && (
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
                onClick={downloadSendMoneyTemplate}
                className="flex items-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" />
                Download Send Money Template
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={downloadPaybillTemplate}
                className="flex items-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" />
                Download Paybill Template
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={downloadBuyGoodsTemplate}
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
                    onChange={handleCsvUpload}
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
                    <span>KES {batchCategories.reduce((sum, cat) => sum + cat.items.reduce((catSum, item) => catSum + item.amount, 0), 0).toLocaleString()}</span>
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

            {/* Assign Supplier Checkbox for Batch Expenses - Only for Admins on Event and Activation Expenses */}
            {currentUser?.role === 'Admin' && expenseGroup !== 'Operational Expense' && (
              <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={assignSupplier}
                  onChange={e => {
                    setAssignSupplier(e.target.checked);
                    if (!e.target.checked) {
                      setFormData({ ...formData, supplier: '', supplierCategory: '' });
                    }
                  }}
                  className="rounded text-primary"
                />
                <span className="text-sm font-medium text-dark-gray">Assign Supplier (Admin Only)</span>
              </label>
            )}

            {/* Supplier Selection Fields */}
            {assignSupplier && (
              <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Select
                  label="Supplier Category"
                  options={[
                    { value: '', label: 'Select supplier category' },
              ...(systemData.suppliercategorys || []).map((cat: { name?: string }) => {
                const name = cat.name || '';
                return {
                  value: name,
                  label: name
                };
              })
                  ]}
                  value={formData.supplierCategory}
                  onChange={e => setFormData({ ...formData, supplierCategory: e.target.value, supplier: '' })}
                  required={assignSupplier}
                />

                <Select
                  label="Supplier"
                  options={[
                    { value: '', label: 'Select supplier' },
                    ...suppliers
                      .filter((s: any) => !formData.supplierCategory || s.category === formData.supplierCategory)
                      .map((s: any) => ({
                        value: s.name,
                        label: `${s.name} (${s.category})`
                      }))
                  ]}
                  value={formData.supplier}
                  onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                  required={assignSupplier}
                />
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Upload Supporting Documents</p>
              <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 10MB)</p>
            </div>
          </>
        )}

        {/* Request Approval Checkbox - Only for Admin (Staff/Approvers always request approval) */}
        {currentUser?.role === 'Admin' ? (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.requestApproval}
              onChange={e => setFormData({ ...formData, requestApproval: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-dark-gray">Request approval for this expense</span>
          </label>
        ) : (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">This expense will automatically be sent for approval.</p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {expenseRequestType === 'single' ? `Submit ${getExpenseLabel()}` : 'Submit Batch Expense'}
          </Button>
        </div>
      </form>
    </Modal>;
}
