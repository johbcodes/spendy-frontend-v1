/**
 * Services Index
 * Central export point for all services
 */

export { storageService } from './storageService';
export { walletService } from './walletService';
export { eventService } from './eventService';
export { expenseService } from './expenseService';
export { invoiceService } from './invoiceService';
export { productService } from './productService';
export { userService } from './userService';
export { supplierService } from './supplierService';

// Re-export types for convenience
export type { StorageKey } from './storageService';
export type { Supplier } from './supplierService';
