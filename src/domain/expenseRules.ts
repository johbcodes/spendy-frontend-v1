import type { UserRole } from '../types';

export interface ApprovalActor {
  id: string;
  role: UserRole;
}

export interface ApprovalSubject {
  createdById: string;
  createdByRole: UserRole;
  amount: number;
}

export function canApproveExpense(actor: ApprovalActor, expense: ApprovalSubject): boolean {
  if (actor.role === 'Admin') return true;
  if (actor.role !== 'Approver') return false;
  if (actor.id === expense.createdById) return false;
  if (expense.createdByRole === 'Approver') return false;
  return true;
}

export function shouldAutoApproveExpense(amount: number, autoApprovalThreshold?: number): boolean {
  if (!Number.isFinite(amount) || amount <= 0) return false;
  if (!Number.isFinite(autoApprovalThreshold) || !autoApprovalThreshold) return false;
  return amount <= autoApprovalThreshold;
}

export function getApprovedAmount(requestedAmount: number, adjustedAmount?: number): number {
  const amount = adjustedAmount ?? requestedAmount;
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Approved amount must be greater than zero');
  }
  return amount;
}

export function creditAmountToCreatorWallet(approvedAmount: number): number {
  return getApprovedAmount(approvedAmount);
}
