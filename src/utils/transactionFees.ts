/**
 * Transaction Fee Calculation Utilities
 *
 * Fees only apply to payments going outside the Spendy system
 * Internal wallet transfers have NO fees
 */

// M-Pesa transaction fee structure (example rates - adjust as needed)
const MPESA_FEE_STRUCTURE = [
  { min: 1, max: 100, fee: 0 },
  { min: 101, max: 500, fee: 7 },
  { min: 501, max: 1000, fee: 13 },
  { min: 1001, max: 1500, fee: 23 },
  { min: 1501, max: 2500, fee: 33 },
  { min: 2501, max: 3500, fee: 53 },
  { min: 3501, max: 5000, fee: 57 },
  { min: 5001, max: 7500, fee: 78 },
  { min: 7501, max: 10000, fee: 90 },
  { min: 10001, max: 15000, fee: 100 },
  { min: 15001, max: 20000, fee: 105 },
  { min: 20001, max: 35000, fee: 108 },
  { min: 35001, max: 50000, fee: 110 },
  { min: 50001, max: 150000, fee: 115 },
  { min: 150001, max: Infinity, fee: 115 } // Max fee cap
];

/**
 * Calculate M-Pesa transaction fee based on amount
 * @param amount - Transaction amount
 * @returns Transaction fee
 */
export function calculateMpesaFee(amount: number): number {
  const bracket = MPESA_FEE_STRUCTURE.find(
    b => amount >= b.min && amount <= b.max
  );
  return bracket ? bracket.fee : 0;
}

/**
 * Determine if a payment is external (goes outside Spendy system)
 * @param paymentType - Type of payment ('M-Pesa' or 'Wallet Transfer')
 * @returns true if payment is external, false if internal
 */
export function isExternalPayment(paymentType: 'M-Pesa' | 'Wallet Transfer'): boolean {
  return paymentType === 'M-Pesa';
}

/**
 * Calculate total transaction fee for a payment
 * @param amount - Payment amount
 * @param paymentType - Type of payment
 * @returns Transaction fee (0 for internal transfers, calculated fee for external)
 */
export function calculateTransactionFee(
  amount: number,
  paymentType: 'M-Pesa' | 'Wallet Transfer'
): number {
  // No fee for internal wallet transfers
  if (!isExternalPayment(paymentType)) {
    return 0;
  }

  // Calculate fee for external payments
  return calculateMpesaFee(amount);
}

/**
 * Calculate total amount including transaction fee
 * @param amount - Base payment amount
 * @param paymentType - Type of payment
 * @returns Total amount (amount + fee)
 */
export function calculateTotalWithFee(
  amount: number,
  paymentType: 'M-Pesa' | 'Wallet Transfer'
): { amount: number; fee: number; total: number; isExternal: boolean } {
  const isExternal = isExternalPayment(paymentType);
  const fee = calculateTransactionFee(amount, paymentType);
  const total = amount + fee;

  return {
    amount,
    fee,
    total,
    isExternal
  };
}

/**
 * Get fee breakdown description
 * @param amount - Payment amount
 * @param paymentType - Type of payment
 * @returns Human-readable fee description
 */
export function getFeeDescription(
  amount: number,
  paymentType: 'M-Pesa' | 'Wallet Transfer'
): string {
  const { fee, isExternal } = calculateTotalWithFee(amount, paymentType);

  if (!isExternal) {
    return 'No transaction fee (internal transfer)';
  }

  return `M-Pesa transaction fee: KES ${fee.toLocaleString()}`;
}
