import { Request, Expense } from '../types';

/**
 * Request Type Handler
 *
 * This utility handles the categorization and processing of expense requests
 * as either single expense requests or batch expense requests.
 */
export class RequestTypeHandler {
  /**
   * Categorize an expense request based on its type and content
   */
  static categorizeExpenseRequest(expense: Expense | Request): 'single' | 'batch' {
    // Check if this is explicitly marked as a batch expense
    if (expense.expenseRequestType === 'batch') {
      return 'batch';
    }

    // Check if this is explicitly marked as a bulk payment
    if (expense.paymentRequestType === 'bulk') {
      return 'batch';
    }

    // Check if it has batch payment details
    if (expense.batchPaymentDetails && Array.isArray(expense.batchPaymentDetails) && expense.batchPaymentDetails.length > 0) {
      return 'batch';
    }

    // Check if it has batch categories (only available on Expense)
    if ('batchCategories' in expense && expense.batchCategories && Array.isArray(expense.batchCategories) && expense.batchCategories.length > 0) {
      return 'batch';
    }

    // Check if it has CSV data (batch upload) (only available on Expense)
    if ('csvData' in expense && expense.csvData && Array.isArray(expense.csvData) && expense.csvData.length > 0) {
      return 'batch';
    }

    // Check if it has multiple expenses (quick add) (only available on Expense)
    if ('expenses' in expense && expense.expenses && Array.isArray(expense.expenses) && expense.expenses.length > 0) {
      return 'batch';
    }

    // Check if the name indicates it's a batch expense
    if ('name' in expense && expense.name && expense.name.toLowerCase().includes('(batch expense)')) {
      return 'batch';
    }

    // Default to single expense
    return 'single';
  }

  /**
   * Create a request object from an expense, ensuring proper categorization
   */
  static createRequestFromExpense(expense: Expense, requestedBy: string): Request {
    const requestType = this.categorizeExpenseRequest(expense);

    // Base request data
    const baseRequest: Request = {
      id: expense.id || `req-${Date.now()}`,
      type: expense.expenseContextType || 'Project',
      name: expense.title || `${expense.eventName || 'Expense'} - ${expense.category}`,
      category: expense.category,
      amount: expense.amount,
      description: expense.description || '',
      requestedBy: requestedBy,
      dateRequested: expense.startDate || new Date().toISOString(),
      status: expense.approvalRequired ? 'Pending' : 'Approved',
      expenseId: expense.id,
      supplier: expense.supplier,
      supplierCategory: expense.supplierCategory,
      expenseRequestType: requestType,
      paymentRequestType: requestType === 'batch' ? 'bulk' : 'single'
    };

    // Add batch-specific fields if this is a batch request
    if (requestType === 'batch') {
      baseRequest.totalAmount = expense.totalAmount;
      baseRequest.batchPaymentDetails = expense.batchPaymentDetails;

      // Ensure the name indicates it's a batch expense
      if (!baseRequest.name.toLowerCase().includes('(batch expense)')) {
        baseRequest.name = `${baseRequest.name} (Batch Expense)`;
      }
    }

    return baseRequest;
  }

  /**
   * Prepare batch expense data for approval processing
   */
  static prepareBatchExpenseForApproval(expense: Expense): {
    request: Request;
    batchData: {
      totalAmount: number;
      recipientCount: number;
      recipients: Array<{
        name: string;
        amount: number;
        paymentMethod: string;
        reference: string;
        idNumber?: string;
      }>;
      categories: Array<{
        name: string;
        itemCount: number;
        totalAmount: number;
      }>;
    };
  } {
    const requestType = this.categorizeExpenseRequest(expense);

    if (requestType !== 'batch') {
      throw new Error('Cannot prepare non-batch expense for batch approval');
    }

    // Create the request
    const request = this.createRequestFromExpense(expense, expense.createdBy || 'System');

    // Prepare batch data for approval processing
    const batchData = {
      totalAmount: expense.totalAmount || 0,
      recipientCount: 0,
      recipients: [] as Array<{
        name: string;
        amount: number;
        paymentMethod: string;
        reference: string;
        idNumber?: string;
      }>,
      categories: [] as Array<{
        name: string;
        itemCount: number;
        totalAmount: number;
      }>
    };

    // Collect recipients from batch categories
    if (expense.batchCategories) {
      expense.batchCategories.forEach(category => {
        batchData.recipientCount += category.items.length;

        category.items.forEach(item => {
          batchData.recipients.push({
            name: item.recipientName,
            amount: item.amount,
            paymentMethod: item.paymentMethod,
            reference: item.reference,
            idNumber: item.idNumber
          });
        });

        // Add category summary
        batchData.categories.push({
          name: category.category,
          itemCount: category.items.length,
          totalAmount: category.items.reduce((sum, item) => sum + item.amount, 0)
        });
      });
    }

    // Collect recipients from expenses array
    if (expense.expenses) {
      batchData.recipientCount += expense.expenses.length;

      expense.expenses.forEach(exp => {
        batchData.recipients.push({
          name: exp.recipientName,
          amount: exp.amount,
          paymentMethod: exp.paymentMethod,
          reference: exp.reference,
          idNumber: exp.idNumber
        });
      });

      // Add categories from expenses
      const expenseCategories = new Map<string, { itemCount: number; totalAmount: number }>();

      expense.expenses.forEach(exp => {
        if (!expenseCategories.has(exp.category)) {
          expenseCategories.set(exp.category, { itemCount: 0, totalAmount: 0 });
        }
        const categoryData = expenseCategories.get(exp.category)!;
        categoryData.itemCount++;
        categoryData.totalAmount += exp.amount;
      });

      expenseCategories.forEach((data, categoryName) => {
        batchData.categories.push({
          name: categoryName,
          itemCount: data.itemCount,
          totalAmount: data.totalAmount
        });
      });
    }

    // Collect recipients from CSV data
    if (expense.csvData) {
      batchData.recipientCount += expense.csvData.length;

      expense.csvData.forEach(csvItem => {
        batchData.recipients.push({
          name: csvItem.recipientName,
          amount: csvItem.amount,
          paymentMethod: csvItem.paymentMethod,
          reference: csvItem.reference,
          idNumber: csvItem.idNumber || ''
        });
      });

      // Add categories from CSV data
      const csvCategories = new Map<string, { itemCount: number; totalAmount: number }>();

      expense.csvData.forEach(csvItem => {
        if (!csvCategories.has(csvItem.category)) {
          csvCategories.set(csvItem.category, { itemCount: 0, totalAmount: 0 });
        }
        const categoryData = csvCategories.get(csvItem.category)!;
        categoryData.itemCount++;
        categoryData.totalAmount += csvItem.amount;
      });

      csvCategories.forEach((data, categoryName) => {
        batchData.categories.push({
          name: categoryName,
          itemCount: data.itemCount,
          totalAmount: data.totalAmount
        });
      });
    }

    // Calculate total amount from all sources if not already set
    if (!batchData.totalAmount || batchData.totalAmount === 0) {
      batchData.totalAmount = batchData.recipients.reduce((sum, recipient) => sum + recipient.amount, 0);
    }

    return {
      request,
      batchData
    };
  }

  /**
   * Prepare batch payment data for processing
   */
  static prepareBatchPaymentData(expense: Expense): {
    batchPaymentDetails: Array<{
      name: string;
      idNumber: string;
      phone?: string;
      paybillNumber?: string;
      accountNumber?: string;
      tillNumber?: string;
      amount: number;
      reference: string;
      paymentMethod: 'mpesa' | 'paybill' | 'till';
    }>;
    paymentMethodSummary: {
      mpesa: { count: number; totalAmount: number };
      paybill: { count: number; totalAmount: number };
      till: { count: number; totalAmount: number };
    };
  } {
    const paymentMethodSummary = {
      mpesa: { count: 0, totalAmount: 0 },
      paybill: { count: 0, totalAmount: 0 },
      till: { count: 0, totalAmount: 0 }
    };

    const batchPaymentDetails: Array<{
      name: string;
      idNumber: string;
      phone?: string;
      paybillNumber?: string;
      accountNumber?: string;
      tillNumber?: string;
      amount: number;
      reference: string;
      paymentMethod: 'mpesa' | 'paybill' | 'till';
    }> = [];

    // Process batch categories
    if (expense.batchCategories) {
      expense.batchCategories.forEach(category => {
        category.items.forEach(item => {
          const paymentDetail = this.createPaymentDetailFromBatchItem(item);
          batchPaymentDetails.push(paymentDetail);

          // Update payment method summary
          if (paymentDetail.paymentMethod === 'mpesa') {
            paymentMethodSummary.mpesa.count++;
            paymentMethodSummary.mpesa.totalAmount += paymentDetail.amount;
          } else if (paymentDetail.paymentMethod === 'paybill') {
            paymentMethodSummary.paybill.count++;
            paymentMethodSummary.paybill.totalAmount += paymentDetail.amount;
          } else if (paymentDetail.paymentMethod === 'till') {
            paymentMethodSummary.till.count++;
            paymentMethodSummary.till.totalAmount += paymentDetail.amount;
          }
        });
      });
    }

    // Process expenses array
    if (expense.expenses) {
      expense.expenses.forEach(exp => {
        const paymentDetail = this.createPaymentDetailFromExpense(exp);
        batchPaymentDetails.push(paymentDetail);

        // Update payment method summary
        if (paymentDetail.paymentMethod === 'mpesa') {
          paymentMethodSummary.mpesa.count++;
          paymentMethodSummary.mpesa.totalAmount += paymentDetail.amount;
        } else if (paymentDetail.paymentMethod === 'paybill') {
          paymentMethodSummary.paybill.count++;
          paymentMethodSummary.paybill.totalAmount += paymentDetail.amount;
        } else if (paymentDetail.paymentMethod === 'till') {
          paymentMethodSummary.till.count++;
          paymentMethodSummary.till.totalAmount += paymentDetail.amount;
        }
      });
    }

    // Process CSV data
    if (expense.csvData) {
      expense.csvData.forEach(csvItem => {
        const paymentDetail = this.createPaymentDetailFromCsvItem(csvItem);
        batchPaymentDetails.push(paymentDetail);

        // Update payment method summary
        if (paymentDetail.paymentMethod === 'mpesa') {
          paymentMethodSummary.mpesa.count++;
          paymentMethodSummary.mpesa.totalAmount += paymentDetail.amount;
        } else if (paymentDetail.paymentMethod === 'paybill') {
          paymentMethodSummary.paybill.count++;
          paymentMethodSummary.paybill.totalAmount += paymentDetail.amount;
        } else if (paymentDetail.paymentMethod === 'till') {
          paymentMethodSummary.till.count++;
          paymentMethodSummary.till.totalAmount += paymentDetail.amount;
        }
      });
    }

    return {
      batchPaymentDetails,
      paymentMethodSummary
    };
  }

  /**
   * Create payment detail from batch category item
   */
  private static createPaymentDetailFromBatchItem(item: {
    recipientName: string;
    amount: number;
    paymentMethod: 'sendMoney' | 'paybill' | 'buyGoods';
    phoneNumber?: string;
    paybillNumber?: string;
    accountNumber?: string;
    tillNumber?: string;
    reference: string;
    idNumber?: string;
  }): {
    name: string;
    idNumber: string;
    phone?: string;
    paybillNumber?: string;
    accountNumber?: string;
    tillNumber?: string;
    amount: number;
    reference: string;
    paymentMethod: 'mpesa' | 'paybill' | 'till';
  } {
    // Map payment methods
    const paymentMethod = item.paymentMethod === 'sendMoney' ? 'mpesa' :
                         item.paymentMethod === 'paybill' ? 'paybill' : 'till';

    return {
      name: item.recipientName,
      idNumber: item.idNumber || '',
      phone: item.paymentMethod === 'sendMoney' ? item.phoneNumber : undefined,
      paybillNumber: item.paymentMethod === 'paybill' ? item.paybillNumber : undefined,
      accountNumber: item.paymentMethod === 'paybill' ? item.accountNumber : undefined,
      tillNumber: item.paymentMethod === 'buyGoods' ? item.tillNumber : undefined,
      amount: item.amount,
      reference: item.reference,
      paymentMethod: paymentMethod
    };
  }

  /**
   * Create payment detail from expense item
   */
  private static createPaymentDetailFromExpense(exp: {
    recipientName: string;
    amount: number;
    paymentMethod: 'sendMoney' | 'paybill' | 'buyGoods';
    phoneNumber?: string;
    paybillNumber?: string;
    accountNumber?: string;
    tillNumber?: string;
    reference: string;
    idNumber?: string;
  }): {
    name: string;
    idNumber: string;
    phone?: string;
    paybillNumber?: string;
    accountNumber?: string;
    tillNumber?: string;
    amount: number;
    reference: string;
    paymentMethod: 'mpesa' | 'paybill' | 'till';
  } {
    // Map payment methods
    const paymentMethod = exp.paymentMethod === 'sendMoney' ? 'mpesa' :
                         exp.paymentMethod === 'paybill' ? 'paybill' : 'till';

    return {
      name: exp.recipientName,
      idNumber: exp.idNumber || '',
      phone: exp.paymentMethod === 'sendMoney' ? exp.phoneNumber : undefined,
      paybillNumber: exp.paymentMethod === 'paybill' ? exp.paybillNumber : undefined,
      accountNumber: exp.paymentMethod === 'paybill' ? exp.accountNumber : undefined,
      tillNumber: exp.paymentMethod === 'buyGoods' ? exp.tillNumber : undefined,
      amount: exp.amount,
      reference: exp.reference,
      paymentMethod: paymentMethod
    };
  }

  /**
   * Create payment detail from CSV item
   */
  private static createPaymentDetailFromCsvItem(csvItem: {
    recipientName: string;
    amount: number;
    paymentMethod: string;
    phonePaybillTill: string;
    accountNumber: string;
    reference: string;
    idNumber?: string;
  }): {
    name: string;
    idNumber: string;
    phone?: string;
    paybillNumber?: string;
    accountNumber?: string;
    tillNumber?: string;
    amount: number;
    reference: string;
    paymentMethod: 'mpesa' | 'paybill' | 'till';
  } {
    // Map payment methods from CSV
    const paymentMethod = csvItem.paymentMethod.toLowerCase().includes('mpesa') ? 'mpesa' :
                         csvItem.paymentMethod.toLowerCase().includes('paybill') ? 'paybill' : 'till';

    return {
      name: csvItem.recipientName,
      idNumber: csvItem.idNumber || '',
      phone: paymentMethod === 'mpesa' ? csvItem.phonePaybillTill : undefined,
      paybillNumber: paymentMethod === 'paybill' ? csvItem.phonePaybillTill : undefined,
      accountNumber: csvItem.accountNumber,
      tillNumber: paymentMethod === 'till' ? csvItem.phonePaybillTill : undefined,
      amount: csvItem.amount,
      reference: csvItem.reference,
      paymentMethod: paymentMethod
    };
  }

  /**
   * Ensure batch expense data is properly structured for saving
   */
  static ensureBatchExpenseStructure(expense: Expense): Expense {
    const requestType = this.categorizeExpenseRequest(expense);

    if (requestType !== 'batch') {
      return expense;
    }

    // Ensure all required batch fields are present
    const batchExpense: Expense = {
      ...expense,
      expenseRequestType: 'batch',
      paymentRequestType: 'bulk',
      isCompleteBatchExpense: true
    };

    // Ensure total amount is calculated
    if (!batchExpense.totalAmount) {
      let total = 0;

      // Calculate from batch categories
      if (batchExpense.batchCategories) {
        batchExpense.batchCategories.forEach(category => {
          category.items.forEach(item => {
            total += item.amount;
          });
        });
      }

      // Calculate from expenses array
      if (batchExpense.expenses) {
        batchExpense.expenses.forEach(exp => {
          total += exp.amount;
        });
      }

      // Calculate from CSV data
      if (batchExpense.csvData) {
        batchExpense.csvData.forEach(csvItem => {
          total += csvItem.amount;
        });
      }

      batchExpense.totalAmount = total;
    }

    // Ensure batch payment details are generated
    if (!batchExpense.batchPaymentDetails || batchExpense.batchPaymentDetails.length === 0) {
      const { batchPaymentDetails } = this.prepareBatchPaymentData(batchExpense);
      batchExpense.batchPaymentDetails = batchPaymentDetails;
    }

    return batchExpense;
  }
}
