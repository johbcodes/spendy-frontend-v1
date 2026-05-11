import { User, UserModule } from '../types';

/**
 * NEW ACCESS CONTROL SYSTEM - MODULE-FIRST ARCHITECTURE
 *
 * CORE PRINCIPLE: Access is controlled by MODULES first, then refined by ROLE and SCOPE.
 * No user should ever see, load, or interact with anything outside their assigned modules.
 *
 * IMPLEMENTATION RULES:
 * 1. Admin has full, unrestricted access to all modules, pages, routes, APIs, and actions
 * 2. All non-Admin users can ONLY access modules explicitly assigned by Admin
 * 3. Access control is enforced at ALL levels: UI, Routing, and API
 * 4. Dashboard widgets and menu visibility are module-driven
 * 5. Every page, component, modal, and API must be bound to a module
 * 6. My Account is always accessible to all authenticated users
 */

// =============================================
// CORE ACCESS CONTROL FUNCTIONS
// =============================================

/**
 * Check if user has access to a specific module
 * This is the PRIMARY gate for all access control
 */
export const hasModuleAccess = (user: User | null, module: UserModule): boolean => {
  if (!user) return false;

  // Admin has access to all modules
  if (user.role === 'Admin' || user.modulesAssigned.includes('All')) {
    return true;
  }

  // Check if user has the specific module assigned
  return user.modulesAssigned.includes(module);
};

/**
 * Check if user has access to a specific page
 * Pages are the primary navigation targets
 */
export const hasPageAccess = (user: User | null, page: string): boolean => {
  if (!user) return false;

  // Admin has access to all pages
  if (user.role === 'Admin' || user.modulesAssigned.includes('All')) {
    return true;
  }

  // Pages that are always accessible to all authenticated users
  const alwaysAccessible = ['my-account', 'notifications', 'dashboard', 'wallet-detail'];
  if (alwaysAccessible.includes(page)) {
    return true;
  }

  // Map pages to required modules - this is the authoritative source
  const pageModuleMap: { [key: string]: UserModule } = {
    'dashboard': 'Dashboard',
    'events': 'Events',
    'event-detail': 'Events',
    'edit-event': 'Events',
    'activations': 'Activations',
    'activation-detail': 'Activations',
    'operations': 'Operations',
    'operation-detail': 'Operations',
    'wallets': 'Wallets',
    'wallet-detail': 'Wallets',
    'expenses': 'Expenses',
    'expense-detail': 'Expenses',
    'payments': 'Payments',
    'payment-detail': 'Payments',
    'payment-details-readonly': 'Payments',
    'approvals': 'Approvals',
    'request-review': 'Approvals',
    'batch-approval-review': 'Approvals',
    'inventory': 'Inventory',
    'inventory-detail': 'Inventory',
    'edit-inventory': 'Inventory',
    'checkout': 'Inventory',
    'checkin': 'Inventory',
    'suppliers': 'Suppliers',
    'supplier-detail': 'Suppliers',
    'pay-supplier': 'Suppliers',
    'analytics': 'Analytics',
    'users': 'Users',
    'edit-user': 'Users',
    'system-setup': 'System Setup',
    'connect-wallet-page': 'Wallets',
    'upload-document-page': 'Events',
    'upload-document-page-activation': 'Activations',
    'upload-document-page-operation': 'Operations'
  };

  // Check module-based access first
  const requiredModule = pageModuleMap[page];
  if (requiredModule) {
    return hasModuleAccess(user, requiredModule);
  }

  // Default deny if page not mapped
  return false;
};

/**
 * Check if user has access to a specific component or UI element
 * Components are UI elements within pages
 */
export const hasComponentAccess = (user: User | null, componentId: string, module: UserModule): boolean => {
  if (!user) return false;

  // Admin has access to all components
  if (user.role === 'Admin' || user.modulesAssigned.includes('All')) {
    return true;
  }

  // Check module access first - this is the primary gate
  if (!hasModuleAccess(user, module)) {
    return false;
  }

  // Role-specific component restrictions within modules
  const role = user.role;

  // Staff can only access expense and payment components
  if (role === 'Staff') {
    const staffAllowedComponents = [
      'add-expense', 'view-expense', 'make-payment', 'view-payment',
      'expense-list', 'payment-list', 'my-account'
    ];
    return staffAllowedComponents.includes(componentId);
  }

  // Approver has staff privileges plus event creation, inventory, and approval capabilities
  if (role === 'Approver') {
    const approverAllowedComponents = [
      // Staff capabilities (expenses and payments)
      'add-expense', 'view-expense', 'make-payment', 'view-payment',
      'expense-list', 'payment-list',
      // Event / Activation / Operation management
      'event-list', 'event-detail', 'add-event', 'edit-event',
      'activation-list', 'activation-detail', 'add-activation',
      'operation-list', 'operation-detail', 'add-operation',
      // Approval capabilities
      'approval-list', 'request-review', 'approve-button', 'reject-button',
      // Inventory access
      'inventory-list', 'inventory-detail', 'add-inventory', 'check-in', 'check-out',
      // Universal
      'my-account'
    ];
    return approverAllowedComponents.includes(componentId);
  }

  // Store Manager can only access inventory and expense components
  if (role === 'Store Manager') {
    const storeManagerAllowedComponents = [
      'inventory-list', 'inventory-detail', 'add-inventory', 'check-in', 'check-out',
      'add-expense', 'view-expense', 'expense-list', 'my-account'
    ];
    return storeManagerAllowedComponents.includes(componentId);
  }

  return true;
};

/**
 * Check if user has access to a specific API endpoint
 * API endpoints are backend services
 */
export const hasApiAccess = (user: User | null, apiEndpoint: string, module: UserModule): boolean => {
  if (!user) return false;

  // Admin has access to all APIs
  if (user.role === 'Admin' || user.modulesAssigned.includes('All')) {
    return true;
  }

  // Check module access first
  if (!hasModuleAccess(user, module)) {
    return false;
  }

  // Role-specific API restrictions
  const role = user.role;

  // Staff can only access expense and payment APIs
  if (role === 'Staff') {
    const staffAllowedApis = [
      'get-expenses', 'create-expense', 'get-payments', 'create-payment',
      'get-my-expenses', 'get-my-payments', 'get-expense-detail', 'get-payment-detail'
    ];
    return staffAllowedApis.includes(apiEndpoint);
  }

  // Approver has staff API access plus event creation, inventory, and approval APIs
  if (role === 'Approver') {
    const approverAllowedApis = [
      // Staff API capabilities (expenses and payments)
      'get-expenses', 'create-expense', 'get-payments', 'create-payment',
      'get-my-expenses', 'get-my-payments', 'get-expense-detail', 'get-payment-detail',
      // Event management APIs
      'get-events', 'get-event-detail', 'create-event', 'update-event', 'get-my-events',
      // Approval APIs
      'get-approvals', 'approve-request', 'reject-request', 'get-request-detail',
      // Inventory APIs
      'get-inventory', 'create-inventory', 'update-inventory', 'check-in', 'check-out'
    ];
    return approverAllowedApis.includes(apiEndpoint);
  }

  // Store Manager can only access inventory and expense APIs
  if (role === 'Store Manager') {
    const storeManagerAllowedApis = [
      'get-inventory', 'create-inventory', 'update-inventory', 'check-in', 'check-out',
      'get-expenses', 'create-expense', 'get-expense-detail', 'get-my-expenses'
    ];
    return storeManagerAllowedApis.includes(apiEndpoint);
  }

  return true;
};

// =============================================
// EVENT-SCOPED ACCESS CONTROL
// =============================================

/**
 * Check if user has access to a specific event
 * Approvers have event-scoped access control
 */
export const hasEventAccess = (user: User | null, eventId: string, accessLevel: 'view' | 'manage' | 'approve' = 'view'): boolean => {
  if (!user) return false;

  // Admin has access to all events
  if (user.role === 'Admin') {
    return true;
  }

  // Approvers have event-scoped access
  if (user.role === 'Approver' && user.eventAccess) {
    const eventAccess = user.eventAccess.find(ea => ea.eventId === eventId);
    if (eventAccess) {
      // Check if user has the required access level
      const accessLevels: Record<'view' | 'manage' | 'approve', number> = {
        'view': 1,
        'manage': 2,
        'approve': 3
      };
      return accessLevels[eventAccess.accessLevel] >= accessLevels[accessLevel];
    }
    return false;
  }

  // Staff and Store Managers don't have event access by default
  if (user.role === 'Staff' || user.role === 'Store Manager') {
    return false;
  }

  // Default deny
  return false;
};

// =============================================
// DATA FILTERING FUNCTIONS
// =============================================

/**
 * Get filtered events based on user access
 * This ensures users only see events they're authorized to see
 */
export const getAccessibleEvents = (user: User | null, allEvents: any[]): any[] => {
  if (!user) return [];

  // Admin can see all events
  if (user.role === 'Admin') {
    return allEvents;
  }

  // Approvers can only see events they have access to
  if (user.role === 'Approver') {
    const accessibleEventIds = new Set<string>();

    // Add events from explicit eventAccess array
    if (user.eventAccess) {
      user.eventAccess.forEach(ea => accessibleEventIds.add(ea.eventId));
    }

    // Add events where the approver is the project lead
    const approverFullName = `${user.firstName} ${user.lastName}`;
    allEvents.forEach(event => {
      if (event.projectLead === approverFullName) {
        accessibleEventIds.add(event.id);
      }
    });

    return allEvents.filter(event => accessibleEventIds.has(event.id));
  }

  // Staff and Store Managers don't have event access
  return [];
};

/**
 * Get filtered expenses based on user access
 * This ensures users only see expenses they're authorized to see
 */
export const getAccessibleExpenses = (user: User | null, allExpenses: any[], allEvents: any[]): any[] => {
  if (!user) return [];

  // Admin can see all expenses
  if (user.role === 'Admin') {
    return allExpenses;
  }

  // Get accessible events first
  const accessibleEvents = getAccessibleEvents(user, allEvents);
  const accessibleEventIds = accessibleEvents.map(event => event.id);

  // Staff can only see expenses they created
  if (user.role === 'Staff') {
    return allExpenses.filter(expense =>
      expense.createdByUserId === user.id
    );
  }

  // Approvers can see their own expenses AND expenses for events they have access to
  if (user.role === 'Approver') {
    return allExpenses.filter(expense =>
      expense.createdByUserId === user.id || // Their own expenses
      accessibleEventIds.includes(expense.eventId) // Events they manage/approve
    );
  }

  // Store Managers can see expenses for their events and inventory-related expenses
  if (user.role === 'Store Manager') {
    return allExpenses.filter(expense =>
      accessibleEventIds.includes(expense.eventId) ||
      expense.expenseType === 'Operational Expense'
    );
  }

  return [];
};

/**
 * Get filtered payments based on user access
 * This ensures users only see payments they're authorized to see
 */
export const getAccessiblePayments = (user: User | null, allPayments: any[], allEvents: any[]): any[] => {
  if (!user) return [];

  // Admin can see all payments
  if (user.role === 'Admin') {
    return allPayments;
  }

  // Get accessible events first
  const accessibleEvents = getAccessibleEvents(user, allEvents);
  const accessibleEventIds = accessibleEvents.map(event => event.id);

  // Staff can only see payments they initiated
  if (user.role === 'Staff') {
    return allPayments.filter(payment =>
      payment.initiatedBy === `${user.firstName} ${user.lastName}`
    );
  }

  // Approvers can see their own payments AND payments for events they have access to
  if (user.role === 'Approver') {
    return allPayments.filter(payment =>
      payment.initiatedBy === `${user.firstName} ${user.lastName}` || // Their own payments
      accessibleEventIds.includes(payment.eventId) // Events they manage/approve
    );
  }

  // Store Managers can see payments for their events
  if (user.role === 'Store Manager') {
    return allPayments.filter(payment =>
      accessibleEventIds.includes(payment.eventId)
    );
  }

  return [];
};

/**
 * Get filtered requests based on user access
 * This ensures users only see requests they're authorized to see
 */
export const getAccessibleRequests = (user: User | null, allRequests: any[], allEvents: any[]): any[] => {
  if (!user) return [];

  // Admin can see all requests
  if (user.role === 'Admin') {
    return allRequests;
  }

  // Get accessible events first
  const accessibleEvents = getAccessibleEvents(user, allEvents);
  const accessibleEventIds = accessibleEvents.map(event => event.id);

  // Staff can only see requests they created
  if (user.role === 'Staff') {
    return allRequests.filter(request =>
      request.requestedBy === `${user.firstName} ${user.lastName}` ||
      (accessibleEventIds.length > 0 && request.eventId && accessibleEventIds.includes(request.eventId))
    );
  }

  // Approvers can only see requests for events they have access to
  if (user.role === 'Approver') {
    return allRequests.filter(request =>
      request.eventId && accessibleEventIds.includes(request.eventId)
    );
  }

  // Store Managers can see requests for their events
  if (user.role === 'Store Manager') {
    return allRequests.filter(request =>
      request.eventId && accessibleEventIds.includes(request.eventId)
    );
  }

  return [];
};

// =============================================
// UI AND NAVIGATION CONTROL
// =============================================

/**
 * Get filtered menu items based on user access
 * This controls what users see in the sidebar navigation
 */
export const getAccessibleMenuItems = (user: User | null, allMenuItems: any[]): any[] => {
  if (!user) return [];

  return allMenuItems.filter(item => {
    // Always show My Account
    if (item.id === 'my-account') return true;

    // Check module access for other items
    return hasModuleAccess(user, item.id as UserModule);
  });
};

// =============================================
// BUSINESS LOGIC AND WORKFLOW ENFORCEMENT
// =============================================

/**
 * Enforce approval workflow for expenses
 * This ensures Staff and Store Manager expenses always require approval
 */
export const enforceApprovalWorkflow = (expense: any, user: User | null): any => {
  if (!user) return expense;

  // Admin expenses don't require approval unless explicitly set
  if (user.role === 'Admin' && !expense.needsApproval) {
    return {
      ...expense,
      status: 'Approved',
      approvalStatus: 'approved',
      approvalRequired: false
    };
  }

  // Staff and Store Manager expenses always require approval
  if (user.role === 'Staff' || user.role === 'Store Manager') {
    return {
      ...expense,
      status: 'Pending',
      approvalStatus: 'pending',
      approvalRequired: true,
      createdByUserId: user.id,
      createdByRole: user.role,
      isEditable: false, // Expense becomes non-editable after submission
      submissionTimestamp: new Date().toISOString()
    };
  }

  // Default to pending if not specified
  return {
    ...expense,
    status: expense.status || 'Pending',
    approvalStatus: expense.approvalStatus || 'pending',
    approvalRequired: expense.approvalRequired !== false,
    createdByUserId: user.id,
    createdByRole: user.role
  };
};

/**
 * Check if expense can be edited based on approval status and user role
 * This enforces the rule that submitted expenses cannot be edited
 */
export const canEditExpense = (expense: any, user: User | null): boolean => {
  if (!user || !expense) return false;

  // Admin can edit any expense
  if (user.role === 'Admin') {
    return true;
  }

  // Only the creator can edit their own expenses
  if (expense.createdByUserId !== user.id) {
    return false;
  }

  // Expenses that have been submitted for approval cannot be edited
  if (expense.approvalRequired && expense.status === 'Pending') {
    return false;
  }

  // Expenses that have been approved cannot be edited
  if (expense.status === 'Approved') {
    return false;
  }

  // Expenses that have been rejected can be edited by the creator
  if (expense.status === 'Rejected') {
    return true;
  }

  // Draft expenses can be edited by the creator
  if (expense.status === 'Draft') {
    return true;
  }

  return false;
};

// =============================================
// ROLE-SPECIFIC ACCESS CONTROL UTILITIES
// =============================================

/**
 * Get default modules for a specific role
 * This helps with user creation by providing sensible defaults
 */
export const getDefaultModulesForRole = (role: string): UserModule[] => {
  switch (role) {
    case 'Admin':
      return ['All'];
    case 'Staff':
      return ['Expenses', 'Payments'];
    case 'Approver':
      return ['Events', 'Activations', 'Operations', 'Expenses', 'Payments', 'Approvals', 'Inventory'];
    case 'Store Manager':
      return ['Inventory', 'Expenses'];
    default:
      return [];
  }
};
