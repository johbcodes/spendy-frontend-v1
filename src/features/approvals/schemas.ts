export const approvalSchemas = {
  rejectRequest: {
    reason: {
      required: true,
      minLength: 10,
      message: 'Rejection reason must be at least 10 characters'
    }
  },
  approveRequest: {
    walletId: {
      required: true,
      message: 'Please select a wallet'
    }
  },
  editRequest: {
    name: {
      required: true,
      message: 'Request name is required'
    },
    category: {
      required: true,
      message: 'Category is required'
    },
    amount: {
      required: true,
      min: 0,
      message: 'Amount must be greater than 0'
    }
  }
};

export function validateRejectionReason(reason: string): { valid: boolean; error?: string } {
  if (!reason || reason.trim().length === 0) {
    return { valid: false, error: 'Rejection reason is required' };
  }
  if (reason.trim().length < 10) {
    return { valid: false, error: 'Rejection reason must be at least 10 characters' };
  }
  return { valid: true };
}

export function validateWalletSelection(walletId: string): { valid: boolean; error?: string } {
  if (!walletId || walletId.trim().length === 0) {
    return { valid: false, error: 'Please select a wallet' };
  }
  return { valid: true };
}
