import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import { Button } from '../../../components/ui/Button';
import { UploadIcon, PlusIcon, DownloadIcon, UsersIcon, EditIcon, Trash2Icon, ReceiptIcon, FileTextIcon } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
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
    description: '',
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
  const [expenses, setExpenses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    event: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    requestApproval: true,
    supplier: '',
    supplierCategory: '',
    walletId: ''
  });
  const [isBatchDisbursement, setIsBatchDisbursement] = useState(false);
  const [showRecipientForm, setShowRecipientForm] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [dateError, setDateError] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (expense && isOpen) {
      setFormData({
        event: expense.eventId || '',
        category: expense.category || '',
        amount: expense.amount?.toString() || '',
        date: expense.startDate || new Date().toISOString().split('T')[0],
        description: expense.description || '',
        reference: expense.reference || '',
        requestApproval: expense.needsApproval ?? true,
        supplier: expense.supplier || '',
        supplierCategory: expense.supplierCategory || '',
        walletId: expense.walletId || ''
      });
      if (expense.expenseType) setExpenseGroup(expense.expenseType);
      if (expense.expenseRequestType) setExpenseRequestType(expense.expenseRequestType);
    }
  }, [expense, isOpen]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setExpenses([]);
      setBatchCategories([]);
      setCsvPreview([]);
      setCsvFile(null);
      setDateError('');
    }
  }, [isOpen]);

  const addExpenseFromMainForm = () => {
    if (!formData.category || !formData.amount) {
      alert('Please fill in category and amount');
      return;
    }
    const newExpense = {
      category: formData.category,
      amount: Number(formData.amount),
      description: formData.description,
      reference: formData.reference || `EXP-${Date.now()}`,
      id: Date.now().toString()
    };
    setExpenses([...expenses, newExpense]);
    setFormData({ ...formData, amount: '', description: '', reference: '' });
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const editExpense = (index: number) => {
    const exp = expenses[index];
    setFormData({ ...formData, category: exp.category, amount: exp.amount.toString(), description: exp.description, reference: exp.reference });
    removeExpense(index);
  };

  const addRecipient = () => {
    if (!currentRecipient.recipientName || currentRecipient.amount <= 0) {
      alert('Fill in recipient name and amount');
      return;
    }
    const catName = currentCategory || formData.category || 'General';
    const updated = [...batchCategories];
    const idx = updated.findIndex(c => c.category === catName);
    const item = { ...currentRecipient, reference: currentRecipient.reference || `REF-${Date.now()}` };
    
    if (idx >= 0) updated[idx].items.push(item);
    else updated.push({ category: catName, items: [item] });
    
    setBatchCategories(updated);
    setCurrentRecipient({
      recipientName: '', amount: 0, description: '', paymentMethod: 'sendMoney',
      phoneNumber: '', paybillNumber: '', accountNumber: '', businessName: '',
      tillNumber: '', merchantName: '', reference: '', idNumber: ''
    });
  };

  const removeRecipient = (catIdx: number, itemIdx: number) => {
    const updated = [...batchCategories];
    updated[catIdx].items.splice(itemIdx, 1);
    if (updated[catIdx].items.length === 0) updated.splice(catIdx, 1);
    setBatchCategories(updated);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const lines = (event.target?.result as string).split('\n').slice(1).filter(l => l.trim());
        const parsed = lines.map(l => {
          const v = l.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
          return {
            category: v[0] || 'Uploaded',
            recipientName: v[1] || '',
            paymentMethod: (v[2] || 'sendMoney') as any,
            phoneNumber: v[3], amount: parseFloat(v[5]) || 0, reference: v[6]
          };
        });
        const updated = [...batchCategories];
        parsed.forEach(r => {
          const idx = updated.findIndex(c => c.category === r.category);
          const item = { ...r, reference: r.reference || `REF-${Date.now()}` } as any;
          if (idx >= 0) updated[idx].items.push(item);
          else updated.push({ category: r.category, items: [item] });
        });
        setBatchCategories(updated);
      } catch (err) { alert('CSV parse error'); }
    };
    reader.readAsText(file);
  };

  const getEventLabel = () => expenseGroup === 'Operational Expense' ? 'Department' : 'Event';
  const getCategoryLabel = () => `${expenseGroup.split(' ')[0]} Category`;
  
  const filteredEvents = eventsArray.filter((e: any) => {
    if (e.status === 'Archived') return false;
    if (expenseGroup === 'Event Expenses') return e.type === 'Event' || e.type === 'Project';
    if (expenseGroup === 'Activation Expense') return e.type === 'Activation';
    if (expenseGroup === 'Operational Expense') return e.type === 'Operation';
    return true;
  });

  const getCategories = () => {
    const arr = expenseGroup === 'Event Expenses' ? systemData.expensecategorys : 
                expenseGroup === 'Activation Expense' ? systemData.activationcategorys : 
                systemData.operationcategorys;
    return (arr || []).map((c: any) => (typeof c === 'string' ? c : c.name)).filter(Boolean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPastDate(formData.date)) { setDateError('Date cannot be in the past'); return; }

    const selectedEvent = eventsArray.find(ev => ev.id === formData.event);
    const totalAmount = expenseRequestType === 'batch' ? expenses.reduce((s, x) => s + x.amount, 0) : Number(formData.amount);

    const payload = {
      ...formData,
      id: expense?.id || `exp-${Date.now()}`,
      expenseRequestType,
      expenseType: expenseGroup,
      amount: totalAmount,
      eventName: selectedEvent?.name || formData.event,
      status: expense?.status || (formData.requestApproval ? 'Pending' : 'Approved'),
      batchPaymentDetails: isBatchDisbursement ? batchCategories.flatMap(c => c.items.map(i => ({
        name: i.recipientName,
        amount: i.amount,
        reference: i.reference,
        paymentMethod: i.paymentMethod === 'sendMoney' ? 'mpesa' : i.paymentMethod === 'paybill' ? 'paybill' : 'till',
        phone: i.phoneNumber,
        paybillNumber: i.paybillNumber,
        accountNumber: i.accountNumber,
        tillNumber: i.tillNumber
      }))) : [],
      expenses: expenseRequestType === 'batch' ? expenses : [],
      isBatchDisbursement
    };

    onSuccess(processedBatchExpense(payload));
  };

  const processedBatchExpense = (data: any) => RequestTypeHandler.ensureBatchExpenseStructure(data);

  const downloadSendMoneyTemplate = () => downloadBatchPaymentCSV([], 'mpesa_b2c', 'send_money', true);
  const downloadPaybillTemplate = () => downloadBatchPaymentCSV([], 'paybill_b2b', 'paybill', true);
  const downloadBuyGoodsTemplate = () => downloadBatchPaymentCSV([], 'till_b2b', 'buy_goods', true);

  const getModalTitle = () => `${expense ? 'Edit' : 'Add'} ${expenseGroup}`;
  
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      if (onAddCategory) onAddCategory(newCategory, expenseGroup);
      setFormData({ ...formData, category: newCategory });
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()} size="lg">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Request Type Toggle - Premium Segmented Control */}
        <div className="flex p-1 bg-gray-50 rounded-[1.5rem] border border-gray-100 shadow-inner">
          <button
            type="button"
            onClick={() => setExpenseRequestType('single')}
            className={`flex-1 py-3 px-6 rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              expenseRequestType === 'single' ? 'bg-white text-azure shadow-md' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Single Expense
          </button>
          <button
            type="button"
            onClick={() => setExpenseRequestType('batch')}
            className={`flex-1 py-3 px-6 rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              expenseRequestType === 'batch' ? 'bg-white text-azure shadow-md' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Batch Expense
          </button>
        </div>

        {expenseRequestType === 'single' ? (
          /* Premium Single Expense Form */
          <div className="space-y-6 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Expense Group"
                options={[
                  { value: 'Event Expenses', label: 'Event Expenses' },
                  { value: 'Operational Expense', label: 'Operational Expense' },
                  { value: 'Activation Expense', label: 'Activation Expense' }
                ]}
                value={expenseGroup}
                onChange={e => setExpenseGroup(e.target.value as any)}
                required
              />
              <Select
                label={getEventLabel()}
                options={[
                  { value: '', label: `Select ${getEventLabel()}` },
                  ...filteredEvents.map((e: any) => ({ value: e.id, label: e.name }))
                ]}
                value={formData.event}
                onChange={e => setFormData({ ...formData, event: e.target.value })}
                required
              />
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-dark-gray uppercase tracking-widest mb-2 opacity-70">{getCategoryLabel()}</label>
                <div className="flex gap-2">
                  <Select
                    label=""
                    options={[
                      { value: '', label: 'Select category' },
                      ...getCategories().map((cat: string) => ({ value: cat, label: cat }))
                    ]}
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                  <Button type="button" variant="primary" onClick={() => setShowAddCategory(true)} className="!bg-primary/20 !text-black !shadow-none">
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Input
                label="Amount (KES)"
                type="number"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                required
              />
              <Input
                label="Date & Time"
                type="datetime-local"
                value={formData.date}
                onChange={e => { setFormData({ ...formData, date: e.target.value }); setDateError(''); }}
                required
              />
              <Input
                label="Reference (Optional)"
                value={formData.reference}
                onChange={e => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Receipt/Invoice #"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-dark-gray uppercase tracking-widest mb-2 opacity-70">Description</label>
              <textarea
                className="w-full px-5 py-4 text-sm border border-gray-100 rounded-[1.5rem] bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter detailed reason for this expense"
              />
            </div>
          </div>
        ) : (
          /* Premium Batch Expense Dual-Column Layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full max-h-[70vh]">
            {/* Left Column: Focused Entry Form */}
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-5">
                <h3 className="text-[10px] font-black text-dark-gray uppercase tracking-[0.2em] mb-4 opacity-40">Add Item</h3>
                <Select
                  label="Expense Group"
                  options={[
                    { value: 'Event Expenses', label: 'Event Expenses' },
                    { value: 'Operational Expense', label: 'Operational Expense' },
                    { value: 'Activation Expense', label: 'Activation Expense' }
                  ]}
                  value={expenseGroup}
                  onChange={e => setExpenseGroup(e.target.value as any)}
                  required
                />
                <Select
                  label={getEventLabel()}
                  options={[
                    { value: '', label: `Select ${getEventLabel()}` },
                    ...filteredEvents.map((e: any) => ({ value: e.id, label: e.name }))
                  ]}
                  value={formData.event}
                  onChange={e => setFormData({ ...formData, event: e.target.value })}
                />
                <Select
                  label={getCategoryLabel()}
                  options={[
                    { value: '', label: 'Select category' },
                    ...getCategories().map((cat: string) => ({ value: cat, label: cat }))
                  ]}
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Amount (KES)" type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                  <Input label="Reference" value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} placeholder="Receipt #" />
                </div>
                <textarea
                  className="w-full px-5 py-3 text-sm border border-gray-100 rounded-[1.2rem] bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner"
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notes..."
                />
                <Button type="button" variant="primary" onClick={addExpenseFromMainForm} className="w-full h-14 text-black font-black uppercase tracking-widest !shadow-xl">
                  <PlusIcon className="w-5 h-5 mr-2" /> Add to Batch
                </Button>
              </div>
            </div>

            {/* Right Column: Live Summary */}
            <div className="flex flex-col h-full space-y-4">
              <div className="bg-azure p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-2">Batch Total</p>
                    <p className="text-4xl font-black tracking-tight"><span className="text-primary mr-2">KES</span>{expenses.reduce((s, x) => s + x.amount, 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Items</p>
                    <p className="text-2xl font-black text-primary">{expenses.length}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Items Review</h4>
                  {expenses.length > 0 && (
                    <button type="button" onClick={() => setExpenses([])} className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest">Clear All</button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {expenses.length > 0 ? (
                    expenses.map((exp, idx) => (
                      <div key={idx} className="group p-4 bg-gray-50 hover:bg-white rounded-3xl border border-transparent hover:border-primary/20 hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0">
                            <span className="text-[8px] font-black uppercase tracking-widest text-azure bg-primary/20 px-2 py-1 rounded-lg mb-1 inline-block">{exp.category}</span>
                            <p className="text-lg font-black text-dark-gray">KES {exp.amount.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400 italic truncate">{exp.description || 'No description'}</p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => editExpense(idx)} className="w-8 h-8 flex items-center justify-center bg-azure/5 text-azure rounded-lg hover:bg-azure hover:text-white transition-all"><EditIcon className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => removeExpense(idx)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2Icon className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-300 p-8">
                      <ReceiptIcon className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Add items to start</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Disbursement Section */}
        <div className={`p-6 rounded-[2.5rem] border-2 transition-all duration-500 flex items-center justify-between cursor-pointer ${isBatchDisbursement ? 'bg-primary/5 border-primary/20 shadow-lg' : 'bg-gray-50/50 border-transparent'}`} onClick={() => setIsBatchDisbursement(!isBatchDisbursement)}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isBatchDisbursement ? 'bg-primary text-black' : 'bg-white text-gray-300 shadow-sm'}`}>
              <UsersIcon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-black text-dark-gray uppercase tracking-wider">Multi-Recipient Disbursement</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Automate payouts across multiple recipients for this {expenseRequestType}</p>
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isBatchDisbursement ? 'bg-primary border-primary' : 'border-gray-200'}`}>
            {isBatchDisbursement && <div className="w-2 h-2 bg-black rounded-full" />}
          </div>
        </div>

        {isBatchDisbursement && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-azure uppercase tracking-widest">Disbursement Roster</h4>
              <Button type="button" variant="primary" size="sm" onClick={() => setShowRecipientForm(!showRecipientForm)} className="!shadow-md text-[10px] font-black uppercase tracking-widest">
                {showRecipientForm ? 'Close Form' : 'Add Recipient'}
              </Button>
            </div>

            {showRecipientForm && (
              <div className="p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 shadow-inner grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input label="Recipient Name" value={currentRecipient.recipientName} onChange={e => setCurrentRecipient({...currentRecipient, recipientName: e.target.value})} required />
                <Input label="Amount (KES)" type="number" value={currentRecipient.amount || ''} onChange={e => setCurrentRecipient({...currentRecipient, amount: Number(e.target.value)})} required />
                <Select
                  label="Payment Method"
                  options={[
                    { value: 'sendMoney', label: 'Send Money' },
                    { value: 'paybill', label: 'Paybill' },
                    { value: 'buyGoods', label: 'Buy Goods & Services' }
                  ]}
                  value={currentRecipient.paymentMethod}
                  onChange={e => setCurrentRecipient({...currentRecipient, paymentMethod: e.target.value as any})}
                  required
                />
                {currentRecipient.paymentMethod === 'sendMoney' && (
                  <PhoneInput label="Phone Number" value={currentRecipient.phoneNumber || ''} onChange={val => setCurrentRecipient({...currentRecipient, phoneNumber: val})} required />
                )}
                {currentRecipient.paymentMethod === 'paybill' && (
                  <>
                    <Input label="Paybill" value={currentRecipient.paybillNumber} onChange={e => setCurrentRecipient({...currentRecipient, paybillNumber: e.target.value})} required />
                    <Input label="Account" value={currentRecipient.accountNumber} onChange={e => setCurrentRecipient({...currentRecipient, accountNumber: e.target.value})} required />
                  </>
                )}
                {currentRecipient.paymentMethod === 'buyGoods' && (
                  <Input label="Till" value={currentRecipient.tillNumber} onChange={e => setCurrentRecipient({...currentRecipient, tillNumber: e.target.value})} required />
                )}
                <Input label="Reference" value={currentRecipient.reference} onChange={e => setCurrentRecipient({...currentRecipient, reference: e.target.value})} required />
                <div className="lg:col-span-3 flex justify-end gap-3 mt-4">
                  <Button type="button" variant="primary" className="!bg-white !text-gray-400 hover:!bg-gray-100 !shadow-none" onClick={() => setShowRecipientForm(false)}>Cancel</Button>
                  <Button type="button" variant="primary" onClick={addRecipient} className="font-black uppercase tracking-widest text-[10px] !shadow-lg">Confirm Recipient</Button>
                </div>
              </div>
            )}

            {/* Recipients List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto custom-scrollbar p-1">
              {batchCategories.flatMap((cat, catIdx) => cat.items.map((item, itemIdx) => (
                <div key={`${catIdx}-${itemIdx}`} className="p-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[8px] font-black uppercase tracking-widest text-azure bg-azure/5 px-2 py-1 rounded-lg">{cat.category}</span>
                    <button type="button" onClick={() => removeRecipient(catIdx, itemIdx)} className="text-red-300 hover:text-red-500 transition-colors"><Trash2Icon className="w-4 h-4" /></button>
                  </div>
                  <p className="text-sm font-black text-dark-gray">{item.recipientName}</p>
                  <p className="text-xl font-black text-primary mt-1">KES {item.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">{item.paymentMethod.toUpperCase()} | {item.reference}</p>
                </div>
              )))}
            </div>

            {/* CSV & Templates */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 p-6 bg-white border border-gray-100 rounded-[2rem] flex items-center justify-between shadow-sm">
                <div className="flex gap-2">
                  <button type="button" onClick={downloadSendMoneyTemplate} className="px-4 py-2 bg-gray-50 hover:bg-azure hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Send Money</button>
                  <button type="button" onClick={downloadPaybillTemplate} className="px-4 py-2 bg-gray-50 hover:bg-azure hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Paybill</button>
                  <button type="button" onClick={downloadBuyGoodsTemplate} className="px-4 py-2 bg-gray-50 hover:bg-azure hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Buy Goods</button>
                </div>
              </div>
              <label className="p-6 bg-azure text-white rounded-[2rem] flex items-center justify-center gap-3 cursor-pointer hover:bg-azure/90 shadow-xl group">
                <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
                <UploadIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Upload CSV</span>
              </label>
            </div>
          </div>
        )}

        {/* Common Footer Actions */}
        <div className="space-y-6 pt-8 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gray-50/50 border border-dashed border-gray-200 rounded-[2rem] text-center group cursor-pointer hover:bg-white hover:border-azure transition-all">
              <UploadIcon className="w-8 h-8 text-gray-300 mx-auto mb-2 group-hover:text-azure group-hover:scale-110 transition-all" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Supporting Documents</p>
              <p className="text-[8px] text-gray-400 mt-1">PDF, JPG, PNG (Max 10MB)</p>
            </div>
            
            <div className="space-y-4">
              {currentUser?.role === 'Admin' ? (
                <label className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-[1.5rem] cursor-pointer hover:bg-white transition-all border border-transparent hover:border-gray-100">
                  <input type="checkbox" checked={formData.requestApproval} onChange={e => setFormData({ ...formData, requestApproval: e.target.checked })} className="w-5 h-5 rounded-lg border-gray-200 text-primary focus:ring-primary" />
                  <span className="text-xs font-black text-dark-gray uppercase tracking-widest">Request Approval</span>
                </label>
              ) : (
                <div className="p-4 bg-primary/10 rounded-[1.5rem] border border-primary/20">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Approval Required</p>
                  <p className="text-[10px] text-primary/60 mt-0.5">This request will be sent for review</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="primary" className="!bg-gray-100 !text-gray-400 !shadow-none hover:!bg-gray-200 uppercase tracking-widest text-xs font-black" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="h-16 px-12 text-black font-black uppercase tracking-[0.2em] !shadow-2xl hover:scale-105 active:scale-95 transition-all">
              {expenseRequestType === 'single' ? `Submit ${expenseGroup.split(' ')[0]}` : 'Process Batch Request'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
