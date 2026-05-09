import { requestsAPI } from '../../services/api';
import type { Request } from './types';

// Pure filter helpers, also used by hooks.
export function filterRequests(
  requests: Request[],
  searchTerm: string,
  statusFilter: string,
): Request[] {
  const normalizedSearch = searchTerm.toLowerCase();

  return requests.filter(request => {
    const matchesSearch =
      request.name.toLowerCase().includes(normalizedSearch) ||
      request.requestedBy.toLowerCase().includes(normalizedSearch) ||
      request.category.toLowerCase().includes(normalizedSearch);
    const matchesStatus =
      statusFilter === 'all' ||
      request.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });
}

export function filterRequestsByType(requests: Request[], type: string): Request[] {
  return requests.filter(r => r.type === type);
}

// State-patch helpers.
interface ApproveRequestPatchOptions {
  category?: string;
  dateProcessed?: string;
  supplierId?: string;
  supplierName?: string;
}

export function approveRequest(
  _requestId: string,
  walletId: string | undefined,
  processedBy: string,
  options: ApproveRequestPatchOptions = {},
): Partial<Request> {
  return {
    status: 'Approved',
    processedBy,
    dateProcessed: options.dateProcessed ?? new Date().toISOString(),
    walletId,
    ...(options.category ? { category: options.category } : {}),
    ...(options.supplierName ? { supplier: options.supplierName } : {}),
    ...(options.supplierId ? { supplierId: options.supplierId, assignedToSupplier: true } : {}),
  } as Partial<Request>;
}

export function rejectRequest(
  _requestId: string,
  reason: string,
  processedBy: string,
  dateProcessed = new Date().toISOString(),
): Partial<Request> {
  return {
    status: 'Rejected',
    rejectionReason: reason,
    processedBy,
    dateProcessed,
  };
}

export function undoRejection(_requestId: string): Partial<Request> {
  return {
    status: 'Pending',
    rejectionReason: undefined,
    processedBy: undefined,
    dateProcessed: undefined,
  };
}

// Remote API.
export const approvalsFeatureApi = {
  list: (): Promise<Request[]> => requestsAPI.getAll(),
  create: (data: Partial<Request>): Promise<Request> => requestsAPI.create(data),
  update: (id: string, data: Partial<Request>): Promise<Request> =>
    requestsAPI.update(id, data),
};
