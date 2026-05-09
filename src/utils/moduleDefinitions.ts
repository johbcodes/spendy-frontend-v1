import { UserModule } from '../types';

/**
 * Comprehensive Module Definition System
 *
 * This system defines all modules and their associated components, pages, routes, and APIs.
 * It serves as the authoritative source for module-based access control.
 */

/**
 * Module Definition Interface
 */
interface ModuleDefinition {
  id: UserModule;
  name: string;
  description: string;
  pages: string[];
  components: string[];
  apiEndpoints: string[];
  rolesWithAccess: ('Admin' | 'Staff' | 'Approver' | 'Store Manager')[];
  defaultAccess: boolean;
}

/**
 * Complete Module Definitions
 */
export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    id: 'Dashboard',
    name: 'Dashboard',
    description: 'Main dashboard with overview and analytics',
    pages: ['dashboard'],
    components: ['dashboard-widgets', 'analytics-overview', 'recent-activity'],
    apiEndpoints: ['get-dashboard-data', 'get-recent-activity', 'get-analytics-summary'],
    rolesWithAccess: ['Admin', 'Store Manager'],
    defaultAccess: false
  },
  {
    id: 'Events',
    name: 'Events',
    description: 'Event management module',
    pages: ['events', 'event-detail', 'edit-event'],
    components: ['event-list', 'event-detail', 'event-form', 'event-calendar'],
    apiEndpoints: [
      'get-events', 'get-event-detail', 'create-event', 'update-event',
      'delete-event', 'get-event-analytics', 'get-event-documents'
    ],
    rolesWithAccess: ['Admin', 'Approver'],
    defaultAccess: false
  },
  {
    id: 'Wallets',
    name: 'Wallets',
    description: 'Financial wallet management',
    pages: ['wallets', 'wallet-detail'],
    components: ['wallet-list', 'wallet-detail', 'wallet-form', 'transaction-history'],
    apiEndpoints: [
      'get-wallets', 'get-wallet-detail', 'create-wallet', 'update-wallet',
      'delete-wallet', 'get-transactions', 'fund-wallet', 'transfer-funds'
    ],
    rolesWithAccess: ['Admin'],
    defaultAccess: false
  },
  {
    id: 'Expenses',
    name: 'Expenses',
    description: 'Expense tracking and management',
    pages: ['expenses', 'expense-detail'],
    components: [
      'expense-list', 'expense-detail', 'expense-form', 'expense-approval',
      'batch-expense-upload', 'expense-categories', 'add-expense', 'view-expense'
    ],
    apiEndpoints: [
      'get-expenses', 'get-expense-detail', 'create-expense', 'update-expense',
      'delete-expense', 'submit-for-approval', 'get-expense-categories',
      'upload-batch-expenses', 'get-expense-analytics'
    ],
    rolesWithAccess: ['Admin', 'Staff', 'Store Manager'],
    defaultAccess: false
  },
  {
    id: 'Payments',
    name: 'Payments',
    description: 'Payment processing and tracking',
    pages: ['payments', 'payment-detail', 'payment-details-readonly'],
    components: [
      'payment-list', 'payment-detail', 'payment-form', 'payment-approval',
      'make-payment', 'payment-history', 'payment-methods', 'view-payment'
    ],
    apiEndpoints: [
      'get-payments', 'get-payment-detail', 'create-payment', 'process-payment',
      'get-payment-methods', 'get-payment-history', 'approve-payment',
      'get-pending-payments', 'get-completed-payments'
    ],
    rolesWithAccess: ['Admin', 'Staff'],
    defaultAccess: false
  },
  {
    id: 'Approvals',
    name: 'Approvals',
    description: 'Approval workflow management',
    pages: ['approvals', 'request-review'],
    components: [
      'approval-list', 'request-detail', 'approve-button', 'reject-button',
      'approval-history', 'pending-approvals', 'approved-requests'
    ],
    apiEndpoints: [
      'get-approvals', 'get-request-detail', 'approve-request', 'reject-request',
      'get-approval-history', 'get-pending-approvals', 'get-approved-requests',
      'undo-rejection', 'edit-request'
    ],
    rolesWithAccess: ['Admin', 'Approver'],
    defaultAccess: false
  },
  {
    id: 'Inventory',
    name: 'Inventory',
    description: 'Inventory management and tracking',
    pages: ['inventory', 'inventory-detail', 'edit-inventory', 'checkout', 'checkin'],
    components: [
      'inventory-list', 'inventory-detail', 'inventory-form', 'check-in-form',
      'check-out-form', 'inventory-movements', 'inventory-categories',
      'inventory-analytics', 'low-stock-alerts', 'add-inventory', 'check-in', 'check-out'
    ],
    apiEndpoints: [
      'get-inventory', 'get-inventory-detail', 'create-inventory', 'update-inventory',
      'delete-inventory', 'check-in', 'check-out', 'get-inventory-movements',
      'get-inventory-categories', 'get-inventory-analytics', 'get-low-stock-items'
    ],
    rolesWithAccess: ['Admin', 'Store Manager'],
    defaultAccess: false
  },
  {
    id: 'Suppliers',
    name: 'Suppliers',
    description: 'Supplier management',
    pages: ['suppliers', 'supplier-detail', 'pay-supplier'],
    components: [
      'supplier-list', 'supplier-detail', 'supplier-form', 'supplier-payment',
      'supplier-categories', 'supplier-analytics'
    ],
    apiEndpoints: [
      'get-suppliers', 'get-supplier-detail', 'create-supplier', 'update-supplier',
      'delete-supplier', 'pay-supplier', 'get-supplier-categories',
      'get-supplier-analytics', 'get-supplier-payment-history'
    ],
    rolesWithAccess: ['Admin'],
    defaultAccess: false
  },
  {
    id: 'Analytics',
    name: 'Analytics',
    description: 'System analytics and reporting',
    pages: ['analytics'],
    components: [
      'analytics-dashboard', 'financial-reports', 'expense-reports',
      'payment-reports', 'inventory-reports', 'event-reports',
      'custom-reports', 'data-export'
    ],
    apiEndpoints: [
      'get-analytics', 'get-financial-reports', 'get-expense-reports',
      'get-payment-reports', 'get-inventory-reports', 'get-event-reports',
      'generate-custom-report', 'export-data'
    ],
    rolesWithAccess: ['Admin'],
    defaultAccess: false
  },
  {
    id: 'Users',
    name: 'Users',
    description: 'User management and administration',
    pages: ['users', 'edit-user'],
    components: [
      'user-list', 'user-detail', 'user-form', 'user-roles',
      'user-permissions', 'user-activity', 'user-audit-log'
    ],
    apiEndpoints: [
      'get-users', 'get-user-detail', 'create-user', 'update-user',
      'delete-user', 'get-user-roles', 'get-user-permissions',
      'get-user-activity', 'get-user-audit-log', 'reset-user-password'
    ],
    rolesWithAccess: ['Admin'],
    defaultAccess: false
  },
  {
    id: 'System Setup',
    name: 'System Setup',
    description: 'System configuration and setup',
    pages: ['system-setup'],
    components: [
      'system-configuration', 'company-settings', 'module-management',
      'role-management', 'permission-management', 'integration-settings',
      'api-settings', 'notification-settings'
    ],
    apiEndpoints: [
      'get-system-config', 'update-system-config', 'get-company-settings',
      'update-company-settings', 'get-module-config', 'update-module-config',
      'get-role-permissions', 'update-role-permissions', 'get-integration-settings',
      'update-integration-settings', 'test-api-connection'
    ],
    rolesWithAccess: ['Admin'],
    defaultAccess: false
  }
];

/**
 * Get all modules that a user role can access by default
 */
export const getDefaultModulesForRole = (role: string): UserModule[] => {
  const modulesForRole = MODULE_DEFINITIONS.filter(module =>
    module.rolesWithAccess.includes(role as any)
  );
  return modulesForRole.map(module => module.id);
};

/**
 * Get all pages for a specific module
 */
export const getPagesForModule = (moduleId: UserModule): string[] => {
  const module = MODULE_DEFINITIONS.find(m => m.id === moduleId);
  return module ? module.pages : [];
};

/**
 * Get all components for a specific module
 */
export const getComponentsForModule = (moduleId: UserModule): string[] => {
  const module = MODULE_DEFINITIONS.find(m => m.id === moduleId);
  return module ? module.components : [];
};

/**
 * Get all API endpoints for a specific module
 */
export const getApiEndpointsForModule = (moduleId: UserModule): string[] => {
  const module = MODULE_DEFINITIONS.find(m => m.id === moduleId);
  return module ? module.apiEndpoints : [];
};

/**
 * Check if a page belongs to a specific module
 */
export const pageBelongsToModule = (page: string, moduleId: UserModule): boolean => {
  const module = MODULE_DEFINITIONS.find(m => m.id === moduleId);
  return module ? module.pages.includes(page) : false;
};

/**
 * Check if a component belongs to a specific module
 */
export const componentBelongsToModule = (componentId: string, moduleId: UserModule): boolean => {
  const module = MODULE_DEFINITIONS.find(m => m.id === moduleId);
  return module ? module.components.includes(componentId) : false;
};

/**
 * Check if an API endpoint belongs to a specific module
 */
export const apiBelongsToModule = (apiEndpoint: string, moduleId: UserModule): boolean => {
  const module = MODULE_DEFINITIONS.find(m => m.id === moduleId);
  return module ? module.apiEndpoints.includes(apiEndpoint) : false;
};

/**
 * Get module ID for a specific page
 */
export const getModuleForPage = (page: string): UserModule | null => {
  const module = MODULE_DEFINITIONS.find(m => m.pages.includes(page));
  return module ? module.id : null;
};

/**
 * Get module ID for a specific component
 */
export const getModuleForComponent = (componentId: string): UserModule | null => {
  const module = MODULE_DEFINITIONS.find(m => m.components.includes(componentId));
  return module ? module.id : null;
};

/**
 * Get module ID for a specific API endpoint
 */
export const getModuleForApi = (apiEndpoint: string): UserModule | null => {
  const module = MODULE_DEFINITIONS.find(m => m.apiEndpoints.includes(apiEndpoint));
  return module ? module.id : null;
};

/**
 * Get all modules with their complete definitions
 */
export const getAllModuleDefinitions = (): ModuleDefinition[] => {
  return MODULE_DEFINITIONS;
};
