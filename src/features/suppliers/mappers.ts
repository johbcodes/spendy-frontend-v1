import { Supplier } from './types';

export function mapSupplierToExportData(supplier: Supplier) {
  return {
    'Name': supplier.name,
    'Category': supplier.category,
    'Contact Person': supplier.contactPerson,
    'Phone': supplier.phone,
    'Email': supplier.email,
    'Status': supplier.status,
    'Payment Method': supplier.paymentMethod || 'Not Set',
    'Business Type': supplier.businessType || 'N/A',
    'KRA PIN': supplier.kraPin || 'N/A'
  };
}

export function mapSuppliersToExportData(suppliers: Supplier[]) {
  return suppliers.map(mapSupplierToExportData);
}

export function mapSupplierToFormData(supplier: Supplier) {
  return {
    name: supplier.name,
    category: supplier.category,
    contactPerson: supplier.contactPerson,
    phone: supplier.phone,
    email: supplier.email,
    status: supplier.status,
    businessType: supplier.businessType,
    kraPin: supplier.kraPin,
    mpesaPhone: supplier.mpesaPhone,
    paybillNumber: supplier.paybillNumber,
    paybillAccount: supplier.paybillAccount,
    tillNumber: supplier.tillNumber,
    bankName: supplier.bankName,
    accountName: supplier.accountName,
    accountNumber: supplier.accountNumber,
    branchName: supplier.branchName,
    swiftCode: supplier.swiftCode,
    paymentMethod: supplier.paymentMethod,
    approvalRequired: supplier.approvalRequired
  };
}
