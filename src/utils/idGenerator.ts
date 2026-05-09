/**
 * Generates a unique UUID v4-style identifier
 * Used for creating unique event IDs, expense IDs, payment IDs, etc.
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates a unique ID with timestamp prefix for easier debugging
 * Format: timestamp-uuid
 */
export function generateTimeStampedID(): string {
  const timestamp = Date.now().toString(36);
  const random = generateUUID().replace(/-/g, '').substring(0, 8);
  return `${timestamp}-${random}`;
}

/**
 * Generates a short unique ID (8 characters)
 * Useful for display purposes
 */
export function generateShortID(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Generates a unique 6-digit account number for Spendy accounts
 * Ensures the number doesn't start with 0
 */
export function generateSpendyAccountNumber(): string {
  // Generate a number between 100000 and 999999
  const accountNumber = Math.floor(100000 + Math.random() * 900000);
  return accountNumber.toString();
}

/**
 * Validates a Spendy account number (must be 6 digits)
 */
export function isValidSpendyAccountNumber(accountNumber: string): boolean {
  return /^\d{6}$/.test(accountNumber);
}
