import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Client, Event, PaymentTerms, InvoiceLineItem, Invoice, DocumentType, User, Product } from '../../../types';
import { PlusIcon, XIcon } from 'lucide-react';

interface AddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  clients: Client[];
  events: Event[];
  invoices: Invoice[];
  currentUser: User;
  products?: Product[]; // Optional products for selection
}

export function AddInvoiceModal({ isOpen, onClose, onSuccess, clients, events, invoices, currentUser, products = [] }: AddInvoiceModalProps) {
  // Normalize invoices prop to ensure it's an array
  const invoicesArray = Array.isArray(invoices) ? invoices : (invoices as any)?.data || [];

  const [selectedClient, setSelectedClient] = useState('');
  const [linkedEvent, setLinkedEvent] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('Quote');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('Net 30');
  const [customPaymentTerms, setCustomPaymentTerms] = useState('');
  const [taxRate, setTaxRate] = useState(16); // VAT 16%
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Payment is due within the specified period. Late payments may incur additional charges.');

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      id: '1',
      itemName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    },
  ]);

  // Auto-generate invoice number when client or document type changes
  useEffect(() => {
    if (selectedClient) {
      const client = clients.find(c => c.id === selectedClient);
      if (client) {
        // Get document prefix based on type
        const docPrefix = documentType === 'Quote' ? 'QT' : documentType === 'Proforma' ? 'PF' : 'INV';

        // Find all documents of this type for this client
        const clientDocuments = invoicesArray.filter(inv =>
          inv.clientId === selectedClient && inv.documentType === documentType
        );

        // Get the last document number for this client and document type
        const lastDocNumber = clientDocuments.length > 0
          ? Math.max(...clientDocuments.map(inv => {
              // Extract number from document number (e.g., "QT-001" -> 1)
              const match = inv.invoiceNumber.match(/(\d+)$/);
              return match ? parseInt(match[1], 10) : 0;
            }))
          : 0;

        // Generate next document number
        const nextNumber = (lastDocNumber + 1).toString().padStart(3, '0');
        const clientPrefix = client.name.substring(0, 3).toUpperCase();
        setInvoiceNumber(`${clientPrefix}-${docPrefix}-${nextNumber}`);
      }
    } else {
      setInvoiceNumber('');
    }
  }, [selectedClient, documentType, clients, invoicesArray]);

  const addLineItem = () => {
    const newId = Date.now().toString();
    setLineItems([
      ...lineItems,
      {
        id: newId,
        itemName: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.amount = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Handle product selection - auto-fill item details when user selects from datalist
  const handleItemNameChange = (lineItemId: string, value: string) => {
    // Check if the value matches a product name
    const matchedProduct = Array.isArray(products) ? products.find(p => p.name === value && p.isActive) : undefined;

    if (matchedProduct) {
      // Auto-fill all product details
      const productPrice = matchedProduct.unitPrice || matchedProduct.price || 0;
      setLineItems(
        lineItems.map((item) => {
          if (item.id === lineItemId) {
            return {
              ...item,
              itemName: matchedProduct.name,
              description: matchedProduct.description || '',
              unitPrice: productPrice,
              taxRate: matchedProduct.taxRate || taxRate,
              amount: item.quantity * productPrice,
            };
          }
          return item;
        })
      );
    } else {
      // Just update the item name (manual entry)
      updateLineItem(lineItemId, 'itemName', value);
    }
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = discountType === 'percentage' ? (subtotal * discount) / 100 : discount;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const total = taxableAmount + taxAmount;

  // Calculate due date based on payment terms
  const calculateDueDate = () => {
    const issue = new Date(issueDate);
    switch (paymentTerms) {
      case 'Due on Receipt':
        return issueDate;
      case 'Net 7':
        issue.setDate(issue.getDate() + 7);
        return issue.toISOString().split('T')[0];
      case 'Net 15':
        issue.setDate(issue.getDate() + 15);
        return issue.toISOString().split('T')[0];
      case 'Net 30':
        issue.setDate(issue.getDate() + 30);
        return issue.toISOString().split('T')[0];
      case 'Net 45':
        issue.setDate(issue.getDate() + 45);
        return issue.toISOString().split('T')[0];
      case 'Net 60':
        issue.setDate(issue.getDate() + 60);
        return issue.toISOString().split('T')[0];
      default:
        return issueDate;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const client = clients.find((c) => c.id === selectedClient);
    if (!client) {
      alert('Please select a client');
      return;
    }

    if (!invoiceNumber.trim()) {
      alert('Please enter an invoice number');
      return;
    }

    const event = events.find((e) => e.id === linkedEvent);

    // Determine initial status based on user role
    // Staff creates drafts that need admin approval
    // Admin can create approved drafts
    const initialStatus = currentUser.role === 'Staff' ? 'Pending Approval' : 'Draft';

    const invoiceData = {
      invoiceNumber: invoiceNumber.trim(),
      documentType,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      clientAddress: client.address || '',
      issueDate,
      dueDate: calculateDueDate(),
      paymentTerms,
      customPaymentTerms: paymentTerms === 'Custom' ? customPaymentTerms : undefined,
      lineItems: lineItems.map((item) => ({
        ...item,
        taxRate,
        taxAmount: (item.amount * taxRate) / 100,
      })),
      subtotal,
      taxRate,
      taxAmount,
      discount: discountAmount,
      discountType,
      total,
      amountPaid: 0,
      balance: total,
      status: initialStatus as const,
      eventId: event?.id,
      eventName: event?.name,
      payments: [],
      notes,
      terms,
      currency: 'KES',
    };

    try {
      // Await the async onSuccess callback to ensure products are saved
      await onSuccess(invoiceData);
      handleReset();
      onClose();
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert('Failed to create invoice. Please try again.');
    }
  };

  const handleReset = () => {
    setSelectedClient('');
    setLinkedEvent('');
    setDocumentType('Invoice');
    setInvoiceNumber('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setPaymentTerms('Net 30');
    setCustomPaymentTerms('');
    setTaxRate(16);
    setDiscount(0);
    setDiscountType('percentage');
    setNotes('');
    setTerms('Payment is due within the specified period. Late payments may incur additional charges.');
    setLineItems([
      {
        id: '1',
        itemName: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Create ${documentType}`} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Type and Document Number */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Document Type"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            options={[
              { value: 'Quote', label: 'Quote' },
              { value: 'Proforma', label: 'Proforma Invoice' },
              { value: 'Invoice', label: 'Invoice' },
            ]}
            required
          />
          <Input
            label="Number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="e.g., CLI-QT-001"
            required
          />
        </div>

        {/* Client and Event Selection */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Client"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            options={[
              { value: '', label: 'Select a client' },
              ...clients.map((client) => ({
                value: client.id,
                label: `${client.name} - ${client.company}`,
              })),
            ]}
            required
          />
          <Select
            label="Linked Event (Optional)"
            value={linkedEvent}
            onChange={(e) => setLinkedEvent(e.target.value)}
            options={[
              { value: '', label: 'No event' },
              ...events
                .filter(event => {
                  // Exclude archived, cancelled, and past events
                  if (event.status === 'Archived' || event.status === 'Cancelled') return false;

                  // Check if event has ended (past event)
                  const eventEndDate = new Date(event.endDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (eventEndDate < today) return false;

                  return true;
                })
                .map((event) => ({
                  value: event.id,
                  label: event.name,
                })),
            ]}
          />
        </div>

        {/* Date and Payment Terms */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Issue Date"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
          <Select
            label="Payment Terms"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
            options={[
              { value: 'Due on Receipt', label: 'Due on Receipt' },
              { value: 'Net 7', label: 'Net 7 Days' },
              { value: 'Net 15', label: 'Net 15 Days' },
              { value: 'Net 30', label: 'Net 30 Days' },
              { value: 'Net 45', label: 'Net 45 Days' },
              { value: 'Net 60', label: 'Net 60 Days' },
              { value: 'Custom', label: 'Custom Terms' },
            ]}
            required
          />
        </div>

        {paymentTerms === 'Custom' && (
          <Input
            label="Custom Payment Terms"
            value={customPaymentTerms}
            onChange={(e) => setCustomPaymentTerms(e.target.value)}
            placeholder="e.g., 50% upfront, 50% on delivery"
            required
          />
        )}

        {/* Line Items */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-gray">Line Items</h3>
            <Button type="button" variant="secondary" size="sm" onClick={addLineItem}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={item.id} className="space-y-2">
                <div className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-3">
                    {index === 0 && (
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item/Product Name
                        {products && products.length > 0 && (
                          <span className="text-xs text-gray-500 ml-1">(type or select)</span>
                        )}
                      </label>
                    )}
                    <input
                      type="text"
                      list={`products-${item.id}`}
                      value={item.itemName}
                      onChange={(e) => handleItemNameChange(item.id, e.target.value)}
                      placeholder="Type or select product"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure"
                      required
                    />
                    {products && products.length > 0 && (
                      <datalist id={`products-${item.id}`}>
                        {products.filter(p => p.isActive).map((product) => (
                          <option key={product.id} value={product.name}>
                            {product.category} - KES {(product.unitPrice || product.price || 0).toLocaleString()}
                          </option>
                        ))}
                      </datalist>
                    )}
                  </div>
                  <div className="col-span-3">
                    {index === 0 && (
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    )}
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Additional details"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure"
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && (
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
                    )}
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && (
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                    )}
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    {index === 0 && (
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    )}
                    <input
                      type="text"
                      value={item.amount.toLocaleString()}
                      readOnly
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                    />
                  </div>
                  <div className="col-span-1">
                    {index === 0 && <div className="h-6"></div>}
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length === 1}
                    >
                      <XIcon className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tax and Discount */}
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Tax Rate (%)"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="0.01"
            />
            <Input
              label={`Discount ${discountType === 'percentage' ? '(%)' : '(KES)'}`}
              type="number"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
            />
            <Select
              label="Discount Type"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
              options={[
                { value: 'percentage', label: 'Percentage' },
                { value: 'fixed', label: 'Fixed Amount' },
              ]}
            />
          </div>
        </div>

        {/* Totals Summary */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">KES {subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-green-600">- KES {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({taxRate}%):</span>
              <span className="font-medium">KES {taxAmount.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 flex justify-between">
              <span className="font-semibold text-dark-gray">Total:</span>
              <span className="font-bold text-xl text-azure">KES {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Notes and Terms */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure"
              placeholder="Additional notes for the client..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Invoice</Button>
        </div>
      </form>
    </Modal>
  );
}
