/**
 * Utility functions for handling batch expense CSV operations
 */

export interface BatchRecipient {
  name: string;
  idNumber: string;
  phone?: string;
  paybillNumber?: string;
  accountNumber?: string;
  tillNumber?: string;
  amount: number;
  reference: string;
  paymentMethod?: 'mpesa_b2c' | 'paybill_b2b' | 'till_b2b';
  category?: string;
}

export type PaymentMethodType = 'mpesa_b2c' | 'paybill_b2b' | 'till_b2b';

/**
 * Convert payment method between different formats
 */
export const convertPaymentMethod = (method: string): PaymentMethodType => {
  switch (method.toLowerCase()) {
    case 'sendmoney':
    case 'mpesa':
    case 'mpesa_b2c':
      return 'mpesa_b2c';
    case 'paybill':
    case 'paybill_b2b':
      return 'paybill_b2b';
    case 'buygoods':
    case 'till':
    case 'till_b2b':
      return 'till_b2b';
    default:
      return 'mpesa_b2c';
  }
};

/**
 * Convert batch recipients to CSV format based on payment method
 * Supports both simple format (for single payment method) and full format (for mixed payment methods)
 */
export const generateBatchPaymentCSV = (
  recipients: BatchRecipient[],
  paymentMethod: PaymentMethodType,
  useFullFormat = false
): string => {
  let csvContent = '';

  if (useFullFormat) {
    // Full format with category and payment method for each recipient
    csvContent = 'Category,Recipient Name,Payment Method,Phone/Paybill/Till,Account Number,Amount,Reference\n';
    csvContent += recipients
      .map(r => {
        let phonePaybillTill = '';
        if (r.paymentMethod === 'mpesa_b2c' || !r.paymentMethod) {
          phonePaybillTill = r.phone || '';
        } else if (r.paymentMethod === 'paybill_b2b') {
          phonePaybillTill = r.paybillNumber || '';
        } else if (r.paymentMethod === 'till_b2b') {
          phonePaybillTill = r.tillNumber || '';
        }

        let paymentMethodLabel = '';
        if (r.paymentMethod === 'mpesa_b2c' || !r.paymentMethod) {
          paymentMethodLabel = 'Send Money';
        } else if (r.paymentMethod === 'paybill_b2b') {
          paymentMethodLabel = 'Paybill';
        } else if (r.paymentMethod === 'till_b2b') {
          paymentMethodLabel = 'Buy Goods & Services';
        }

        return `"${r.category || ''}","${r.name}","${paymentMethodLabel}","${phonePaybillTill}","${r.accountNumber || ''}",${r.amount},"${r.reference || ''}"`;
      })
      .join('\n');
  } else {
    // Simple format based on single payment method
    switch (paymentMethod) {
      case 'mpesa_b2c':
        csvContent = 'Full Names,ID Number,Mpesa Number,Amount,Reference\n';
        csvContent += recipients
          .map(r => `"${r.name}","${r.idNumber}","${r.phone || ''}","${r.amount}","${r.reference || ''}"`)
          .join('\n');
        break;

      case 'paybill_b2b':
        csvContent = 'Full Names,ID Number,Paybill Number,Account Number,Amount,Reference\n';
        csvContent += recipients
          .map(r =>
            `"${r.name}","${r.idNumber}","${r.paybillNumber || ''}","${r.accountNumber || ''}","${r.amount}","${r.reference || ''}"`
          )
          .join('\n');
        break;

      case 'till_b2b':
        csvContent = 'Full Names,ID Number,Till Number,Amount,Reference\n';
        csvContent += recipients
          .map(r => `"${r.name}","${r.idNumber}","${r.tillNumber || ''}","${r.amount}","${r.reference || ''}"`)
          .join('\n');
        break;
    }
  }

  return csvContent;
};

/**
 * Parse CSV file and extract batch recipients based on payment method
 * Supports both simple format (for single payment method) and full format (for mixed payment methods)
 */
export const parseBatchPaymentCSV = (
  csvText: string,
  paymentMethod: PaymentMethodType,
  useFullFormat = false
): BatchRecipient[] => {
  const lines = csvText.split('\n').slice(1).filter(line => line.trim());
  const recipients: BatchRecipient[] = [];

  if (useFullFormat) {
    // Full format: Category,Recipient Name,Payment Method,Phone/Paybill/Till,Account Number,Amount,Reference
    lines.forEach(line => {
      const values = line
        .split(',')
        .map(v => v.trim().replace(/^"|"$/g, ''));

      if (values.length >= 7) {
        const recipient: BatchRecipient = {
          category: values[0] || '',
          name: values[1] || '',
          idNumber: values[6] || '', // Reference field often contains ID-like info
          amount: parseFloat(values[5]) || 0,
          reference: values[6] || '',
          paymentMethod: convertPaymentMethod(values[2] || '')
        };

        // Handle phone/paybill/till and account number based on payment method
        if (recipient.paymentMethod === 'mpesa_b2c') {
          recipient.phone = values[3] || '';
        } else if (recipient.paymentMethod === 'paybill_b2b') {
          recipient.paybillNumber = values[3] || '';
          recipient.accountNumber = values[4] || '';
        } else if (recipient.paymentMethod === 'till_b2b') {
          recipient.tillNumber = values[3] || '';
        }

        recipients.push(recipient);
      }
    });
  } else {
    // Simple format based on single payment method
    lines.forEach(line => {
      const values = line
        .split(',')
        .map(v => v.trim().replace(/^"|"$/g, ''));

      switch (paymentMethod) {
        case 'mpesa_b2c':
          // Full Names, ID Number, Mpesa Number, Amount, Reference
          if (values.length >= 4) {
            recipients.push({
              name: values[0] || '',
              idNumber: values[1] || '',
              phone: values[2] || '',
              amount: parseFloat(values[3]) || 0,
              reference: values[4] || '',
              paymentMethod: 'mpesa_b2c'
            });
          }
          break;

        case 'paybill_b2b':
          // Full Names, ID Number, Paybill Number, Account Number, Amount, Reference
          if (values.length >= 5) {
            recipients.push({
              name: values[0] || '',
              idNumber: values[1] || '',
              paybillNumber: values[2] || '',
              accountNumber: values[3] || '',
              amount: parseFloat(values[4]) || 0,
              reference: values[5] || '',
              paymentMethod: 'paybill_b2b'
            });
          }
          break;

        case 'till_b2b':
          // Full Names, ID Number, Till Number, Amount, Reference
          if (values.length >= 4) {
            recipients.push({
              name: values[0] || '',
              idNumber: values[1] || '',
              tillNumber: values[2] || '',
              amount: parseFloat(values[3]) || 0,
              reference: values[4] || '',
              paymentMethod: 'till_b2b'
            });
          }
          break;
      }
    });
  }

  return recipients;
};

/**
 * Generate a preview of CSV data for display in the UI
 */
export const generateCSVPreview = (csvText: string): { headers: string[], data: string[][] } => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], data: [] };

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data = lines.slice(1).map(line =>
    line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
  );

  return { headers, data };
};

/**
 * Convert expense data to a standardized format for batch processing
 */
export const standardizeBatchExpense = (expense: any): any => {
  // Ensure the expense has all required batch expense fields
  const standardizedExpense = {
    ...expense,
    expenseRequestType: 'batch',
    totalAmount: calculateBatchExpenseTotal(expense),
    recipientCount: calculateBatchExpenseRecipientCount(expense),
    batchCategories: expense.batchCategories || [],
    csvData: expense.csvData || [],
    expenses: expense.expenses || []
  };

  return standardizedExpense;
};

/**
 * Calculate total amount for a batch expense
 */
export const calculateBatchExpenseTotal = (expense: any): number => {
  let total = 0;

  // Calculate from batch categories
  if (expense.batchCategories) {
    expense.batchCategories.forEach((category: any) => {
      category.items.forEach((item: any) => {
        total += item.amount;
      });
    });
  }

  // Calculate from CSV data
  if (expense.csvData) {
    expense.csvData.forEach((item: any) => {
      total += item.amount;
    });
  }

  // Calculate from expenses array
  if (expense.expenses) {
    expense.expenses.forEach((expense: any) => {
      total += expense.amount;
    });
  }

  return total;
};

/**
 * Calculate recipient count for a batch expense
 */
export const calculateBatchExpenseRecipientCount = (expense: any): number => {
  let count = 0;

  // Count from batch categories
  if (expense.batchCategories) {
    expense.batchCategories.forEach((category: any) => {
      count += category.items.length;
    });
  }

  // Count from CSV data
  if (expense.csvData) {
    count += expense.csvData.length;
  }

  // Count from expenses array
  if (expense.expenses) {
    count += expense.expenses.length;
  }

  return count;
};

/**
 * Download batch expense CSV file
 */
export const downloadBatchPaymentCSV = (
  recipients: BatchRecipient[],
  paymentMethod: PaymentMethodType,
  expenseName: string,
  useFullFormat = false
): void => {
  const csvContent = generateBatchPaymentCSV(recipients, paymentMethod, useFullFormat);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const methodName =
    paymentMethod === 'mpesa_b2c' ? 'MPesa_B2C' : paymentMethod === 'paybill_b2b' ? 'Paybill_B2B' : 'Till_B2B';
  const filename = `batch_expense_${methodName}_${expenseName.replace(/\s+/g, '_')}_${Date.now()}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Convert expense data to batch recipients for CSV export
 */
export const convertExpenseToBatchRecipients = (expense: any): BatchRecipient[] => {
  const recipients: BatchRecipient[] = [];

  // Convert from batchCategories
  if (expense.batchCategories) {
    expense.batchCategories.forEach((category: any) => {
      category.items.forEach((item: any) => {
        recipients.push({
          name: item.recipientName,
          idNumber: item.idNumber || '',
          amount: item.amount,
          reference: item.reference,
          paymentMethod: convertPaymentMethod(item.paymentMethod),
          category: category.category,
          phone: item.paymentMethod === 'sendMoney' ? item.phoneNumber : undefined,
          paybillNumber: item.paymentMethod === 'paybill' ? item.paybillNumber : undefined,
          accountNumber: item.paymentMethod === 'paybill' ? item.accountNumber : undefined,
          tillNumber: item.paymentMethod === 'buyGoods' ? item.tillNumber : undefined
        });
      });
    });
  }

  // Convert from csvData
  if (expense.csvData) {
    expense.csvData.forEach((item: any) => {
      recipients.push({
        name: item.recipientName,
        idNumber: '', // csvData doesn't have idNumber field
        amount: item.amount,
        reference: item.reference,
        paymentMethod: convertPaymentMethod(item.paymentMethod),
        category: item.category,
        phone: item.paymentMethod === 'sendMoney' ? item.phonePaybillTill : undefined,
        paybillNumber: item.paymentMethod === 'paybill' ? item.phonePaybillTill : undefined,
        accountNumber: item.accountNumber,
        tillNumber: item.paymentMethod === 'buyGoods' ? item.phonePaybillTill : undefined
      });
    });
  }

  // Convert from expenses array
  if (expense.expenses) {
    expense.expenses.forEach((item: any) => {
      recipients.push({
        name: item.recipientName,
        idNumber: item.idNumber || '',
        amount: item.amount,
        reference: item.reference,
        paymentMethod: convertPaymentMethod(item.paymentMethod),
        category: item.category,
        phone: item.paymentMethod === 'sendMoney' ? item.phoneNumber : undefined,
        paybillNumber: item.paymentMethod === 'paybill' ? item.paybillNumber : undefined,
        accountNumber: item.paymentMethod === 'paybill' ? item.accountNumber : undefined,
        tillNumber: item.paymentMethod === 'buyGoods' ? item.tillNumber : undefined
      });
    });
  }

  return recipients;
};
