import type { Event, EventType, EventStatus, User, Payment, Expense, Request, Wallet, InventoryItem, Invoice } from '../../types';

export type { Event, EventType, EventStatus, User, Payment, Expense, Request, Wallet, InventoryItem, Invoice };

export interface EventDTO {
  id: string;
  name: string;
  type: string;
  category?: string;
  client?: string;
  brand?: string;
  brands?: string[];
  projectLeadId?: string;
  projectLead?: { id: string; firstName: string; lastName: string; email: string };
  budget: number;
  spent: number;
  startDate: string;
  endDate?: string;
  status: string;
  location?: string;
  documents?: string[];
}

export interface EventPayload {
  name: string;
  type: string;
  category?: string;
  client?: string;
  brand?: string;
  projectLeadId?: string;
  budget?: number;
  spent?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  location?: string;
  documents?: { name: string; url: string }[];
}

export interface EventFilters {
  searchTerm: string;
  status: string;
  type: string;
  client: string;
}

export interface EventSummary {
  total: number;
  active: number;
  totalBudget: number;
  totalSpent: number;
}
