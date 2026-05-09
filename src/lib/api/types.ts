import type { CategoryType, EventType, UserModule, UserRole } from '../../types';

export interface AuthUserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string;
  companyName?: string;
  phone?: string;
  country?: string;
  status?: 'Active' | 'Inactive';
  modulesAssigned?: UserModule[];
  autoApprovalThreshold?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
}

export interface AuthResponseDTO {
  user: AuthUserDTO;
  token?: string;
  accessToken?: string;
  refreshToken: string;
}

export interface WalletDTO {
  id: string;
  name: string;
  type: 'Main' | 'Events' | 'Operations' | 'Activation' | 'Personal' | string;
  balance: number;
  currency?: string;
  status: string;
  companyId: string;
  ownerId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EventDTO {
  id: string;
  name: string;
  type: EventType;
  category?: string;
  client?: string;
  brand?: string;
  projectLead?: string;
  budget: number;
  spent?: number;
  startDate: string;
  endDate?: string;
  status: string;
  location?: string;
  companyId: string;
  createdById?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ExpenseDTO {
  id: string;
  title: string;
  amount: number;
  approvedAmount?: number;
  category?: string;
  eventId?: string;
  supplierId?: string;
  supplier?: string;
  description?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  createdById: string;
  sourceWalletId?: string;
  batchPaymentDetails?: unknown[];
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  description?: string;
  type?: CategoryType;
  status?: string;
  companyId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ListParams {
  limit?: number;
  offset?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: string | number | boolean | undefined;
}
