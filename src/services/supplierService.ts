/**
 * Supplier Service
 * Handles all supplier-related data operations using backend API
 */

import { supplierAPI, Supplier as BackendSupplier } from './backendAPI';

// Supplier interface matching the app's needs
export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  category?: string;
  contactPerson?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  servicesProvided?: string;
  amount?: number;
  event?: string;
  approvalRequired?: boolean;
  mpesaPhone?: string;
  paybillNumber?: string;
  paybillAccount?: string;
  tillNumber?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  branchName?: string;
  swiftCode?: string;
  businessType?: string;
  kraPin?: string;
  documents?: any[];
  createdAt: string;
  updatedAt: string;
  companyId?: string;
}

class SupplierService {
  /**
   * Convert backend supplier to app supplier format
   */
  private convertToAppSupplier(backendSupplier: BackendSupplier): Supplier {
    return {
      id: backendSupplier.id,
      name: backendSupplier.name,
      email: backendSupplier.email,
      phone: backendSupplier.phone,
      address: backendSupplier.address,
      status: backendSupplier.status,
      category: backendSupplier.category,
      contactPerson: backendSupplier.contactPerson,
      paymentStatus: backendSupplier.paymentStatus,
      paymentMethod: backendSupplier.paymentMethod,
      servicesProvided: backendSupplier.servicesProvided,
      amount: backendSupplier.amount,
      event: backendSupplier.event,
      approvalRequired: backendSupplier.approvalRequired,
      mpesaPhone: backendSupplier.mpesaPhone,
      paybillNumber: backendSupplier.paybillNumber,
      paybillAccount: backendSupplier.paybillAccount,
      tillNumber: backendSupplier.tillNumber,
      bankName: backendSupplier.bankName,
      accountName: backendSupplier.accountName,
      accountNumber: backendSupplier.accountNumber,
      branchName: backendSupplier.branchName,
      swiftCode: backendSupplier.swiftCode,
      businessType: backendSupplier.businessType,
      kraPin: backendSupplier.kraPin,
      documents: backendSupplier.documents,
      createdAt: backendSupplier.createdAt,
      updatedAt: backendSupplier.updatedAt
    };
  }

  /**
   * Get all suppliers from backend
   */
  async getAllSuppliers(): Promise<Supplier[]> {
    try {
      const response = await supplierAPI.getAll();
      return response.data.map(s => this.convertToAppSupplier(s));
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      return [];
    }
  }

  /**
   * Get supplier by ID
   */
  async getSupplierById(supplierId: string): Promise<Supplier | undefined> {
    try {
      const response = await supplierAPI.getById(supplierId);
      return this.convertToAppSupplier(response.data);
    } catch (error) {
      console.error('Failed to fetch supplier:', error);
      return undefined;
    }
  }

  /**
   * Create a new supplier
   */
  async createSupplier(supplier: Partial<Supplier>): Promise<Supplier> {
    try {
      const response = await supplierAPI.create({
        name: supplier.name!,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        category: supplier.category,
        contactPerson: supplier.contactPerson,
        paymentStatus: supplier.paymentStatus,
        paymentMethod: supplier.paymentMethod,
        servicesProvided: supplier.servicesProvided,
        amount: supplier.amount,
        event: supplier.event,
        approvalRequired: supplier.approvalRequired,
        mpesaPhone: supplier.mpesaPhone,
        paybillNumber: supplier.paybillNumber,
        paybillAccount: supplier.paybillAccount,
        tillNumber: supplier.tillNumber,
        bankName: supplier.bankName,
        accountName: supplier.accountName,
        accountNumber: supplier.accountNumber,
        branchName: supplier.branchName,
        swiftCode: supplier.swiftCode,
        businessType: supplier.businessType,
        kraPin: supplier.kraPin,
        documents: supplier.documents
      });
      return this.convertToAppSupplier(response.data);
    } catch (error) {
      console.error('Failed to create supplier:', error);
      throw error;
    }
  }

  /**
   * Update a supplier
   */
  async updateSupplier(supplierId: string, updates: Partial<Supplier>): Promise<Supplier | null> {
    try {
      const response = await supplierAPI.update(supplierId, {
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        address: updates.address,
        status: updates.status,
        category: updates.category,
        contactPerson: updates.contactPerson,
        paymentStatus: updates.paymentStatus,
        paymentMethod: updates.paymentMethod,
        servicesProvided: updates.servicesProvided,
        amount: updates.amount,
        event: updates.event,
        approvalRequired: updates.approvalRequired,
        mpesaPhone: updates.mpesaPhone,
        paybillNumber: updates.paybillNumber,
        paybillAccount: updates.paybillAccount,
        tillNumber: updates.tillNumber,
        bankName: updates.bankName,
        accountName: updates.accountName,
        accountNumber: updates.accountNumber,
        branchName: updates.branchName,
        swiftCode: updates.swiftCode,
        businessType: updates.businessType,
        kraPin: updates.kraPin,
        documents: updates.documents
      });
      return this.convertToAppSupplier(response.data);
    } catch (error) {
      console.error('Failed to update supplier:', error);
      return null;
    }
  }

  /**
   * Delete a supplier
   */
  async deleteSupplier(supplierId: string): Promise<boolean> {
    try {
      await supplierAPI.delete(supplierId);
      return true;
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      return false;
    }
  }

  /**
   * Get active suppliers
   */
  async getActiveSuppliers(): Promise<Supplier[]> {
    const suppliers = await this.getAllSuppliers();
    return suppliers.filter(supplier => supplier.status === 'Active');
  }

  /**
   * Find supplier by name
   */
  async findSupplierByName(name: string): Promise<Supplier | undefined> {
    const suppliers = await this.getAllSuppliers();
    return suppliers.find(supplier =>
      supplier.name.toLowerCase() === name.toLowerCase()
    );
  }
}

export const supplierService = new SupplierService();
