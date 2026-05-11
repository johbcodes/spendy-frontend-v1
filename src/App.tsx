import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { PageContainer } from './components/layout/PageContainer';
import { Dashboard } from './pages/Dashboard';
import { Events } from './features/events/pages/Events';
import { EventDetail } from './features/events/pages/EventDetail';
import { EditEvent } from './features/events/pages/EditEvent';
import { Wallets } from './features/wallets/pages/Wallets';
import { WalletDetail } from './features/wallets/pages/WalletDetail';
import { TransactionDetail } from './features/wallets/pages/TransactionDetail';
import { Expenses } from './features/expenses/pages/Expenses';
import { ExpenseDetail } from './features/expenses/pages/ExpenseDetail';
import { Payments } from './features/payments/pages/Payments';
import { PaymentDetail } from './features/payments/pages/PaymentDetail';
import { PaymentDetailsReadOnly } from './features/payments/pages/PaymentDetailsReadOnly';
import { MakePaymentPage } from './features/payments/pages/MakePaymentPage';
import { StaffExpenses } from './features/expenses/pages/StaffExpenses';
import { StaffPayments } from './features/payments/pages/StaffPayments';
import { StaffDashboard } from './pages/StaffDashboard';
import { ApproverDashboard } from './pages/ApproverDashboard';
import { StoreManagerDashboard } from './pages/StoreManagerDashboard';
import { Approvals } from './features/approvals/pages/Approvals';
import { RequestReview } from './features/approvals/pages/RequestReview';
import { BatchApprovalReview } from './features/approvals/pages/BatchApprovalReview';
import { Users } from './features/users/pages/Users';
import { EditUser } from './features/users/pages/EditUser';
import { Analytics } from './features/reports/pages/Analytics';
import { Inventory } from './features/inventory/pages/Inventory';
import { InventoryDetail } from './features/inventory/pages/InventoryDetail';
import { EditInventory } from './features/inventory/pages/EditInventory';
import { CheckOut } from './features/inventory/pages/CheckOut';
import { CheckIn } from './features/inventory/pages/CheckIn';
import { Suppliers } from './features/suppliers/pages/Suppliers';
import { SupplierDetail } from './features/suppliers/pages/SupplierDetail';
import { PaySupplier } from './features/suppliers/pages/PaySupplier';
import { Invoices } from './features/invoices/pages/Invoices';
import { Quotations } from './pages/Quotations';
import { InvoiceDetail } from './features/invoices/pages/InvoiceDetail';
import { Products } from './pages/Products';
import { ConnectWalletPage } from './features/wallets/pages/ConnectWallet';
import { UploadDocumentPage } from './pages/UploadDocument';
import { SystemSetup } from './features/system-setup/pages/SystemSetup';
import { MyAccount } from './pages/MyAccount';
import { Notifications } from './features/notifications/pages/Notifications';
import { AccessDenied } from './pages/AccessDenied';
import { SignIn } from './features/auth/pages/SignIn';
import { SignUp, SignUpData } from './features/auth/pages/SignUp';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/ui/Toast';
import { Event, EventType, Wallet, Expense, Supplier, InventoryItem, Request, User, Payment, RequestStatus, Transaction, Movement, SystemNotification, NotificationType, UserRole, Invoice, Product } from './types';
import { generateUUID, generateSpendyAccountNumber } from './utils/idGenerator';
import { hasPageAccess, getAccessibleEvents, getAccessibleExpenses, getAccessiblePayments, getAccessibleRequests, enforceApprovalWorkflow } from './utils/accessControl';
import { eventService, expenseService, invoiceService, productService, supplierService } from './services';
import { buildEventDocumentName, useEventController, updateApproverEventAccess as updateApproverEventAccessRule } from './features/events';
import { useInventoryController } from './features/inventory/hooks';
import { useWalletController } from './features/wallets/hooks';
import { usePaymentController } from './features/payments/hooks';
import { useApprovalsController } from './features/approvals/hooks';
import { approveRequest as buildApproveRequestPatch, rejectRequest as buildRejectRequestPatch, undoRejection as buildUndoRejectionPatch } from './features/approvals/api';
import { createSystemNotification, useNotificationsController } from './features/notifications';
import type { InventoryMovementDraft } from './features/inventory/rules';
import { WALLET_TYPES, AUTO_APPROVED_ROLES, EVENT_WALLET_MAPPING } from './constants/app';
// Modal imports
import { NewEventModal } from './features/events/modals/NewEventModal';
import { NewWalletModal } from './features/wallets/modals/NewWalletModal';
import { EditWalletModal } from './features/wallets/modals/EditWalletModal';
import { FundWalletModal } from './features/wallets/modals/FundWalletModal';
import { WalletTransferModal } from './features/wallets/modals/WalletTransferModal';
import { AddExpenseModal } from './features/expenses/modals/AddExpenseModal';
import { CreateUserModal } from './features/users/modals/CreateUserModal';
import { AddInventoryModal } from './features/inventory/modals/AddInventoryModal';
import { CheckOutModal } from './features/inventory/modals/CheckOutModal';
import { CheckInModal } from './features/inventory/modals/CheckInModal';
import { AllocateInventoryModal } from './features/inventory/modals/AllocateInventoryModal';
import { EditInventoryModal } from './features/inventory/modals/EditInventoryModal';
import { EditInventoryMovementModal as EditMovementModal } from './features/inventory/modals/EditInventoryMovementModal';
import { AddSupplierModal } from './features/suppliers/modals/AddSupplierModal';
import { EditSupplierModal } from './features/suppliers/modals/EditSupplierModal';
import { RequestPaymentModal } from './features/expenses/modals/RequestPaymentModal';
import { UploadDocumentModal } from './features/events/modals/UploadDocumentModal';
import { ApproveRejectModal } from './features/approvals/modals/ApproveRejectModal';
import { ViewSupplierModal } from './features/suppliers/modals/ViewSupplierModal';
import { PaySupplierModal } from './features/suppliers/modals/PaySupplierModal';
import { MakePaymentModal } from './features/payments/modals/MakePaymentModal';
import { InsufficientBalanceModal } from './features/wallets/modals/InsufficientBalanceModal';
import { ConnectWalletModal } from './features/wallets/modals/ConnectWalletModal';
import { EditRequestModal } from './features/approvals/modals/EditRequestModal';
import { BatchDisbursementModal } from './features/approvals/modals/BatchDisbursementModal';
import { AddInvoiceModal } from './features/invoices/modals/AddInvoiceModal';
import { EditInvoiceModal } from './features/invoices/modals/EditInvoiceModal';
import { SendToSpendyAccountModal } from './features/wallets/modals/SendToSpendyAccountModal';
// Route mapping for cleaner URLs
const ROUTE_MAP: Record<string, string> = {
  'dashboard': '/dashboard',
  'events': '/events',
  'event-detail': '/events',
  'edit-event': '/events/edit',
  'wallets': '/wallets',
  'wallet-detail': '/wallets',
  'transaction-detail': '/wallets/transaction',
  'expenses': '/expenses',
  'expense-detail': '/expenses',
  'payments': '/payments',
  'make-payment-page': '/payments/make',
  'payment-detail': '/payments',
  'payment-details-readonly': '/payments/details',
  'approvals': '/approvals',
  'request-review': '/approvals/review',
  'batch-approval-review': '/approvals/batch',
  'users': '/users',
  'edit-user': '/users/edit',
  'system-setup': '/settings/system',
  'analytics': '/analytics',
  'suppliers': '/suppliers',
  'supplier-detail': '/suppliers',
  'pay-supplier': '/suppliers/pay',
  'invoices': '/invoices',
  'products': '/products',
  'invoice-detail': '/invoices',
  'inventory': '/inventory',
  'inventory-detail': '/inventory',
  'edit-inventory': '/inventory/edit',
  'checkout': '/inventory/checkout',
  'checkin': '/inventory/checkin',
  'my-account': '/account',
  'notifications': '/notifications',
  'connect-wallet-page': '/wallets/connect',
  'upload-document-page': '/documents/upload',
  'signin': '/signin',
  'signup': '/signup'
};

const PAGE_MAP: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/events': 'events',
  '/wallets': 'wallets',
  '/wallets/transaction': 'transaction-detail',
  '/expenses': 'expenses',
  '/payments': 'payments',
  '/approvals': 'approvals',
  '/users': 'users',
  '/analytics': 'analytics',
  '/suppliers': 'suppliers',
  '/invoices': 'invoices',
  '/products': 'products',
  '/inventory': 'inventory',
  '/account': 'my-account',
  '/notifications': 'notifications',
  '/settings/system': 'system-setup',
  '/signin': 'signin',
  '/signup': 'signup'
};

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPage, setAuthPage] = useState<'signin' | 'signup'>('signin');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [navigationParams, setNavigationParams] = useState<Record<string, any>>({});
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<Record<string, unknown> | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {
    toasts,
    showToast,
    removeToast
  } = useToast();

  // Sync state with URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '') {
      if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/signin', { replace: true });
      }
      return;
    }

    if (path === '/signin') {
      setAuthPage('signin');
      setIsAuthenticated(false);
      return;
    }
    if (path === '/signup') {
      setAuthPage('signup');
      setIsAuthenticated(false);
      return;
    }

    // Handle nested paths and IDs
    const segments = path.split('/').filter(Boolean);
    const primaryPath = '/' + segments[0];
    const id = segments[1];
    
    // Check for explicit matches in PAGE_MAP
    let page = PAGE_MAP[primaryPath];
    
    // If no direct match, check sub-paths
    if (!page) {
      if (segments.length >= 2) {
        const fullPath = '/' + segments[0] + '/' + segments[1];
        page = PAGE_MAP[fullPath];
      }
    }

    // Default mapping rules for details pages
    if (!page) {
      if (primaryPath === '/events' && id) page = 'event-detail';
      else if (primaryPath === '/inventory' && id) page = 'inventory-detail';
      else if (primaryPath === '/wallets' && segments[1] === 'transaction' && segments[2]) {
        page = 'transaction-detail';
        setSelectedId(segments[2]);
      }
      else if (primaryPath === '/wallets' && id) page = 'wallet-detail';
      else if (primaryPath === '/expenses' && id) page = 'expense-detail';
      else if (primaryPath === '/payments' && id) page = 'payment-detail';
      else if (primaryPath === '/suppliers' && id) page = 'supplier-detail';
      else if (primaryPath === '/invoices' && id) page = 'invoice-detail';
    }

    if (page) {
      setCurrentPage(page);
      setSelectedId(id);
    } else {
      // Fallback for unknown paths
      setCurrentPage(segments[0] || 'dashboard');
      setSelectedId(id);
    }
  }, [location.pathname, isAuthenticated, navigate]);
  
  // Check for saved session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedUsers = localStorage.getItem('users');

    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(savedUser));

      // Fetch fresh data from backend on session restore
      (async () => {
        try {
          // Fetch events
          const { eventAPI } = await import('./services/backendAPI');
          const eventsResponse = await eventAPI.getAll();
          const eventsData = Array.isArray(eventsResponse.data)
            ? eventsResponse.data
            : ((eventsResponse as any).data?.data || []);
          console.log('📅 Fetched events from backend:', eventsData.length, eventsData);
          setEvents(eventsData);
          localStorage.setItem('spendy_events', JSON.stringify(eventsData));

          // Fetch users
          const { userAPI } = await import('./services/backendAPI');
          const usersResponse = await userAPI.getAll();
          const usersData = Array.isArray(usersResponse.data)
            ? usersResponse.data
            : ((usersResponse as any).data?.data || []);

          const currentUserObj = JSON.parse(savedUser);
          const appUsers = usersData.map((u: any) => ({
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            phone: u.phone || '',
            country: u.country || '',
            role: u.role,
            status: u.status || 'Active',
            modulesAssigned: u.modulesAssigned || [],
            profileImage: u.profileImage,
            createdAt: u.createdAt || new Date().toISOString(),
            companyId: currentUserObj.companyId,
            companyName: currentUserObj.companyName,
            isAdmin: u.role === 'Admin',
            password: ''
          }));

          setUsers(appUsers);
          localStorage.setItem('spendy_users', JSON.stringify(appUsers));

          // Fetch all categories
          const { categoryAPI } = await import('./services/backendAPI');
          const [
            eventCategoriesRes,
            activationCategoriesRes,
            expenseCategoriesRes,
            operationCategoriesRes,
            supplierCategoriesRes,
            inventoryCategoriesRes
          ] = await Promise.all([
            categoryAPI.getAll('event'),
            categoryAPI.getAll('activation'),
            categoryAPI.getAll('expense'),
            categoryAPI.getAll('operation'),
            categoryAPI.getAll('supplier'),
            categoryAPI.getAll('inventory')
          ]);

          // Add company as first client
          const updatedSystemData = {
            eventcategorys: eventCategoriesRes.data || [],
            activationcategorys: activationCategoriesRes.data || [],
            expensecategorys: expenseCategoriesRes.data || [],
            operationcategorys: operationCategoriesRes.data || [],
            suppliercategorys: supplierCategoriesRes.data || [],
            wallettypes: [],
            inventorycategorys: inventoryCategoriesRes.data || [],
            clients: [{
              id: generateUUID(),
              itemNumber: 'CL001',
              name: currentUserObj.companyName,
              contactPerson: `${currentUserObj.firstName} ${currentUserObj.lastName}`,
              email: currentUserObj.email,
              phone: currentUserObj.phone || '',
              brands: [],
              status: 'Active',
              dateCreated: new Date().toISOString().split('T')[0]
            }],
            countries: ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan', 'Ethiopia', 'Somalia']
          };
          setSystemData(updatedSystemData);
          localStorage.setItem('spendy_systemdata', JSON.stringify(updatedSystemData));
        } catch (error) {
          console.error('Error fetching data on session restore:', error);
          setEvents([]);
        }
      })();
    }
  }, []);
  
  // Insufficient balance modal state
  const [insufficientBalanceData, setInsufficientBalanceData] = useState<{
    requiredAmount: number;
    walletId: string;
    requestId: string;
  } | null>(null);

  // Note: using transient toasts for activity notifications (see `useToast`)
  const [systemData, setSystemData] = useState(() => {
    const savedSystemData = localStorage.getItem('spendy_systemdata');
    if (savedSystemData) {
      try {
        return JSON.parse(savedSystemData);
      } catch (e) {
        console.error('Error loading system data from localStorage:', e);
      }
    }
    // Default structure for new accounts - no demo data, empty categories
    return {
      eventcategorys: [],
      activationcategorys: [],
      expensecategorys: [],
      operationcategorys: [],
      suppliercategorys: [],
      wallettypes: [],
      inventorycategorys: [],
      clients: [],
      countries: ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan', 'Ethiopia', 'Somalia']
    };
  });

  // Save systemData to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('spendy_systemdata', JSON.stringify(systemData));
  }, [systemData]);
  const {
    events,
    setEvents,
    addEvent: addEventToFeature,
    updateEvent: updateEventInFeature,
    archiveEvent: archiveEventInFeature,
    updateEventStatus: updateEventStatusInFeature,
    uploadEventDocument,
    addEventSpend,
  } = useEventController(currentUser);
  // Wallets - owned by feature controller
  const walletCtrl = useWalletController(currentUser);
  const wallets = walletCtrl.wallets;
  const setWallets = walletCtrl.setWallets;
  // Expenses state - Loaded from backend
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load expenses from backend when user changes
  useEffect(() => {
    if (!currentUser) {
      console.log('🔒 [Expenses] No user logged in, clearing expenses');
      setExpenses([]);
      return;
    }

    const loadExpenses = async () => {
      console.log('🔄 [Expenses] Loading expenses from database for:', currentUser.companyName);
      const companyExpenses = await expenseService.getAllExpenses();
      console.log('✅ [Expenses] Loaded', companyExpenses.length, 'expenses from database');
      setExpenses(companyExpenses);

      // Generate approval requests for pending expenses that need approval
      const pendingExpenses = companyExpenses.filter(exp =>
        exp.status === 'Pending' && exp.approvalRequired
      );

      if (pendingExpenses.length > 0) {
        console.log('📋 [Expenses] Generating', pendingExpenses.length, 'approval requests from pending expenses');

        // Get existing requests from localStorage
        const savedRequests = localStorage.getItem('spendy_requests');
        let existingRequests: Request[] = [];
        if (savedRequests) {
          try {
            existingRequests = JSON.parse(savedRequests);
          } catch (e) {
            console.error('Error loading requests:', e);
          }
        }

        // Generate requests for expenses that don't have one yet
        const newRequests: Request[] = [];
        for (const expense of pendingExpenses) {
          // Check if request already exists for this expense
          const requestExists = existingRequests.some(r => r.expenseId === expense.id);
          if (!requestExists) {
            const request: Request = {
              id: generateUUID(),
              type: (expense.expenseType || 'Event') as EventType,
              name: expense.title,
              category: expense.category,
              eventId: expense.eventId || undefined,
              amount: expense.amount,
              totalAmount: expense.amount,
              description: expense.description || '',
              requestedBy: expense.createdBy,
              dateRequested: expense.startDate || new Date().toISOString(),
              status: 'Pending',
              expenseId: expense.id,
              supplier: expense.supplier,
              supplierCategory: expense.supplierCategory,
              paymentRequestType: 'single',
              expenseRequestType: 'single',
              batchPaymentDetails: expense.batchPaymentDetails || []
            };
            newRequests.push(request);
          }
        }

        if (newRequests.length > 0) {
          const updatedRequests = [...existingRequests, ...newRequests];
          setRequests(updatedRequests);
          localStorage.setItem('spendy_requests', JSON.stringify(updatedRequests));
          console.log('✅ [Expenses] Generated', newRequests.length, 'new approval requests');
        }
      }
    };

    loadExpenses();
  }, [currentUser]);

  // Save expenses to localStorage whenever they change (for backward compatibility)
  useEffect(() => {
    localStorage.setItem('spendy_expenses', JSON.stringify(expenses));
  }, [expenses]);
  
  // Suppliers state with localStorage persistence
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Load suppliers from backend when user changes
  useEffect(() => {
    if (!currentUser) {
      console.log('🔒 [Suppliers] No user logged in, clearing suppliers');
      setSuppliers([]);
      return;
    }

    const loadSuppliers = async () => {
      console.log('🔄 [Suppliers] Loading suppliers from database for:', currentUser.companyName);
      const companySuppliers = await supplierService.getAllSuppliers();
      console.log('✅ [Suppliers] Loaded', companySuppliers.length, 'suppliers from database');
      setSuppliers(companySuppliers as any);
    };

    loadSuppliers();
  }, [currentUser]);
  
  // Inventory - owned by feature controller
  const invCtrl = useInventoryController(currentUser);
  const inventory = invCtrl.inventory;
  const setInventory = invCtrl.setInventory;
  // Payments - owned by feature controller
  const paymentCtrl = usePaymentController(currentUser);
  const payments = paymentCtrl.payments;
  const setPayments = paymentCtrl.setPayments;

  // Invoices state with localStorage persistence
  // Products/Items state - Filtered by current user's company
  const [products, setProducts] = useState<Product[]>([]);

  // Load and filter products when user changes
  useEffect(() => {
    if (!currentUser) {
      setProducts([]);
      return;
    }

    const loadProducts = async () => {
      const companyProducts = await productService.getCompanyProducts(currentUser.companyName || '');
      console.log('📦 [Products] Loaded', companyProducts.length, 'products for', currentUser.companyName);
      setProducts(companyProducts);
    };

    loadProducts();
  }, [currentUser]);

  // Save products to localStorage
  useEffect(() => {
    if (!currentUser) return;
    productService.saveCompanyProducts(currentUser.companyName || '', products);
  }, [products, currentUser]);

  // Invoices state - Filtered by current user's company
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Load invoices from database when user changes
  useEffect(() => {
    if (!currentUser) {
      console.log('🔒 [Invoices] No user logged in, clearing invoices');
      setInvoices([]);
      return;
    }

    const loadInvoices = async () => {
      console.log('🔄 [Invoices] Loading invoices from database for:', currentUser.companyName);
      const companyInvoices = await invoiceService.getAllInvoices();
      console.log('✅ [Invoices] Loaded', companyInvoices.length, 'invoices from database');
      setInvoices(companyInvoices);
    };

    loadInvoices();
  }, [currentUser]);

  // Approvals/Requests - owned by feature controller
  const approvalsCtrl = useApprovalsController(currentUser);
  const requests = approvalsCtrl.requests;
  const setRequests = approvalsCtrl.setRequests;

  // Transactions - owned by wallet controller
  const transactions = walletCtrl.transactions;
  const setTransactions = walletCtrl.setTransactions;

  // Activity Log state with localStorage persistence
  const [activityLog, setActivityLog] = useState<Array<{ id: string; action: string; user: string; timestamp: string; details?: string }>>(() => {
    const savedActivityLog = localStorage.getItem('spendy_activitylog');
    if (savedActivityLog) {
      try {
        return JSON.parse(savedActivityLog);
      } catch (e) {
        console.error('Error loading activity log from localStorage:', e);
      }
    }
    return [];
  });

  // Save activity log to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('spendy_activitylog', JSON.stringify(activityLog));
  }, [activityLog]);

  // Notifications - owned by feature controller
  const notificationsCtrl = useNotificationsController(currentUser);
  const notifications = notificationsCtrl.notifications;

  useEffect(() => {
    localStorage.setItem('spendy_inventory', JSON.stringify(inventory));
  }, [inventory]);

  // Function to add activity log entry
  const addActivityLog = (action: string, details?: string) => {
    const newActivity = {
      id: Date.now().toString(),
      action,
      user: currentUser?.firstName + ' ' + currentUser?.lastName || 'System',
      timestamp: new Date().toISOString(),
      details
    };
    setActivityLog(prev => [newActivity, ...prev]);
  };

  // Notification utility functions
  const createNotification = (
    type: NotificationType,
    title: string,
    message: string,
    recipientId?: string,
    recipientRole?: UserRole,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    actionRequired = false,
    relatedEntityId?: string,
    relatedEntityType?: 'expense' | 'user' | 'event' | 'payment' | 'approval',
    metadata?: Record<string, any>
  ): SystemNotification => {
    return {
      ...createSystemNotification({
        type,
        title,
        message,
        recipientId,
        recipientRole,
        senderId: currentUser?.id || 'system',
        senderName: currentUser?.firstName + ' ' + currentUser?.lastName || 'System',
        priority,
        actionRequired,
        relatedEntityId,
        relatedEntityType,
        metadata,
      }),
      id: generateUUID(),
      type,
      title,
      message,
      recipientId,
      recipientRole,
      senderId: currentUser?.id || 'system',
      senderName: currentUser?.firstName + ' ' + currentUser?.lastName || 'System',
      timestamp: new Date().toISOString(),
      isRead: false,
      priority,
      actionRequired,
      relatedEntityId,
      relatedEntityType,
      metadata
    };
  };

  const sendNotification = (notification: SystemNotification) => {
    notificationsCtrl.sendNotification(notification);
  };

  const markNotificationAsRead = (notificationId: string) => {
    notificationsCtrl.markAsRead(notificationId);
  };

  const getUserNotifications = (user: User | null): SystemNotification[] => {
    return user?.id === currentUser?.id ? notificationsCtrl.userNotifications : [];
  };

  const getUnreadNotificationCount = (user: User | null): number => {
    return user?.id === currentUser?.id ? notificationsCtrl.unreadCount : 0;
  };

  // Helper function to convert payment method formats
  const convertPaymentMethod = (method: string): 'mpesa' | 'paybill' | 'till' => {
    switch (method) {
      case 'sendMoney':
        return 'mpesa';
      case 'paybill':
        return 'paybill';
      case 'buyGoods':
        return 'till';
      default:
        return 'mpesa';
    }
  };

  // Helper function to create transaction records
  const createTransaction = (
    walletId: string,
    type: 'Fund' | 'Transfer' | 'Withdrawal',
    amount: number,
    recipient: string,
    sourceWallet?: string
  ) => {
    const now = new Date();
    // Convert to Nairobi timezone (UTC+3)
    const nairobiTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));

    // Format date as dd/mm/year with short month name
    const day = nairobiTime.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[nairobiTime.getMonth()];
    const year = nairobiTime.getFullYear();
    const dateStr = `${day}/${month}/${year}`;

    // Format time in 24-hour format (HH:MM)
    const hours = nairobiTime.getHours().toString().padStart(2, '0');
    const minutes = nairobiTime.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const newTransaction: Transaction = {
      id: generateUUID(),
      walletId: walletId,
      date: dateStr,
      time: timeStr,
      user: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
      recipient: recipient,
      reference: `TXN-${Date.now().toString(36).toUpperCase()}`,
      amount: amount,
      status: 'Completed',
      type: type,
      sourceWallet: sourceWallet
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  };
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);

  // REMOVED: Duplicate wallet loading logic (now handled at top of file)

  // Migration: Assign account numbers to existing companies
  useEffect(() => {
    const migrateUsers = () => {
      console.log('🔄 [Migration] Checking if user migration needed...');
      let needsUpdate = false;
      let updatedCurrentUser: User | null = null;

      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        const usersList: User[] = JSON.parse(storedUsers);
        const updatedUsers = usersList.map(user => {
          if (user.isAdmin && !user.spendyAccountNumber) {
            needsUpdate = true;
            const migratedUser = {
              ...user,
              spendyPaybillNumber: '247247',
              spendyAccountNumber: generateSpendyAccountNumber()
            };

            console.log('✅ [Migration] Assigned account number to:', user.companyName, migratedUser.spendyAccountNumber);

            if (currentUser && user.id === currentUser.id) {
              updatedCurrentUser = migratedUser;
            }

            return migratedUser;
          }
          return user;
        });

        if (needsUpdate) {
          localStorage.setItem('users', JSON.stringify(updatedUsers));
          console.log('✅ [Migration] Migrated users with Spendy account numbers');

          if (updatedCurrentUser) {
            localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
            setCurrentUser(updatedCurrentUser);
            console.log('✅ [Migration] Updated current user with account number:', (updatedCurrentUser as any).spendyAccountNumber);
          }
        }
      }
    };

    if (currentUser) {
      migrateUsers();
    }
  }, [currentUser]);

  // Movements - owned by inventory controller
  const inventoryMovements = invCtrl.inventoryMovements;
  const handleNavigate = (page: string, id?: string, params?: Record<string, any>) => {
    // Check if user has access to the requested page using module-based access control
    if (hasPageAccess(currentUser, page)) {
      // Construct the path for routing
      const path = id ? `/${page}/${id}` : `/${page}`;
      navigate(path);

      setCurrentPage(page);
      setSelectedId(id);
      setNavigationParams(params || {});

      // Refresh invoices when navigating to the invoices page
      if (page === 'invoices' && currentUser) {
        (async () => {
          try {
            console.log('🔄 [Invoices] Refreshing invoices from database');
            const companyInvoices = await invoiceService.getAllInvoices();
            setInvoices(companyInvoices);
            console.log('✅ [Invoices] Refreshed', companyInvoices.length, 'invoices');
          } catch (error) {
            console.error('❌ [Invoices] Failed to refresh invoices:', error);
          }
        })();
      }

      // Refresh expenses and requests when navigating to the approvals page
      if (page === 'approvals' && currentUser) {
        (async () => {
          try {
            console.log('🔄 [Approvals] Refreshing expenses and requests from database');
            const companyExpenses = await expenseService.getAllExpenses();
            setExpenses(companyExpenses);
            console.log('✅ [Approvals] Refreshed', companyExpenses.length, 'expenses');

            // Generate approval requests for pending expenses
            const pendingExpenses = companyExpenses.filter(exp =>
              exp.status === 'Pending' && exp.approvalRequired
            );

            if (pendingExpenses.length > 0) {
              const savedRequests = localStorage.getItem('spendy_requests');
              let existingRequests: Request[] = [];
              if (savedRequests) {
                try {
                  existingRequests = JSON.parse(savedRequests);
                } catch (e) {
                  console.error('Error loading requests:', e);
                }
              }

              const newRequests: Request[] = [];
              for (const expense of pendingExpenses) {
                const requestExists = existingRequests.some(r => r.expenseId === expense.id);
                if (!requestExists) {
                  const request: Request = {
                    id: generateUUID(),
                    type: (expense.expenseType || 'Event') as EventType,
                    name: expense.title,
                    category: expense.category,
                    eventId: expense.eventId || undefined,
                    amount: expense.amount,
                    totalAmount: expense.amount,
                    description: expense.description || '',
                    requestedBy: expense.createdBy,
                    dateRequested: expense.startDate || new Date().toISOString(),
                    status: 'Pending',
                    expenseId: expense.id,
                    supplier: expense.supplier,
                    supplierCategory: expense.supplierCategory,
                    paymentRequestType: 'single',
                    expenseRequestType: 'single',
                    batchPaymentDetails: expense.batchPaymentDetails || []
                  };
                  newRequests.push(request);
                }
              }

              if (newRequests.length > 0) {
                const updatedRequests = [...existingRequests, ...newRequests];
                setRequests(updatedRequests);
                localStorage.setItem('spendy_requests', JSON.stringify(updatedRequests));
                console.log('✅ [Approvals] Generated', newRequests.length, 'new approval requests');
              }
            }
          } catch (error) {
            console.error('❌ [Approvals] Failed to refresh expenses:', error);
          }
        })();
      }

      // Track user activity - increment activity count on page navigation
      if (currentUser) {
        const updatedUser: User = {
          ...currentUser,
          activityCount: (currentUser.activityCount || 0) + 1
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        // Update in users array
        const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      }
    } else {
      // Instead of showing access denied, redirect to appropriate accessible page
      if (currentUser?.role === 'Approver') {
        // Approver users should be redirected to Events page
        setCurrentPage('events');
        setSelectedId(undefined);
        showToast('Redirected to Events - you only have access to Events and Approvals modules', 'info');
      } else if (currentUser?.role === 'Store Manager') {
        // Store Manager users should be redirected to Inventory page
        setCurrentPage('inventory');
        setSelectedId(undefined);
        showToast('Redirected to Inventory - you only have access to Inventory and Expenses modules', 'info');
      } else {
        // Admin users should go to dashboard
        setCurrentPage('dashboard');
        setSelectedId(undefined);
        showToast('Access denied: You do not have permission to access this page', 'error');
      }
    }
  };
  const handleOpenModal = (modal: string, data?: Record<string, unknown>) => {
    setActiveModal(modal);
    setModalData(data || null);

    // Set selectedId if data has an id (for event-specific modals)
    if (data && typeof data === 'object' && 'id' in data && typeof data.id === 'string') {
      setSelectedId(data.id);
    }
  };
  const handleCloseModal = () => {
    setActiveModal(null);
    setModalData(null);
  };
  
  // Authentication handlers
  const handleSignIn = async (email: string, password: string, rememberMe: boolean) => {
    try {
      // Clear old company data before logging in
      localStorage.removeItem('spendy_events');
      localStorage.removeItem('spendy_wallets');
      localStorage.removeItem('spendy_expenses');
      localStorage.removeItem('spendy_transactions');
      localStorage.removeItem('spendy_users');
      localStorage.removeItem('spendy_systemdata');
      localStorage.removeItem('spendy_products');
      localStorage.removeItem('spendy_suppliers');
      // Invoices are now stored in database, no need to remove from localStorage

      // Reset all state to empty for new company (will be populated after login)
      const emptySystemData = {
        eventcategorys: [],
        activationcategorys: [],
        expensecategorys: [],
        operationcategorys: [],
        suppliercategorys: [],
        wallettypes: [],
        inventorycategorys: [],
        clients: [], // Will be populated with company as first client after login
        countries: ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan', 'Ethiopia', 'Somalia']
      };
      setSystemData(emptySystemData);
      localStorage.setItem('spendy_systemdata', JSON.stringify(emptySystemData));

      // Reset other state arrays
      setExpenses([]);
      setTransactions([]);
      setProducts([]);
      setSuppliers([]);
      setInvoices([]);
      paymentCtrl.clearPayments();
      approvalsCtrl.clearRequests();
      setInventory([]);

      // Call backend API
      const { authAPI } = await import('./services/backendAPI');
      const response = await authAPI.login({ email, password });

      const { user, accessToken, refreshToken } = response.data;

      console.log('🔑 Signing in user:', user.email);
      console.log('🏢 Company:', user.companyId);

      // Store token, refresh token, and user data
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');

      // Convert backend user to app user format
      const appUser: User = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        country: user.country || '',
        role: user.role as UserRole,
        status: (user.status || 'Active') as 'Active' | 'Inactive',
        modulesAssigned: user.modulesAssigned ? JSON.parse(user.modulesAssigned) : [],
        createdAt: new Date().toISOString(),
        companyId: user.companyId,
        companyName: user.companyName,
        isAdmin: user.role === 'Admin',
        password: ''
      };

      setCurrentUser(appUser);
      setIsAuthenticated(true);

      // Fetch wallets from backend
      try {
        const { walletAPI } = await import('./services/backendAPI');
        const walletsResponse = await walletAPI.getAll();
        console.log('📥 Fetched wallets from backend:', walletsResponse);

        // Handle the API response structure
        const walletsData = Array.isArray(walletsResponse.data)
          ? walletsResponse.data
          : ((walletsResponse as any).data?.data || []);

        setWallets(walletsData);
        localStorage.setItem('spendy_wallets', JSON.stringify(walletsData));
      } catch (walletError) {
        console.error('Error fetching wallets:', walletError);
        // Don't fail login if wallets fetch fails
      }

      // Fetch events from backend
      try {
        const { eventAPI } = await import('./services/backendAPI');
        const eventsResponse = await eventAPI.getAll();
        console.log('📥 Fetched events from backend:', eventsResponse);

        const eventsData = Array.isArray(eventsResponse.data)
          ? eventsResponse.data
          : ((eventsResponse as any).data?.data || []);

        setEvents(eventsData);
        localStorage.setItem('spendy_events', JSON.stringify(eventsData));
      } catch (eventError) {
        console.error('Error fetching events:', eventError);
        setEvents([]);
      }

      // Fetch users from backend
      try {
        const { userAPI } = await import('./services/backendAPI');
        const usersResponse = await userAPI.getAll();
        console.log('📥 Fetched users from backend:', usersResponse);

        const usersData = Array.isArray(usersResponse.data)
          ? usersResponse.data
          : ((usersResponse as any).data?.data || []);

        // Convert backend users to app user format
        const appUsers = usersData.map((u: any) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone || '',
          country: u.country || '',
          role: u.role,
          status: u.status || 'Active',
          modulesAssigned: u.modulesAssigned || [],
          profileImage: u.profileImage,
          createdAt: u.createdAt || new Date().toISOString(),
          companyId: user.companyId,
          companyName: user.companyName,
          isAdmin: u.role === 'Admin',
          password: ''
        }));

        setUsers(appUsers);
        localStorage.setItem('spendy_users', JSON.stringify(appUsers));
      } catch (userError) {
        console.error('Error fetching users:', userError);
        setUsers([appUser]);
      }

      // Fetch all categories from backend
      try {
        const { categoryAPI } = await import('./services/backendAPI');
        const [
          eventCategoriesRes,
          activationCategoriesRes,
          expenseCategoriesRes,
          operationCategoriesRes,
          supplierCategoriesRes,
          inventoryCategoriesRes
        ] = await Promise.all([
          categoryAPI.getAll('event'),
          categoryAPI.getAll('activation'),
          categoryAPI.getAll('expense'),
          categoryAPI.getAll('operation'),
          categoryAPI.getAll('supplier'),
          categoryAPI.getAll('inventory')
        ]);

        // Add company as first client if clients array is empty
        const updatedSystemData = {
          eventcategorys: eventCategoriesRes.data || [],
          activationcategorys: activationCategoriesRes.data || [],
          expensecategorys: expenseCategoriesRes.data || [],
          operationcategorys: operationCategoriesRes.data || [],
          suppliercategorys: supplierCategoriesRes.data || [],
          wallettypes: [],
          inventorycategorys: inventoryCategoriesRes.data || [],
          clients: [{
            id: generateUUID(),
            itemNumber: 'CL001',
            name: user.companyName,
            contactPerson: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone || appUser.phone,
            brands: [],
            status: 'Active',
            dateCreated: new Date().toISOString().split('T')[0]
          }],
          countries: ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan', 'Ethiopia', 'Somalia']
        };
        setSystemData(updatedSystemData);
        localStorage.setItem('spendy_systemdata', JSON.stringify(updatedSystemData));
      } catch (categoryError) {
        console.error('Error fetching categories:', categoryError);
        // Fallback to empty arrays if category fetch fails
        const updatedSystemData = {
          eventcategorys: [],
          activationcategorys: [],
          expensecategorys: [],
          operationcategorys: [],
          suppliercategorys: [],
          wallettypes: [],
          inventorycategorys: [],
          clients: [{
            id: generateUUID(),
            itemNumber: 'CL001',
            name: user.companyName,
            contactPerson: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone || appUser.phone,
            brands: [],
            status: 'Active',
            dateCreated: new Date().toISOString().split('T')[0]
          }],
          countries: ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan', 'Ethiopia', 'Somalia']
        };
        setSystemData(updatedSystemData);
        localStorage.setItem('spendy_systemdata', JSON.stringify(updatedSystemData));
      }

      showToast(`Welcome back, ${user.firstName}!`, 'success');
    } catch (error: any) {
      console.error('Login error:', error);
      showToast(error.message || 'Invalid credentials', 'error');
    }
  };
  
  const handleSignUp = async (data: SignUpData) => {
    try {
      // Clear old company data before creating new account
      localStorage.removeItem('spendy_events');
      localStorage.removeItem('spendy_wallets');
      localStorage.removeItem('spendy_expenses');
      localStorage.removeItem('spendy_transactions');
      localStorage.removeItem('spendy_users');
      localStorage.removeItem('spendy_systemdata');
      localStorage.removeItem('spendy_products');
      localStorage.removeItem('spendy_suppliers');
      // Invoices are now stored in database, no need to remove from localStorage

      // Call backend API
      const { authAPI } = await import('./services/backendAPI');
      const response = await authAPI.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        country: data.country,
        companyName: data.companyName
      });

      const { user, accessToken, refreshToken } = response.data;

      console.log('📝 [Signup] New company created:', user.companyId);
      console.log('👤 [Signup] Admin user created:', user.email);

      // Store token, refresh token, and user data
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');

      // Convert backend user to app user format
      const appUser: User = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: data.phone,
        country: data.country,
        role: user.role as UserRole,
        status: 'Active',
        modulesAssigned: ['All'],
        createdAt: new Date().toISOString(),
        companyId: user.companyId,
        companyName: user.companyName,
        isAdmin: true,
        password: ''
      };

      // Initialize fresh account state
      setCurrentUser(appUser);
      setIsAuthenticated(true);

      // Fetch wallets from backend
      try {
        const { walletAPI } = await import('./services/backendAPI');
        const walletsResponse = await walletAPI.getAll();
        console.log('📥 Fetched wallets from backend after signup:', walletsResponse);

        // Handle the API response structure
        const walletsData = Array.isArray(walletsResponse.data)
          ? walletsResponse.data
          : ((walletsResponse as any).data?.data || []);

        setWallets(walletsData);
        localStorage.setItem('spendy_wallets', JSON.stringify(walletsData));
      } catch (walletError) {
        console.error('Error fetching wallets after signup:', walletError);
        // Set empty array if fetch fails
        setWallets([]);
      }

      // Fetch events from backend (will be empty for new companies)
      try {
        const { eventAPI } = await import('./services/backendAPI');
        const eventsResponse = await eventAPI.getAll();
        console.log('📥 Fetched events from backend after signup:', eventsResponse);

        const eventsData = Array.isArray(eventsResponse.data)
          ? eventsResponse.data
          : ((eventsResponse as any).data?.data || []);

        setEvents(eventsData);
        localStorage.setItem('spendy_events', JSON.stringify(eventsData));
      } catch (eventError) {
        console.error('Error fetching events after signup:', eventError);
        setEvents([]);
      }

      // Fetch users from backend (should just be the admin user for new company)
      try {
        const { userAPI } = await import('./services/backendAPI');
        const usersResponse = await userAPI.getAll();
        console.log('📥 Fetched users from backend after signup:', usersResponse);

        const usersData = Array.isArray(usersResponse.data)
          ? usersResponse.data
          : ((usersResponse as any).data?.data || []);

        const appUsers = usersData.map((u: any) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone || '',
          country: u.country || '',
          role: u.role,
          status: u.status || 'Active',
          modulesAssigned: u.modulesAssigned || [],
          profileImage: u.profileImage,
          createdAt: u.createdAt || new Date().toISOString(),
          companyId: user.companyId,
          companyName: user.companyName,
          isAdmin: u.role === 'Admin',
          password: ''
        }));

        setUsers(appUsers);
        localStorage.setItem('spendy_users', JSON.stringify(appUsers));
      } catch (userError) {
        console.error('Error fetching users after signup:', userError);
        setUsers([appUser]);
      }

      setExpenses([]);
      setTransactions([]);
      approvalsCtrl.clearRequests();
      setActivityLog([]);
      setSuppliers([]);
      setInventory([]);
      paymentCtrl.clearPayments();

      // Seed default categories for the new company
      let seededCategories = {
        event: [] as any[], activation: [] as any[], expense: [] as any[],
        operation: [] as any[], supplier: [] as any[], inventory: [] as any[],
      };
      try {
        const { seedDefaultCategories } = await import('./features/system-setup/api');
        seededCategories = await seedDefaultCategories();
      } catch (seedError) {
        console.error('Error seeding default categories:', seedError);
      }

      // Initialize fresh systemData with seeded categories
      const freshSystemData = {
        eventcategorys: seededCategories.event,
        activationcategorys: seededCategories.activation,
        expensecategorys: seededCategories.expense,
        operationcategorys: seededCategories.operation,
        suppliercategorys: seededCategories.supplier,
        wallettypes: [],
        inventorycategorys: seededCategories.inventory,
        clients: [{
          id: generateUUID(),
          itemNumber: 'CL001',
          name: data.companyName,
          contactPerson: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          brands: [],
          status: 'Active',
          dateCreated: new Date().toISOString().split('T')[0]
        }],
        countries: ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan', 'Ethiopia', 'Somalia']
      };

      setSystemData(freshSystemData);
      localStorage.setItem('spendy_systemdata', JSON.stringify(freshSystemData));

      showToast('Account created successfully! Default categories have been set up.', 'success');
    } catch (error: any) {
      console.error('Registration error:', error);
      showToast(error.message || 'Failed to create account', 'error');
    }
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentPage('dashboard');

    // Clear authentication tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');

    // Clear all data to prevent cross-company contamination
    localStorage.removeItem('spendy_events');
    localStorage.removeItem('spendy_wallets');
    localStorage.removeItem('spendy_expenses');
    localStorage.removeItem('spendy_transactions');
    localStorage.removeItem('spendy_users');
    localStorage.removeItem('spendy_systemdata');
    localStorage.removeItem('spendy_products');
    localStorage.removeItem('spendy_suppliers');
    localStorage.removeItem('spendy_invoices');

    showToast('Logged out successfully', 'success');
  };
  // Helper function to update approver event access
  const updateApproverEventAccess = (projectLeadName: string, eventId: string, eventName: string, isAdding: boolean = true) => {
    const updatedUsers = updateApproverEventAccessRule(users, projectLeadName, eventId, eventName, isAdding);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  // Event handlers
  const handleAddEvent = async (eventData: Partial<Event>) => {
    try {
      const newEvent = await addEventToFeature(eventData);
      /*
      const response = await eventAPI.create({
        name: eventData.name || '',
        type: eventData.type || 'Event',
        category: eventData.category || '',
        client: eventData.client || '',
        brand: eventData.brands?.[0] || '',
        projectLeadId: eventData.projectLead || '', // projectLead field now contains the user ID from the form
        budget: eventData.budget || 0,
        spent: 0,
        startDate: eventData.startDate || '',
        endDate: eventData.endDate || '',
        status: 'Planning',
        location: eventData.location,
        documents: []
      });

      console.log('📥 Event created in backend:', response.data);

      // Update local state with backend response
      const newEvent = response.data;
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      localStorage.setItem('spendy_events', JSON.stringify(updatedEvents));
      */

      // Update approver event access if project lead is an approver
      if (newEvent.projectLead) {
        const projectLeadName = `${newEvent.projectLead.firstName} ${newEvent.projectLead.lastName}`;
        updateApproverEventAccess(projectLeadName, newEvent.id, newEvent.name, true);
      }

      addActivityLog(`Event created: ${newEvent.name}`, `Created new ${newEvent.type} event with budget KES ${newEvent.budget.toLocaleString()} (Event ID: ${newEvent.id})`);
      showToast('Event created successfully', 'success');
      handleCloseModal();
    } catch (error: any) {
      console.error('Error creating event:', error);
      showToast(error.message || 'Failed to create event', 'error');
    }
  };
  const handleEditEvent = async (eventId: string, eventData: Partial<Event>) => {
    try {
      const currentEvent = events.find(e => e.id === eventId);
      const updatedEvent = await updateEventInFeature(eventId, eventData);

      /*
      // Map projectLead field (which contains user ID) to projectLeadId for the API
      const apiData: any = { ...eventData };
      if (eventData.projectLead) {
        apiData.projectLeadId = eventData.projectLead;
        delete apiData.projectLead;
      }

      // Call backend API to update event
      const { eventAPI } = await import('./services/backendAPI');
      const response = await eventAPI.update(eventId, apiData);

      console.log('📥 Event updated in backend:', response.data);

      // Update local state with backend response
      const updatedEvent = response.data;
      const updatedEvents = events.map(e => e.id === eventId ? updatedEvent : e);
      setEvents(updatedEvents);
      localStorage.setItem('spendy_events', JSON.stringify(updatedEvents));
      */

      // Update approver event access if project lead changed
      const newProjectLeadId = eventData.projectLead;
      if (newProjectLeadId && currentEvent && (currentEvent.projectLeadId as any) !== newProjectLeadId) {
        // Remove old approver's access
        if (currentEvent.projectLead) {
          const oldProjectLeadName = `${currentEvent.projectLead.firstName} ${currentEvent.projectLead.lastName}`;
          updateApproverEventAccess(oldProjectLeadName, eventId, currentEvent.name, false);
        }
        // Add new approver's access
        if (updatedEvent.projectLead) {
          const newProjectLeadName = `${updatedEvent.projectLead.firstName} ${updatedEvent.projectLead.lastName}`;
          updateApproverEventAccess(newProjectLeadName, eventId, currentEvent.name, true);
        }
      }

      showToast('Event updated successfully', 'success');
      handleCloseModal();
    } catch (error: any) {
      console.error('Error updating event:', error);
      showToast(error.message || 'Failed to update event', 'error');
    }
  };
  
  const handleArchiveEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to archive this event? Archived events cannot have new expenses created.')) {
      try {
        await archiveEventInFeature(eventId);
        /*
        // Call backend API to update event status
        const { eventAPI } = await import('./services/backendAPI');
        const response = await eventAPI.update(eventId, { status: 'Archived' });

        console.log('📥 Event archived in backend:', response.data);

        // Update local state with backend response
        const updatedEvent = response.data;
        const updatedEvents = events.map(e => e.id === eventId ? updatedEvent : e);
        setEvents(updatedEvents);
        localStorage.setItem('spendy_events', JSON.stringify(updatedEvents));
        */
        showToast('Event archived successfully', 'success');

        // Navigate back to events list if currently viewing the archived event
        if (currentPage === 'event-detail' && selectedId === eventId) {
          handleNavigate('events');
        }
      } catch (error: any) {
        console.error('Error archiving event:', error);
        showToast(error.message || 'Failed to archive event', 'error');
      }
    }
  };

  const handleUpdateEventStatus = async (eventId: string, newStatus: string) => {
    try {
      const updatedEvent = await updateEventStatusInFeature(eventId, newStatus);
      /*
      console.log(`🔄 Updating event ${eventId} status to: ${newStatus}`);

      // Call backend API to update event status
      const { eventAPI } = await import('./services/backendAPI');
      const response = await eventAPI.update(eventId, { status: newStatus });

      console.log('📥 Event status updated in backend:', response.data);

      // Update local state with backend response
      const updatedEvent = response.data;
      const updatedEvents = events.map(e => e.id === eventId ? updatedEvent : e);
      setEvents(updatedEvents);
      localStorage.setItem('spendy_events', JSON.stringify(updatedEvents));
      */

      showToast(`Event status updated to ${newStatus}`, 'success');
      addActivityLog('Event status updated', `Changed event status to ${newStatus} for "${updatedEvent.name}"`);
    } catch (error: any) {
      console.error('Error updating event status:', error);
      showToast(error.message || 'Failed to update event status', 'error');
    }
  };

  const handleAddEventCategory = (category: string) => {
    const updatedSystemData = {
      ...systemData,
      eventcategorys: [
        ...(systemData.eventcategorys || []),
        { id: generateUUID(), name: category, status: 'Active', dateCreated: new Date().toISOString() }
      ]
    };
    setSystemData(updatedSystemData);
    localStorage.setItem('spendy_systemData', JSON.stringify(updatedSystemData));
    showToast(`Event category "${category}" added successfully`, 'success');
  };

  const handleAddActivationCategory = (category: string) => {
    const updatedSystemData = {
      ...systemData,
      activationcategorys: [
        ...(systemData.activationcategorys || []),
        { id: generateUUID(), name: category, status: 'Active', dateCreated: new Date().toISOString() }
      ]
    };
    setSystemData(updatedSystemData);
    localStorage.setItem('spendy_systemData', JSON.stringify(updatedSystemData));
    showToast(`Activation category "${category}" added successfully`, 'success');
  };

  const handleAddOperationCategory = (category: string) => {
    const updatedSystemData = {
      ...systemData,
      operationcategorys: [
        ...(systemData.operationcategorys || []),
        { id: generateUUID(), name: category, status: 'Active', dateCreated: new Date().toISOString() }
      ]
    };
    setSystemData(updatedSystemData);
    localStorage.setItem('spendy_systemData', JSON.stringify(updatedSystemData));
    showToast(`Operation category "${category}" added successfully`, 'success');
  };

  const handleAddClient = (client: Record<string, unknown>) => {
    const updatedSystemData = {
      ...systemData,
      clients: [
        ...(systemData.clients || []),
        { 
          id: generateUUID(), 
          name: client.name, 
          contactPerson: client.contactPerson,
          email: client.email,
          phone: client.phone,
          brands: [],
          status: 'Active', 
          dateCreated: new Date().toISOString() 
        }
      ]
    };
    setSystemData(updatedSystemData);
    localStorage.setItem('spendy_systemData', JSON.stringify(updatedSystemData));
    showToast(`Client "${client.name}" added successfully`, 'success');
  };

  const handleAddBrand = (clientId: string, brand: string) => {
    const updatedSystemData = {
      ...systemData,
      clients: (systemData.clients || []).map((c: Record<string, unknown>) => {
        const clientObj = c as { id?: string; brands?: string[]; [k: string]: unknown };
        return clientObj.id === clientId ? { ...clientObj, brands: [...(clientObj.brands || []), brand] } : clientObj;
      })
    };
    setSystemData(updatedSystemData);
    localStorage.setItem('spendy_systemData', JSON.stringify(updatedSystemData));
    showToast(`Brand "${brand}" added successfully`, 'success');
  };

  const handleAddWallet = (walletData: Partial<Wallet>) => {
    const walletId = generateUUID();
    const newWallet: Wallet = {
      id: walletId,
      name: walletData.name || '',
      type: walletData.type || 'Event Wallet',
      balance: Number(walletData.balance) || 0,
      linkedEvent: walletData.linkedEvent,
      status: 'Active',
      createdAt: new Date().toISOString().slice(0, 16),
      isDefault: false
    };
    setWallets([...wallets, newWallet]);
    addActivityLog(`Wallet created: ${newWallet.name}`, `Created new wallet with balance KES ${newWallet.balance.toLocaleString()} (Wallet ID: ${walletId})`);
    showToast('Wallet created successfully', 'success');
    handleCloseModal();
  };
  
  const handleDeleteWallet = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (wallet?.isDefault) {
      showToast('Cannot delete default wallets', 'error');
      return;
    }
    if (window.confirm('Are you sure you want to delete this wallet?')) {
      setWallets(wallets.filter(w => w.id !== walletId));
      showToast('Wallet deleted successfully', 'success');
    }
  };

  const handleEditWallet = (updatedWallet: Wallet) => {
    if (updatedWallet.isDefault) {
      showToast('Cannot edit default wallets', 'error');
      return;
    }
    setWallets(wallets.map(w => w.id === updatedWallet.id ? updatedWallet : w));
    showToast('Wallet updated successfully', 'success');
  };

  const handleConnectWallet = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    const event = events.find(e => e.id === selectedId);
    
    if (!wallet || !event) return;

    const updatedWallet = { ...wallet, linkedEvent: event.id };
    setWallets(wallets.map(w => w.id === walletId ? updatedWallet : w));
    
    addActivityLog(
      'connected_wallet',
      `Connected wallet "${wallet.name}" to event "${event.name}"`
    );
    
    showToast(`Wallet "${wallet.name}" connected to event "${event.name}"`, 'success');
    handleCloseModal();
  };

  const handleUploadDocument = (documentData: { title: string; category: string; fileName: string; eventId: string }) => {
    const event = events.find(e => e.id === documentData.eventId);
    if (!event) return;

    const documentName = buildEventDocumentName(documentData.title, documentData.fileName);
    uploadEventDocument(documentData.eventId, documentName);
    
    addActivityLog(
      'document_uploaded',
      `Uploaded document "${documentData.title}" to event "${event.name}"`
    );
    
    showToast('Document uploaded successfully', 'success');
    handleCloseModal();
  };

  const handleAddExpense = async (expenseData: Partial<Expense>) => {
    // For Operations with no linked event (department-only), skip event lookup
    const event = expenseData.eventId ? events.find(e => e.id === expenseData.eventId) : undefined;
    const eventType = event?.type || (expenseData.expenseType === 'Operational Expense' ? 'Operation' : '');

    const companyWallets = wallets.filter(w => w.companyId === currentUser?.companyId);
    let targetWallet = undefined as (typeof companyWallets[number]) | undefined;


    // Determine wallet based on event type
    if (eventType === 'Operation') {
      targetWallet = companyWallets.find(w => w.type === 'Operations');
    } else if (eventType === 'Activation') {
      targetWallet = companyWallets.find(w => w.type === 'Activation') ||
                     companyWallets.find(w => w.type === 'Events');
    } else if (eventType === 'Event') {
      targetWallet = companyWallets.find(w => w.type === 'Events' && w.linkedEvent === expenseData.eventId) ||
                     companyWallets.find(w => w.type === 'Events');
    }

    // Fallback: any available company wallet
    if (!targetWallet) {
      targetWallet = companyWallets.find(w => w.type === 'Main') ||
                     companyWallets.find(w => w.type === 'Events') ||
                     companyWallets.find(w => w.type === 'Operations');
    }

    // For Staff and Store Manager, allow expense creation without wallet assignment
    // Admin/Approver will select the wallet during approval
    const isRestrictedUser = currentUser && (currentUser.role === 'Staff' || currentUser.role === 'Store Manager');

    if (!targetWallet && !isRestrictedUser) {
      // Only block admins from creating expenses without wallets
      console.error(`❌ [Add Expense] NO WALLET FOUND! Company wallets:`, companyWallets);
      showToast('No wallet available for this expense. Please contact admin to create company wallets.', 'error');
      return;
    }

    if (targetWallet) {
      console.log(`✅ [Add Expense] Using company wallet: ${targetWallet.name} (${targetWallet.type})`);
    } else {
      console.log(`📝 [Add Expense] Staff expense - wallet will be assigned during approval`);
    }

    // Prepare expense data for backend
    // IMPORTANT: ALL expenses MUST require approval by Admin or Approver
    let newExpense: Expense = {
      id: '', // Backend will generate the ID
      title: expenseData.title || '',
      eventId: expenseData.eventId || '',
      eventName: event?.name || '',
      walletId: targetWallet?.id || '',
      category: expenseData.category || '',
      client: event?.client || '',
      amount: Number(expenseData.amount) || 0,
      budget: event?.budget || 0,
      createdBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown',
      startDate: expenseData.startDate || new Date().toISOString().slice(0, 16),
      dueDate: expenseData.dueDate || '',
      status: 'Pending', // Always set to Pending - ALL expenses need approval
      description: expenseData.description,
      supplier: expenseData.supplier,
      supplierCategory: expenseData.supplierCategory,
      expenseType: expenseData.expenseType,
      createdByUserId: currentUser?.id || '',
      createdByRole: currentUser?.role || 'Staff',
      approvalRequired: true, // Always require approval
      approvalStatus: 'pending', // Always pending until approved
      paymentRequestType: expenseData.paymentRequestType || 'single',
      batchPaymentDetails: expenseData.batchPaymentDetails || []
    };

    // Enforce approval workflow for Staff and Store Manager roles
    // They MUST have their expenses submitted for approval (Pending status, approvalRequired=true)
    if (currentUser && (currentUser.role === 'Staff' || currentUser.role === 'Store Manager')) {
      newExpense = enforceApprovalWorkflow(newExpense, currentUser);
    }

    // Create expense via backend API
    try {
      console.log('[Add Expense] Creating expense via backend API...');
      const createdExpense = await expenseService.createExpense(newExpense);
      console.log('[Add Expense] Backend API success, expense created:', createdExpense.id);

      // Update local state with the expense from backend
      setExpenses([...expenses, createdExpense]);

      addActivityLog(
        `Expense added: ${createdExpense.title}`,
        `Added ${createdExpense.category} expense of KES ${createdExpense.amount.toLocaleString()} to ${event?.name} (Event ID: ${event?.id}, Wallet: ${targetWallet ? targetWallet.name : 'To be assigned during approval'}, Expense ID: ${createdExpense.id})`
      );

      // Use the backend-created expense for the rest of the logic
      newExpense = createdExpense;

      // Show transient toast for new expense needing approval
      if (newExpense.approvalRequired && newExpense.status === 'Pending') {
        showToast(`${newExpense.title} is awaiting approval`, 'info');
      }

      // If needs approval, create a request
      if (newExpense.approvalRequired && newExpense.status === 'Pending') {
        const requestId = generateUUID();
        const isBulkPayment = expenseData.paymentRequestType === 'bulk' || newExpense.expenseRequestType === 'batch';
        const requestName = isBulkPayment ? `${newExpense.title} (batch expense)` : newExpense.title;

        // Convert batch expense data to batch payment details format for requests
        let batchPaymentDetails: Array<{
          name: string;
          idNumber: string;
          phone?: string;
          paybillNumber?: string;
          accountNumber?: string;
          tillNumber?: string;
          amount: number;
          reference: string;
          paymentMethod: 'mpesa' | 'paybill' | 'till';
        }> = [];

        // Handle new batch expense format (batchCategories and csvData)
        if (newExpense.expenseRequestType === 'batch') {
          // Convert batchCategories to batchPaymentDetails
          if (newExpense.batchCategories) {
            newExpense.batchCategories.forEach(category => {
              category.items.forEach(item => {
                batchPaymentDetails.push({
                  name: item.recipientName,
                  idNumber: item.idNumber || '',
                  phone: item.paymentMethod === 'sendMoney' ? item.phoneNumber : undefined,
                  paybillNumber: item.paymentMethod === 'paybill' ? item.paybillNumber : undefined,
                  accountNumber: item.paymentMethod === 'paybill' ? item.accountNumber : undefined,
                  tillNumber: item.paymentMethod === 'buyGoods' ? item.tillNumber : undefined,
                  amount: item.amount,
                  reference: item.reference,
                  paymentMethod: convertPaymentMethod(item.paymentMethod)
                });
              });
            });
          }

          // Convert csvData to batchPaymentDetails
          if (newExpense.csvData) {
            newExpense.csvData.forEach(item => {
              batchPaymentDetails.push({
                name: item.recipientName,
                idNumber: '', // csvData doesn't have idNumber field
                phone: item.paymentMethod === 'sendMoney' ? item.phonePaybillTill : undefined,
                paybillNumber: item.paymentMethod === 'paybill' ? item.phonePaybillTill : undefined,
                accountNumber: item.accountNumber,
                tillNumber: item.paymentMethod === 'buyGoods' ? item.phonePaybillTill : undefined,
                amount: item.amount,
                reference: item.reference,
                paymentMethod: convertPaymentMethod(item.paymentMethod)
              });
            });
          }

          // Convert expenses array to batchPaymentDetails
          if (newExpense.expenses) {
            newExpense.expenses.forEach(expense => {
              batchPaymentDetails.push({
                name: expense.recipientName,
                idNumber: expense.idNumber || '',
                phone: expense.paymentMethod === 'sendMoney' ? expense.phoneNumber : undefined,
                paybillNumber: expense.paymentMethod === 'paybill' ? expense.paybillNumber : undefined,
                accountNumber: expense.paymentMethod === 'paybill' ? expense.accountNumber : undefined,
                tillNumber: expense.paymentMethod === 'buyGoods' ? expense.tillNumber : undefined,
                amount: expense.amount,
                reference: expense.reference,
                paymentMethod: convertPaymentMethod(expense.paymentMethod)
              });
            });
          }
        }

        // Handle legacy bulk payment format
        if (expenseData.batchPaymentDetails && expenseData.batchPaymentDetails.length > 0) {
          batchPaymentDetails = expenseData.batchPaymentDetails;
        }

        // Calculate total amount for batch expenses
        const totalAmount = batchPaymentDetails.reduce((sum, item) => sum + item.amount, 0);

        const newRequest: Request = {
          id: requestId,
          type: (event?.type || 'Event') as EventType,
          name: requestName,
          category: newExpense.category,
          eventId: event?.id,
          amount: newExpense.amount,
          totalAmount: isBulkPayment ? totalAmount : newExpense.amount,
          description: newExpense.description || '',
          requestedBy: newExpense.createdBy,
          dateRequested: newExpense.startDate,
          status: 'Pending',
          expenseId: newExpense.id,
          supplier: expenseData.supplier,
          supplierCategory: expenseData.supplierCategory,
          paymentRequestType: newExpense.expenseRequestType === 'batch' ? 'bulk' : expenseData.paymentRequestType || 'single',
          expenseRequestType: newExpense.expenseRequestType === 'batch' ? 'batch' : 'single',
          batchPaymentDetails: batchPaymentDetails
        };
        setRequests([...requests, newRequest]);
      }
      // Update event spent only if expense is already approved
      if (event && newExpense.status === 'Approved') {
        await handleEditEvent(event.id, {
          spent: event.spent + newExpense.amount
        });
      }
      showToast('Expense added successfully', 'success');
      handleCloseModal();
    } catch (error) {
      console.error('[Add Expense] Failed to create expense:', error);
      showToast('Failed to create expense. Please try again.', 'error');
    }
  };
  
  const handleMakePayment = (paymentData: Partial<Payment>) => {
    // Check if this is an external payment (outside platform)
    if (paymentData.type === 'M-Pesa') {
      // Find Main Wallet
      const mainWallet = wallets.find(w => w.type === 'Main Wallet');
      
      if (!mainWallet) {
        showToast('Main Wallet not found. Please contact support.', 'error');
        return;
      }
      
      const paymentAmount = paymentData.amount || 0;
      
      // Check if sufficient balance
      if (mainWallet.balance < paymentAmount) {
        showToast(`Insufficient balance in Main Wallet. Balance: KES ${mainWallet.balance.toLocaleString()}, Required: KES ${paymentAmount.toLocaleString()}`, 'error');
        // Open fund wallet modal
        handleOpenModal('fund-wallet');
        return;
      }
      
      // Deduct from Main Wallet
      setWallets(wallets.map(w => 
        w.id === mainWallet.id 
          ? { ...w, balance: w.balance - paymentAmount }
          : w
      ));
      
      // Create debit transaction in Main Wallet
      createTransaction(mainWallet.id, 'Withdrawal', paymentAmount, paymentData.recipient || 'External Payment');
    }
    
    // Create payment record
    const paymentId = generateUUID();
    const newPayment: Payment = {
      id: paymentId,
      eventId: paymentData.eventId || '',
      eventName: paymentData.eventName || '',
      expenseId: paymentData.expenseId,
      initiatedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown',
      recipient: paymentData.recipient || '',
      amount: paymentData.amount || 0,
      mpesaCode: paymentData.mpesaCode,
      type: paymentData.type || 'M-Pesa',
      status: paymentData.status || 'Completed',
      dateTime: new Date().toISOString(),
      description: paymentData.description || ''
    };
    
    setPayments([...payments, newPayment]);
    
    // If tied to an approved expense request, mark it completed so it leaves the ready-for-payment list
    if (newPayment.expenseId) {
      const updatedRequests = requests.map(r => r.expenseId === newPayment.expenseId ? {
        ...r,
        status: 'Completed' as RequestStatus,
        processedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown',
        dateProcessed: new Date().toISOString().split('T')[0]
      } : r);
      setRequests(updatedRequests);
      localStorage.setItem('spendy_requests', JSON.stringify(updatedRequests));

      const updatedExpenses = expenses.map(e => e.id === newPayment.expenseId ? {
        ...e,
        status: 'Completed' as RequestStatus
      } : e);
      setExpenses(updatedExpenses);
      localStorage.setItem('spendy_expenses', JSON.stringify(updatedExpenses));
      
      // If the expense/request is related to a supplier, approve the supplier payment
      const relatedRequest = requests.find(r => r.expenseId === newPayment.expenseId);
      const relatedExpense = expenses.find(e => e.id === newPayment.expenseId);
      const supplierName = relatedRequest?.supplier || relatedExpense?.supplier;
      
      if (supplierName) {
        const updatedSuppliers = suppliers.map(s =>
          s.name === supplierName ? {
            ...s,
            paymentStatus: 'Completed' as const
          } : s
        );
        setSuppliers(updatedSuppliers);

        // TODO: Sync supplier paymentStatus update to database

        addActivityLog(
          'Supplier payment approved',
          `Supplier ${supplierName} payment approved via expense payment - KES ${newPayment.amount.toLocaleString()}`
        );
      }
    }
    
    const event = events.find(e => e.id === newPayment.eventId);
    addActivityLog(`Payment made: ${newPayment.recipient}`, `Processed payment of KES ${newPayment.amount.toLocaleString()} via ${newPayment.type} for ${event?.name || 'event'} (Event ID: ${event?.id || newPayment.eventId}, Payment ID: ${paymentId})`);

    // Update event spent amount when payment is made
    if (event) {
      addEventSpend(event.id, newPayment.amount);
    }

    showToast('Payment processed successfully', 'success');
    handleCloseModal();
  };

  const handlePayExpense = async (expenseId: string, walletId: string) => {
    try {
      console.log('[Pay Expense] Paying expense via backend API:', expenseId, 'from wallet:', walletId);

      // Call backend API to pay the expense
      await expenseService.completeExpense(expenseId, walletId);
      console.log('[Pay Expense] Backend API success - expense marked as paid');

      // Refresh expenses from backend to get updated status
      const updatedExpenses = await expenseService.getAllExpenses();
      setExpenses(updatedExpenses);
      localStorage.setItem('spendy_expenses', JSON.stringify(updatedExpenses));

      // Refresh wallets from backend to get updated balances
      await walletCtrl.refreshWallets();
    } catch (error) {
      console.error('[Pay Expense] Failed to pay expense:', error);
      throw error;
    }
  };

  const handleAddSupplier = async (supplierData: Partial<Supplier>) => {
    try {
      console.log('💾 [Supplier] Saving supplier to database:', supplierData.name);

      // Prepare supplier data with defaults
      const newSupplierData: Partial<Supplier> = {
        name: supplierData.name || '',
        category: supplierData.category || '',
        contactPerson: supplierData.contactPerson || '',
        phone: supplierData.phone || '',
        email: supplierData.email || '',
        status: 'Active',
        paymentStatus: 'Pending',
        paymentMethod: supplierData.paymentMethod,
        servicesProvided: supplierData.servicesProvided,
        amount: supplierData.amount,
        event: supplierData.event,
        approvalRequired: supplierData.approvalRequired !== false,
        mpesaPhone: supplierData.mpesaPhone,
        paybillNumber: supplierData.paybillNumber,
        paybillAccount: supplierData.paybillAccount,
        tillNumber: supplierData.tillNumber,
        bankName: supplierData.bankName,
        accountName: supplierData.accountName,
        accountNumber: supplierData.accountNumber,
        branchName: supplierData.branchName,
        swiftCode: supplierData.swiftCode,
        businessType: supplierData.businessType,
        kraPin: supplierData.kraPin,
        documents: supplierData.documents || []
      };

      // Save supplier to database
      const savedSupplier = await supplierService.createSupplier(newSupplierData as any);

      // Update local state with the saved supplier
      const updatedSuppliers = [...suppliers, savedSupplier as any];
      setSuppliers(updatedSuppliers);

      console.log('✅ [Supplier] Supplier saved to database successfully');

      addActivityLog(
        'Supplier added',
        `Added supplier: ${savedSupplier.name} (Category: ${savedSupplier.category}, ID: ${savedSupplier.id})`
      );
      showToast('Supplier added successfully', 'success');
      handleCloseModal();
    } catch (error) {
      console.error('❌ [Supplier] Failed to save supplier to database:', error);
      showToast('Failed to add supplier. Please try again.', 'error');
    }
  };
  const handlePaySupplier = (paymentData: { supplierId: string; supplierName: string; amount: number; initiatedBy: string; walletId?: string; walletName?: string; eventId?: string; description?: string; event?: string; }) => {
    const supplier = suppliers.find(s => s.id === paymentData.supplierId);
    if (!supplier) return;

    // Enforce approval requirement if set on supplier
    if (supplier.approvalRequired !== false) {
      // Create approval request for supplier payment
      const newRequest: Request = {
        id: generateUUID(),
        type: 'Operation',
        name: `Supplier Payment: ${paymentData.supplierName}`,
        category: 'Supplier Payment',
        eventId: paymentData.eventId || supplier.event,
        amount: paymentData.amount,
        description: paymentData.description || `Payment for ${paymentData.supplierName} - ${supplier.category}`,
        requestedBy: paymentData.initiatedBy,
        dateRequested: new Date().toISOString(),
        status: 'Pending',
        supplier: paymentData.supplierName,
        supplierCategory: supplier.category
      };
      setRequests([...requests, newRequest]);

      addActivityLog(
        'Supplier payment approval requested',
        `${paymentData.initiatedBy} requested approval for supplier payment: ${paymentData.supplierName} - KES ${paymentData.amount?.toLocaleString()}`
      );
      showToast('Supplier payment sent for approval', 'success');
    } else {
      // Process payment immediately if approval not required
      // Deduct from wallet
      setWallets(wallets.map(w => w.id === paymentData.walletId ? {
        ...w,
        balance: w.balance - paymentData.amount
      } : w));

      // Update supplier status
      const updatedSuppliers = suppliers.map(s => s.id === paymentData.supplierId ? {
        ...s,
        paymentStatus: 'Completed' as const,
        amount: paymentData.amount,
        event: paymentData.event || s.event
      } : s);
      setSuppliers(updatedSuppliers);

      // TODO: Sync supplier status update to database

      // Create payment record
      const newPayment: Payment = {
        id: generateUUID(),
        eventId: supplier.event || 'N/A',
        eventName: supplier.event || 'N/A',
        initiatedBy: paymentData.initiatedBy,
        recipient: paymentData.supplierName,
        amount: paymentData.amount,
        type: 'M-Pesa',
        status: 'Completed',
        dateTime: new Date().toISOString(),
        description: paymentData.description || `Supplier payment to ${paymentData.supplierName}`
      };
      setPayments([...payments, newPayment]);

      addActivityLog(
        'Supplier payment processed',
        `Payment completed for ${paymentData.supplierName} - KES ${paymentData.amount?.toLocaleString()} from ${paymentData.walletName}`
      );
      showToast('Payment processed successfully', 'success');
    }
    
    handleCloseModal();
  };

  const handleEditSupplier = async (updatedSupplier: Supplier) => {
    try {
      console.log('💾 [Supplier] Updating supplier in database:', updatedSupplier.name);

      // Save supplier to database
      const savedSupplier = await supplierService.updateSupplier(updatedSupplier.id, updatedSupplier as any);

      if (savedSupplier) {
        // Update local state with the saved supplier
        const updatedSuppliers = suppliers.map(s => s.id === updatedSupplier.id ? savedSupplier as any : s);
        setSuppliers(updatedSuppliers);

        console.log('✅ [Supplier] Supplier updated in database successfully');

        addActivityLog(
          'Supplier updated',
          `Updated supplier: ${savedSupplier.name} (Category: ${savedSupplier.category}, ID: ${savedSupplier.id})`
        );
        showToast('Supplier updated successfully', 'success');
        handleCloseModal();
      }
    } catch (error) {
      console.error('❌ [Supplier] Failed to update supplier in database:', error);
      showToast('Failed to update supplier. Please try again.', 'error');
    }
  };

  // Invoice handlers
  const handleAddInvoice = async (invoiceData: any) => {
    const invoiceId = generateUUID();

    const newInvoice: Invoice = {
      id: invoiceId,
      ...invoiceData,
      createdBy: currentUser?.firstName + ' ' + currentUser?.lastName || 'Unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      companyId: currentUser?.companyName // CRITICAL: Company isolation
    };

    console.log('📝 [Invoice] Creating invoice for company:', currentUser?.companyName);

    // Auto-save line items as products for future reuse in the database
    if (invoiceData.lineItems && invoiceData.lineItems.length > 0) {
      const newProducts: Product[] = [];

      for (const item of invoiceData.lineItems) {
        // Check if this product already exists
        const existingProduct = products.find(p =>
          p.name.toLowerCase() === item.itemName.toLowerCase()
        );

        if (!existingProduct) {
          const newProduct: Product = {
            id: generateUUID(),
            name: item.itemName,
            description: item.description || '',
            category: 'General', // Default category
            unitPrice: item.unitPrice,
            taxRate: item.taxRate || 0,
            unit: 'piece', // Default unit
            stock: 0,
            sku: '',
            price: item.unitPrice,
            cost: 0,
            companyId: currentUser?.companyName || '',
            createdBy: currentUser?.firstName + ' ' + currentUser?.lastName || 'Unknown',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            status: 'Active'
          };

          console.log('💾 [Invoice] Auto-saving new product to database:', item.itemName);

          try {
            // Save to database
            const savedProduct = await productService.createProduct(newProduct);
            newProducts.push(savedProduct);
            console.log('✅ [Invoice] Product saved to database:', savedProduct.name);
          } catch (error) {
            console.error('❌ [Invoice] Failed to save product:', error);
            // Still add to local state as fallback
            newProducts.push(newProduct);
          }
        }
      }

      if (newProducts.length > 0) {
        setProducts([...products, ...newProducts]);
        console.log(`✅ [Invoice] Saved ${newProducts.length} new product(s) for reuse`);
      }
    }

    try {
      console.log('💾 [Invoice] Saving invoice to database:', invoiceData.invoiceNumber);

      // Save invoice to database
      const savedInvoice = await invoiceService.createInvoice(newInvoice);

      // Update local state with the saved invoice
      const updatedInvoices = [...invoices, savedInvoice];
      setInvoices(updatedInvoices);

      console.log('✅ [Invoice] Invoice saved to database successfully');

      addActivityLog(
        'Invoice created',
        `Created ${invoiceData.documentType}: ${invoiceData.invoiceNumber} for ${invoiceData.clientName} - ${invoiceData.currency} ${invoiceData.total.toLocaleString()}`
      );

      const statusMessage = invoiceData.status === 'Pending Approval'
        ? 'Invoice created and pending admin approval'
        : 'Invoice created successfully';
      showToast(statusMessage, 'success');
      handleCloseModal();
    } catch (error) {
      console.error('❌ [Invoice] Failed to save invoice to database:', error);
      showToast('Failed to create invoice. Please try again.', 'error');
      throw error; // Re-throw to be caught by modal's error handler
    }
  };

  const handleUpdateInvoice = async (invoiceId: string, updates: Partial<Invoice>) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    // Prepare updates with timestamp
    const updatedData = { ...updates, updatedAt: new Date().toISOString() };

    // Update status based on balance
    if (updatedData.balance === 0 && updatedData.status !== 'Cancelled') {
      updatedData.status = 'Paid';
      updatedData.paidAt = new Date().toISOString();
    } else if (updatedData.balance !== undefined && updatedData.balance > 0 && updatedData.total && updatedData.balance < updatedData.total) {
      updatedData.status = 'Partially Paid';
    }

    // Check for overdue
    if (updatedData.status !== 'Paid' && updatedData.status !== 'Cancelled' && updatedData.status !== 'Draft') {
      const dueDate = new Date(updatedData.dueDate || invoice.dueDate);
      const today = new Date();
      if (dueDate < today) {
        updatedData.status = 'Overdue';
      }
    }

    // Set sentAt timestamp when status changes to Sent
    if (updates.status === 'Sent' && !invoice.sentAt) {
      updatedData.sentAt = new Date().toISOString();
    }

    try {
      console.log('💾 [Invoice] Updating invoice in database:', invoice.invoiceNumber);

      // Save to database
      const savedInvoice = await invoiceService.updateInvoice(invoiceId, updatedData);

      if (savedInvoice) {
        // Update local state
        const updatedInvoices = invoices.map(inv =>
          inv.id === invoiceId ? savedInvoice : inv
        );
        setInvoices(updatedInvoices);

        console.log('✅ [Invoice] Invoice updated in database successfully');

        addActivityLog(
          'Invoice updated',
          `Updated invoice: ${savedInvoice.invoiceNumber} - Status: ${savedInvoice.status}`
        );
        showToast('Invoice updated successfully', 'success');
      }
    } catch (error) {
      console.error('❌ [Invoice] Failed to update invoice in database:', error);
      showToast('Failed to update invoice. Please try again.', 'error');
    }
  };

  const handleRecordPayment = (invoiceId: string, paymentData: any) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    const paymentId = generateUUID();
    const payment = {
      id: paymentId,
      ...paymentData,
    };

    const newAmountPaid = (invoice.amountPaid || 0) + paymentData.amount;
    const newBalance = invoice.total - newAmountPaid;

    const updatedInvoice = {
      ...invoice,
      payments: [...(invoice.payments || []), payment],
      amountPaid: newAmountPaid,
      balance: newBalance,
      updatedAt: new Date().toISOString(),
    };

    handleUpdateInvoice(invoiceId, updatedInvoice);

    addActivityLog(
      'Payment recorded',
      `Recorded payment of ${invoice.currency} ${paymentData.amount.toLocaleString()} for invoice ${invoice.invoiceNumber}`
    );
    showToast('Payment recorded successfully', 'success');
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    // Check if invoice has payments
    if ((invoice.amountPaid || 0) > 0) {
      alert('Cannot delete an invoice that has received payments. Please cancel the invoice instead.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      return;
    }

    try {
      console.log('🗑️ [Invoice] Deleting invoice from database:', invoice.invoiceNumber);

      // Delete from database
      const success = await invoiceService.deleteInvoice(invoiceId);

      if (success) {
        // Update local state
        const updatedInvoices = invoices.filter(inv => inv.id !== invoiceId);
        setInvoices(updatedInvoices);

        console.log('✅ [Invoice] Invoice deleted from database successfully');

        addActivityLog(
          'Invoice deleted',
          `Deleted invoice: ${invoice.invoiceNumber} for ${invoice.clientName}`
        );
        showToast('Invoice deleted successfully', 'success');
      }
    } catch (error) {
      console.error('❌ [Invoice] Failed to delete invoice from database:', error);
      showToast('Failed to delete invoice. Please try again.', 'error');
    }

    // Navigate back to invoices list
    handleNavigate('invoices');
  };

  const handleDuplicateInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    // Only allow duplicating Quotes
    if (invoice.documentType !== 'Quote') {
      showToast('Only Quotes can be duplicated', 'error');
      return;
    }

    const duplicateId = generateUUID();

    // Get document prefix based on type
    const docPrefix = invoice.documentType === 'Quote' ? 'QT' : invoice.documentType === 'Proforma' ? 'PF' : 'INV';

    // Find all documents of this type for this client
    const clientDocuments = invoices.filter(inv =>
      inv.clientId === invoice.clientId && inv.documentType === invoice.documentType
    );

    // Get the last document number for this client and document type
    const lastDocNumber = clientDocuments.length > 0
      ? Math.max(...clientDocuments.map(inv => {
          const match = inv.invoiceNumber.match(/(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        }))
      : 0;

    const nextNumber = (lastDocNumber + 1).toString().padStart(3, '0');
    const client = systemData.clients.find((c: any) => c.id === invoice.clientId);
    const clientPrefix = client ? client.name.substring(0, 3).toUpperCase() : 'CLI';
    const newInvoiceNumber = `${clientPrefix}-${docPrefix}-${nextNumber}`;

    const duplicateInvoice: Invoice = {
      ...invoice,
      id: duplicateId,
      invoiceNumber: newInvoiceNumber,
      status: currentUser?.role === 'Staff' ? 'Pending Approval' : 'Draft',
      amountPaid: 0,
      balance: invoice.total,
      payments: [],
      isDuplicate: true,
      duplicatedFrom: invoiceId,
      convertedFrom: undefined,
      convertedTo: undefined,
      createdBy: currentUser?.firstName + ' ' + currentUser?.lastName || 'Unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sentAt: undefined,
      paidAt: undefined,
      approvedBy: undefined,
      approvedAt: undefined,
    };

    const updatedInvoices = [...invoices, duplicateInvoice];
    setInvoices(updatedInvoices);
    localStorage.setItem('spendy_invoices', JSON.stringify(updatedInvoices));

    addActivityLog(
      'Quote duplicated',
      `Duplicated ${invoice.documentType} ${invoice.invoiceNumber} as ${newInvoiceNumber}`
    );
    showToast('Quote duplicated successfully', 'success');

    // Open the edit modal for the duplicated quote
    handleOpenModal('edit-invoice', duplicateInvoice as any);
  };

  const handleApproveInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice || invoice.status !== 'Pending Approval') return;

    handleUpdateInvoice(invoiceId, {
      status: 'Draft',
      approvedBy: currentUser?.firstName + ' ' + currentUser?.lastName || 'Unknown',
      approvedAt: new Date().toISOString(),
    });

    addActivityLog(
      'Invoice approved',
      `Approved invoice ${invoice.invoiceNumber} for ${invoice.clientName}`
    );
    showToast('Invoice approved successfully', 'success');
  };

  const handleRejectInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice || invoice.status !== 'Pending Approval') return;

    if (!window.confirm(`Are you sure you want to reject invoice ${invoice.invoiceNumber}? This will delete it.`)) {
      return;
    }

    const updatedInvoices = invoices.filter(inv => inv.id !== invoiceId);
    setInvoices(updatedInvoices);
    localStorage.setItem('spendy_invoices', JSON.stringify(updatedInvoices));

    addActivityLog(
      'Invoice rejected',
      `Rejected and deleted invoice ${invoice.invoiceNumber} for ${invoice.clientName}`
    );
    showToast('Invoice rejected and deleted', 'success');
  };

  const handleConvertQuote = (quoteId: string, targetType: 'Invoice' | 'Proforma') => {
    const quote = invoices.find(inv => inv.id === quoteId);
    if (!quote || quote.documentType !== 'Quote') {
      showToast('Only Quotes can be converted', 'error');
      return;
    }

    if (quote.convertedTo) {
      showToast('This Quote has already been converted', 'error');
      return;
    }

    const newDocId = generateUUID();

    // Get document prefix based on target type
    const docPrefix = targetType === 'Invoice' ? 'INV' : 'PF';

    // Find all documents of the target type for this client
    const clientDocuments = invoices.filter(inv =>
      inv.clientId === quote.clientId && inv.documentType === targetType
    );

    // Get the last document number for this client and document type
    const lastDocNumber = clientDocuments.length > 0
      ? Math.max(...clientDocuments.map(inv => {
          const match = inv.invoiceNumber.match(/(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        }))
      : 0;

    const nextNumber = (lastDocNumber + 1).toString().padStart(3, '0');
    const client = systemData.clients.find((c: any) => c.id === quote.clientId);
    const clientPrefix = client ? client.name.substring(0, 3).toUpperCase() : 'CLI';
    const newDocNumber = `${clientPrefix}-${docPrefix}-${nextNumber}`;

    // Create the new Invoice/Proforma from the Quote
    const convertedDoc: Invoice = {
      ...quote,
      id: newDocId,
      invoiceNumber: newDocNumber,
      documentType: targetType,
      status: currentUser?.role === 'Staff' ? 'Pending Approval' : 'Draft',
      convertedFrom: quoteId,
      convertedTo: undefined,
      isDuplicate: false,
      duplicatedFrom: undefined,
      createdBy: currentUser?.firstName + ' ' + currentUser?.lastName || 'Unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sentAt: undefined,
      paidAt: undefined,
      approvedBy: undefined,
      approvedAt: undefined,
    };

    // Update the original Quote to mark it as converted
    const updatedQuote = {
      ...quote,
      convertedTo: newDocId,
      updatedAt: new Date().toISOString(),
    };

    // Update invoices array
    const updatedInvoices = invoices.map(inv =>
      inv.id === quoteId ? updatedQuote : inv
    );
    updatedInvoices.push(convertedDoc);

    setInvoices(updatedInvoices);
    localStorage.setItem('spendy_invoices', JSON.stringify(updatedInvoices));

    addActivityLog(
      'Quote converted',
      `Converted Quote ${quote.invoiceNumber} to ${targetType} ${newDocNumber}`
    );
    showToast(`Quote converted to ${targetType} successfully`, 'success');
    handleNavigate('invoice-detail', newDocId);
  };

  // Product Handlers
  const handleAddProduct = (productData: Partial<Product>) => {
    const productId = generateUUID();

    const newProduct: Product = {
      id: productId,
      name: productData.name || '',
      description: productData.description || '',
      category: productData.category || 'General',
      unitPrice: productData.unitPrice || 0,
      taxRate: productData.taxRate || 0,
      sku: productData.sku,
      unit: productData.unit || 'piece',
      companyId: currentUser?.companyName || '',
      createdBy: currentUser?.firstName + ' ' + currentUser?.lastName || 'Unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);

    addActivityLog(
      'Product added',
      `Added product: ${newProduct.name} - ${newProduct.category}`
    );
    showToast('Product added successfully', 'success');

    console.log('✅ [Product] Added product:', newProduct.name);
  };

  const handleUpdateProduct = (productId: string, updates: Partial<Product>) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return product;
    });

    setProducts(updatedProducts);

    const product = updatedProducts.find(p => p.id === productId);
    if (product) {
      addActivityLog(
        'Product updated',
        `Updated product: ${product.name}`
      );
      showToast('Product updated successfully', 'success');
      console.log('✅ [Product] Updated product:', product.name);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (!window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      return;
    }

    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);

    addActivityLog(
      'Product deleted',
      `Deleted product: ${product.name}`
    );
    showToast('Product deleted successfully', 'success');
    console.log('🗑️ [Product] Deleted product:', product.name);
  };

  const handleAddInventory = async (inventoryData: Partial<InventoryItem>) => {
    try {
      const enrichedItem = await invCtrl.addInventoryItem(inventoryData);
      addActivityLog(
        'Inventory added',
        `Added inventory item: ${enrichedItem.name} (Quantity: ${enrichedItem.quantity}, Category: ${enrichedItem.category})`
      );
      showToast('Inventory item added successfully', 'success');
      handleCloseModal();
    } catch (error) {
      console.error('❌ [Inventory] Failed to save inventory item to database:', error);
      showToast('Failed to add inventory item. Please try again.', 'error');
    }
  };
  const handleEditInventory = async (itemId: string, itemData: Partial<InventoryItem>) => {
    try {
      const updatedItem = await invCtrl.updateInventoryItem(itemId, itemData as any);
      addActivityLog(
        'Inventory updated',
        `Updated inventory item: ${updatedItem.name}`
      );
      showToast('Inventory item updated successfully', 'success');
      handleCloseModal();
    } catch (error) {
      console.error('❌ [Inventory] Failed to update inventory item in database:', error);
      showToast('Failed to update inventory item. Please try again.', 'error');
    }
  };
  const handleCheckOut = (checkoutData: { itemId: string; quantity: number; checkoutDate?: string; event?: string; purpose?: string; eventId?: string; givenTo?: string; checkedOutTo?: string }) => {
    const item = inventory.find(i => i.id === checkoutData.itemId);
    if (!item) return;

    const quantityCheckedOut = Number(checkoutData.quantity) || 0;
    const availableQuantity = item.quantity - (item.checkedOut || 0);

    if (quantityCheckedOut > availableQuantity) {
      showToast(`Cannot checkout more items than available. Available: ${availableQuantity}`, 'error');
      return;
    }

    invCtrl.checkoutInventoryItem(checkoutData);

    addActivityLog(
      'Inventory checked out',
      `Checked out ${quantityCheckedOut} unit(s) of ${item.name} to ${checkoutData.givenTo || checkoutData.checkedOutTo || 'Unknown'} for event: ${checkoutData.event || 'N/A'}`
    );
    showToast('Item checked out successfully', 'success');
    handleNavigate('inventory');
  };
  const handleCheckIn = (checkinData: { itemId: string; quantity: number; checkinDate?: string; event?: string; notes?: string; eventId?: string; receivedFrom?: string; receivedBy?: string; condition?: InventoryItem['condition'] }) => {
    const item = inventory.find(i => i.id === checkinData.itemId);
    if (!item) return;

    const quantityCheckedIn = Number(checkinData.quantity) || 0;
    const checkedOutQuantity = item.checkedOut || 0;
    const condition = checkinData.condition || item.condition;

    // Validate that we're not checking in more than was checked out
    if (quantityCheckedIn > checkedOutQuantity) {
      showToast(`Cannot check in more items than were checked out. Checked out: ${checkedOutQuantity}`, 'error');
      return;
    }

    invCtrl.checkinInventoryItem(checkinData);

    addActivityLog(
      'Inventory checked in',
      `Checked in ${quantityCheckedIn} unit(s) of ${item.name}, Condition: ${condition}, Event: ${checkinData.event || 'N/A'}`
    );
    showToast('Item checked in successfully', 'success');
    handleNavigate('inventory');
  };

  const handleEditMovement = (id: string, data: Partial<Movement>) => {
    invCtrl.editInventoryMovement(id, data as any);
    showToast('Movement updated successfully', 'success');
    handleCloseModal();
  };
  const handleApproveRequest = async (walletId: string, category?: string, supplierId?: string, supplierName?: string) => {
    // Get the request - either from modalData or current page
    const request = modalData || requests.find(r => r.id === selectedId);
    if (!request) return;

    const reqAmount = typeof request.amount === 'number' ? request.amount : 0;
    const reqName = typeof request.name === 'string' ? request.name : 'Unknown';
    const reqType = typeof request.type === 'string' ? request.type : 'Unknown';

    // Use the provided category or fall back to the request's category
    const finalCategory = category || request.category;

    // Check if this is supplier assignment (admin only)
    if (supplierId && supplierName) {
      // Assign to supplier - no wallet deduction, just mark as approved with supplier
      const updatedRequests = requests.map(r => r.id === request.id ? {
        ...r,
        ...buildApproveRequestPatch(
          request.id,
          undefined,
          currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown',
          {
            dateProcessed: new Date().toISOString().split('T')[0],
            supplierId,
            supplierName,
          },
        ),
      } : r);
      setRequests(updatedRequests);
      localStorage.setItem('spendy_requests', JSON.stringify(updatedRequests));

      // Update related expense if it exists - CALL BACKEND API
      const relatedExpense = expenses.find(e => e.id === request.expenseId);
      if (relatedExpense) {
        try {
          console.log('[Supplier Assignment] Updating expense in backend:', request.expenseId);
          // Update the expense in the backend with supplier info
          await expenseService.updateExpense(request.expenseId as string, {
            supplier: supplierName,
            status: 'Approved'
          });
          console.log('[Supplier Assignment] Backend update successful');

          // Refresh expenses from backend
          const updatedExpensesFromBackend = await expenseService.getAllExpenses();
          setExpenses(updatedExpensesFromBackend);

          // Also update local state to include supplier metadata
          const updatedExpenses = updatedExpensesFromBackend.map(e =>
            e.id === request.expenseId
              ? { ...e, supplierId: supplierId }
              : e
          );
          setExpenses(updatedExpenses);
          console.log('[Supplier Assignment] Expenses refreshed from backend');
        } catch (error) {
          console.error('[Supplier Assignment] Backend API call failed:', error);
          showToast('Failed to assign expense to supplier. Please try again.', 'error');
          return;
        }
      }

      addActivityLog(`Request assigned to supplier`, `Assigned ${reqType} request "${reqName}" (KES ${reqAmount.toLocaleString()}) to supplier ${supplierName} for later payment`);
      showToast(`Request approved and assigned to ${supplierName}`, 'success');
      handleNavigate('approvals');
      return;
    }

    // Standard wallet-based approval
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return;

    // Check if this expense was created by a staff user
    const relatedExpense = expenses.find(e => e.id === request.expenseId);
    const isStaffExpense = relatedExpense && relatedExpense.createdByRole === 'Staff';
    const staffUserId = relatedExpense?.createdByUserId;

    // Debug logging
    console.log('[Approval] Related expense:', relatedExpense);
    console.log('[Approval] Is staff expense:', isStaffExpense);
    console.log('[Approval] Staff user ID:', staffUserId);
    console.log('[Approval] Created by role:', relatedExpense?.createdByRole);

    // Find staff user's wallet if this is a staff expense
    let staffWallet = null;
    if (isStaffExpense && staffUserId) {
      staffWallet = wallets.find(w => w.type === 'USER' && w.ownerId === staffUserId);
      console.log('[Approval] Staff wallet found:', staffWallet);
    } else {
      console.log('[Approval] No staff wallet - not a staff expense or missing userId');
    }

    // If there's a linked expense, call backend API to approve it
    if (request.expenseId && relatedExpense) {
      try {
        console.log('[Approval] Calling backend API to approve expense:', request.expenseId);
        await expenseService.approveExpense(request.expenseId as string, currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Admin');
        console.log('[Approval] Backend API call successful - expense approved and wallets updated');

        // Refresh wallets from backend to get updated balances
        await walletCtrl.refreshWallets();
      } catch (error) {
        console.error('[Approval] Backend API call failed:', error);
        showToast('Failed to approve expense. Please try again.', 'error');
        return;
      }
    } else {
      // Legacy path: no expense linked, use local wallet updates
      const updatedWallets = wallets.map(w => {
        if (w.id === walletId) {
          // Deduct from source wallet
          console.log(`[Approval] Deducting ${reqAmount} from source wallet ${w.name} (${w.id}). Old balance: ${w.balance}, New balance: ${w.balance - reqAmount}`);
          return { ...w, balance: w.balance - reqAmount };
        } else if (staffWallet && w.id === staffWallet.id) {
          // Credit to staff wallet
          console.log(`[Approval] Adding ${reqAmount} to staff wallet ${w.name} (${w.id}). Old balance: ${w.balance}, New balance: ${w.balance + reqAmount}`);
          return { ...w, balance: w.balance + reqAmount };
        }
        return w;
      });
      setWallets(updatedWallets);
      localStorage.setItem('spendy_wallets', JSON.stringify(updatedWallets));
      console.log('[Approval] Wallets updated locally (no expense linked)');
    }

    // Create transaction in appropriate wallet based on request type
    if (request.type === 'Operation') {
      // Route operational expenses to Operations Wallet
      createTransaction(walletId, 'Withdrawal', reqAmount, `Operation: ${reqName}`);
    } else if (request.type === 'Project' || request.type === 'Activation') {
      // Route event and activation expenses to Events Wallet
      createTransaction(walletId, 'Withdrawal', reqAmount, `${request.type}: ${reqName}`);
    } else {
      // Default withdrawal for other request types
      createTransaction(walletId, 'Withdrawal', reqAmount, reqName);
    }

    // If transferred to staff wallet, create credit transaction
    if (staffWallet) {
      const staffUser = users.find(u => u.id === staffUserId);
      const staffName = staffUser ? `${staffUser.firstName} ${staffUser.lastName}` : 'Staff User';
      createTransaction(staffWallet.id, 'Fund', reqAmount, staffName, wallet.name);
    }

    // Update request status
    const updatedRequests = requests.map(r => r.id === request.id ? {
      ...r,
      ...buildApproveRequestPatch(
        request.id,
        walletId,
        currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown',
        {
          category: finalCategory as string | undefined,
          dateProcessed: new Date().toISOString().split('T')[0],
        },
      ),
    } : r);
    setRequests(updatedRequests);
    localStorage.setItem('spendy_requests', JSON.stringify(updatedRequests));

    // Update activity log with staff wallet transfer info if applicable
    if (staffWallet) {
      const staffUser = users.find(u => u.id === staffUserId);
      const staffName = staffUser ? `${staffUser.firstName} ${staffUser.lastName}` : 'Staff';
      addActivityLog(`Request approved: ${reqName}`, `Approved ${reqType} request for KES ${reqAmount.toLocaleString()} from wallet ${wallet?.name}. Funds transferred to ${staffName}'s wallet.`);
    } else {
      addActivityLog(`Request approved: ${reqName}`, `Approved ${reqType} request for KES ${reqAmount.toLocaleString()} from wallet ${wallet?.name}`);
    }

    // Update expense if linked
    if (request.expenseId) {
      const updatedExpenses = expenses.map(e => e.id === request.expenseId ? {
        ...e,
        status: 'Approved' as RequestStatus
      } : e);
      setExpenses(updatedExpenses);
      localStorage.setItem('spendy_expenses', JSON.stringify(updatedExpenses));
    }

    // Update supplier payment status and create payment record if this is a supplier payment
    if (request.category === 'Supplier Payment' && request.supplier && typeof request.supplier === 'string') {
      const updatedSuppliers = suppliers.map(s =>
        s.name === request.supplier ? {
          ...s,
          paymentStatus: 'Completed' as const
        } : s
      );
      setSuppliers(updatedSuppliers);

      // TODO: Sync supplier paymentStatus update to database

      // Create payment record for supplier payment
      const supplierAmount = typeof request.amount === 'number' ? request.amount : 0;
      const newPayment: Payment = {
        id: generateUUID(),
        eventId: 'N/A',
        eventName: 'N/A',
        initiatedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown',
        recipient: request.supplier as string,
        amount: supplierAmount,
        type: 'M-Pesa',
        status: 'Completed',
        dateTime: new Date().toISOString(),
        description: (typeof request.description === 'string' ? request.description : '') || `Supplier payment to ${request.supplier}`
      };
      setPayments([...payments, newPayment]);
    }

    // Handle batch expense approval - pass as bulk payment
    if ((request.paymentRequestType === 'bulk' || request.expenseRequestType === 'batch') && request.batchPaymentDetails && Array.isArray(request.batchPaymentDetails) && request.batchPaymentDetails.length > 0) {
      // Create a payment record specifically for batch/bulk payments
      const batchPayment: Payment = {
        id: generateUUID(),
        eventId: typeof request.eventId === 'string' ? request.eventId : 'N/A',
        eventName: typeof request.name === 'string' ? request.name : 'Batch Approval',
        expenseId: typeof request.expenseId === 'string' ? request.expenseId : undefined,
        initiatedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown',
        recipient: `Batch Approval (${request.batchPaymentDetails.length} recipients)`,
        amount: typeof request.amount === 'number' ? request.amount : 0,
        type: 'M-Pesa',
        status: 'Completed',
        dateTime: new Date().toISOString(),
        description: `Batch approval for ${typeof request.name === 'string' ? request.name : 'Unknown'} - ${request.batchPaymentDetails.length} recipients`
      };
      setPayments([...payments, batchPayment]);

      // Show specific toast for batch approval
      showToast(`Batch expense approved: ${typeof request.name === 'string' ? request.name : 'Unknown'} - ${request.batchPaymentDetails.length} recipients ready for batch disbursement`, 'success');
    }

    // Notify the request creator about approval
    if (request.expenseId) {
      const expense = expenses.find(e => e.id === request.expenseId);
    if (expense && expense.createdByUserId) {
      const approvalNotification = createNotification(
        'success',
        'Expense Approved',
        `Your expense "${reqName}" has been approved and is ready for payment.`,
        (typeof expense.createdByUserId === 'string' ? expense.createdByUserId : 'system'),
        undefined,
        'medium',
        false,
        request.expenseId as string | undefined,
        'expense'
      );
      sendNotification(approvalNotification);
    }
    }

    // Notify admin about high-value approvals
    if (reqAmount > 50000) {
      const highValueNotification = createNotification(
        'warning',
        'High-Value Expense Approved',
        `A high-value expense of KES ${reqAmount.toLocaleString()} has been approved by ${currentUser?.firstName} ${currentUser?.lastName}.`,
        undefined,
        'Admin',
        'high',
        false,
        request.expenseId as string | undefined,
        'expense'
      );
      sendNotification(highValueNotification);
    }

    // Notify admin about all approvals (for oversight)
    if (currentUser?.role !== 'Admin') {
      const adminApprovalNotification = createNotification(
        'info',
        'Expense Approved',
        `${currentUser?.firstName} ${currentUser?.lastName} approved expense "${reqName}" for KES ${reqAmount.toLocaleString()}.`,
        undefined,
        'Admin',
        'low',
        false,
        request.expenseId as string | undefined,
        'expense'
      );
      sendNotification(adminApprovalNotification);
    }

    showToast('Request approved successfully', 'success');
    handleCloseModal();

    // Show transient toast for approved expense ready for payment
    if (request.expenseId) {
      const approvedExpense = expenses.find(e => e.id === request.expenseId);
      if (approvedExpense) {
        if (request.paymentRequestType === 'bulk') {
          showToast(`${approvedExpense.title} (batch expense) approved and ready for batch approval`, 'success');
        } else {
          showToast(`${approvedExpense.title} approved and ready for payment`, 'success');
        }
      }
    }

    // If on request-review page, navigate back to approvals
    if (currentPage === 'request-review') {
      handleNavigate('approvals');
    }
  };
  
  const handleRejectRequest = (reason: string) => {
    // Get the request - either from modalData or current page
    const request = modalData || requests.find(r => r.id === selectedId);
    if (!request) return;
    
    const updatedRequests = requests.map(r => r.id === request.id ? {
      ...r,
      ...buildRejectRequestPatch(
        request.id,
        reason,
        currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown',
        new Date().toISOString().split('T')[0],
      ),
    } : r);
    setRequests(updatedRequests);
    localStorage.setItem('spendy_requests', JSON.stringify(updatedRequests));

    // Update linked expense status
    if (request.expenseId) {
      const updatedExpenses = expenses.map(e => e.id === request.expenseId ? {
        ...e,
        status: 'Rejected' as RequestStatus
      } : e);
      setExpenses(updatedExpenses);
      localStorage.setItem('spendy_expenses', JSON.stringify(updatedExpenses));
    }
    
    addActivityLog(`Request rejected: ${typeof request.name === 'string' ? request.name : 'Unknown'}`, `Rejected ${typeof request.type === 'string' ? request.type : 'Unknown'} request for KES ${(typeof request.amount === 'number' ? request.amount : 0).toLocaleString()}. Reason: ${reason}`);
    
    // Update expense if linked
    if (request.expenseId) {
      const updatedExpenses = expenses.map(e => e.id === request.expenseId ? {
        ...e,
        status: 'Rejected' as RequestStatus
      } : e);
      setExpenses(updatedExpenses);
      localStorage.setItem('spendy_expenses', JSON.stringify(updatedExpenses));
    }
    
    showToast('Request rejected', 'error');
    handleCloseModal();
    
    // If on request-review page, navigate back to approvals
    if (currentPage === 'request-review') {
      handleNavigate('approvals');
    }
  };

  const handleUndoRejection = (requestId?: string) => {
    // Get the request - either from parameter or selectedId
    const request = requests.find(r => r.id === (requestId || selectedId));
    if (!request || request.status !== 'Rejected') return;
    
    const updatedRequests = requests.map(r => r.id === request.id ? {
      ...r,
      ...buildUndoRejectionPatch(request.id),
    } : r);
    setRequests(updatedRequests);
    localStorage.setItem('spendy_requests', JSON.stringify(updatedRequests));

    // Update linked expense status back to pending
    if (request.expenseId) {
      const updatedExpenses = expenses.map(e => e.id === request.expenseId ? {
        ...e,
        status: 'Pending' as RequestStatus
      } : e);
      setExpenses(updatedExpenses);
      localStorage.setItem('spendy_expenses', JSON.stringify(updatedExpenses));
    }
    
    addActivityLog(`Request rejection undone: ${request.name}`, `Moved ${request.type} request back to pending status`);
    showToast('Request moved back to pending', 'success');
  };

  const handleEditRequest = (requestId: string, updatedData: Partial<Request>) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    // Only allow editing pending or rejected requests
    if (request.status !== 'Pending' && request.status !== 'Rejected') {
      showToast('Only pending or rejected requests can be edited', 'error');
      return;
    }

    const updatedRequests = requests.map(r => r.id === requestId ? {
      ...r,
      ...updatedData
    } : r);
    setRequests(updatedRequests);
    localStorage.setItem('spendy_requests', JSON.stringify(updatedRequests));

    // Update linked expense if exists
    if (request.expenseId) {
      const updatedExpenses = expenses.map(e => e.id === request.expenseId ? {
        ...e,
        title: updatedData.name || e.title,
        category: updatedData.category || e.category,
        amount: updatedData.amount || e.amount,
        notes: updatedData.description || e.description
      } : e);
      setExpenses(updatedExpenses);
      localStorage.setItem('spendy_expenses', JSON.stringify(updatedExpenses));
    }

    addActivityLog(`Request updated: ${updatedData.name || request.name}`, `Updated ${request.type} request details`);
    showToast('Request updated successfully', 'success');
    handleCloseModal();
  };

  const handleInsufficientBalance = (requiredAmount: number, walletId: string) => {
    setInsufficientBalanceData({
      requiredAmount,
      walletId,
      requestId: typeof modalData?.id === 'string' ? modalData.id : ''
    });
    handleCloseModal();
  };
  const handleFundWalletFromInsufficient = () => {
    setInsufficientBalanceData(null);
    handleOpenModal('fund-wallet');
  };
  const handleSelectWalletFromInsufficient = (newWalletId: string) => {
    if (insufficientBalanceData) {
      handleApproveRequest(newWalletId);
    }
    setInsufficientBalanceData(null);
  };
  const handleBillSupplierFromInsufficient = () => {
    if (modalData) {
      // Create a supplier payable instead
      showToast('Supplier billing created successfully', 'success');
      setRequests(requests.map(r => r.id === modalData.id ? {
        ...r,
        status: 'Approved',
        processedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown',
        dateProcessed: new Date().toISOString().split('T')[0]
      } : r));
    }
    setInsufficientBalanceData(null);
  };
  
  const handleAddUser = async (userData: Partial<User>) => {
    try {
      // Auto-assign all modules if role is Admin
      const modulesAssigned = userData.role === 'Admin'
        ? ['Expenses', 'Payments', 'Events', 'Users', 'Wallets']
        : (userData.modulesAssigned || []);

      // Call backend API to create user
      const { userAPI } = await import('./services/backendAPI');
      const response = await userAPI.create({
        email: userData.email || '',
        password: userData.password || 'Password123',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        country: userData.country || 'Kenya',
        role: userData.role || 'Staff',
        modulesAssigned: modulesAssigned
      });

      console.log('📥 User created in backend:', response.data);

      // Backend automatically creates USER wallet, so fetch updated wallets and users
      const walletsResponse = await (await import('./services/backendAPI')).walletAPI.getAll();
      const walletsData = Array.isArray(walletsResponse.data)
        ? walletsResponse.data
        : ((walletsResponse as any).data?.data || []);
      setWallets(walletsData);
      localStorage.setItem('spendy_wallets', JSON.stringify(walletsData));

      const usersResponse = await userAPI.getAll();
      const usersData = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : ((usersResponse as any).data?.data || []);

      const appUsers = usersData.map((u: any) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone || '',
        country: u.country || '',
        role: u.role,
        status: u.status || 'Active',
        modulesAssigned: u.modulesAssigned || [],
        profileImage: u.profileImage,
        createdAt: u.createdAt || new Date().toISOString(),
        companyId: currentUser!.companyId,
        companyName: currentUser!.companyName,
        isAdmin: u.role === 'Admin',
        password: ''
      }));

      setUsers(appUsers);
      localStorage.setItem('spendy_users', JSON.stringify(appUsers));

      // Notify the new user about their account creation
      const welcomeNotification = createNotification(
        'info',
        'Welcome to Spendy!',
        `Your ${response.data.role} account has been created. You have access to: ${modulesAssigned.join(', ')} modules.`,
        response.data.id,
        undefined,
        'low',
        true,
        response.data.id,
        'user'
      );
      sendNotification(welcomeNotification);

      // Notify admin about new user creation
      const adminNotification = createNotification(
        'success',
        'New User Created',
        `${response.data.firstName} ${response.data.lastName} (${response.data.role}) has been added to the system.`,
        currentUser?.id,
        undefined,
        'medium',
        false,
        response.data.id,
        'user'
      );
      sendNotification(adminNotification);

      showToast('User created successfully', 'success');
    } catch (error: any) {
      console.error('Error creating user:', error);
      showToast(error.message || 'Failed to create user', 'error');
    }
  };

  const handleEditUser = async (userId: string, userData: Partial<User>) => {
    try {
      // Auto-assign all modules if role is Admin
      const modulesAssigned = userData.role === 'Admin'
        ? ['Expenses', 'Payments', 'Events', 'Users', 'Wallets']
        : userData.modulesAssigned;

      // Call backend API to update user
      const { userAPI } = await import('./services/backendAPI');
      const response = await userAPI.update(userId, {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        country: userData.country,
        role: userData.role,
        modulesAssigned: modulesAssigned,
        profileImage: userData.profileImage
      });

      console.log('📥 User updated in backend:', response.data);

      // Fetch updated users list
      const usersResponse = await userAPI.getAll();
      const usersData = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : ((usersResponse as any).data?.data || []);

      const appUsers = usersData.map((u: any) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone || '',
        country: u.country || '',
        role: u.role,
        status: u.status || 'Active',
        modulesAssigned: u.modulesAssigned || [],
        profileImage: u.profileImage,
        createdAt: u.createdAt || new Date().toISOString(),
        companyId: currentUser!.companyId,
        companyName: currentUser!.companyName,
        isAdmin: u.role === 'Admin',
        password: ''
      }));

      setUsers(appUsers);
      localStorage.setItem('spendy_users', JSON.stringify(appUsers));

      showToast('User updated successfully', 'success');
    } catch (error: any) {
      console.error('Error updating user:', error);
      showToast(error.message || 'Failed to update user', 'error');
    }
  };

  const handleEditExpense = (expenseData: Partial<Expense>) => {
    const updatedExpenses = expenses.map(e => e.id === expenseData.id ? {
      ...e,
      ...expenseData
    } : e);
    setExpenses(updatedExpenses);
    localStorage.setItem('spendy_expenses', JSON.stringify(updatedExpenses));
    addActivityLog(
      'Expense updated',
      `Updated expense: ${expenseData.title} (ID: ${expenseData.id})`
    );
    showToast('Expense updated successfully', 'success');
    handleCloseModal();
  };

  const handleCopyCredentials = (user: User) => {
    const credentials = `Login Credentials for ${user.firstName} ${user.lastName}\n\nEmail: ${user.email}\nPassword: ${user.password || '[Not Available]'}\nRole: ${user.role}\n\nLogin URL: ${window.location.origin}`;
    navigator.clipboard.writeText(credentials);
    showToast('Credentials copied to clipboard', 'success');
  };
  const handleUpdateSystemData = (data: Record<string, unknown>) => {
    setSystemData(data);
    showToast('System data updated successfully', 'success');
  };
  const handleDeleteInventory = async (id: string) => {
    const item = inventory.find(i => i.id === id);

    try {
      await invCtrl.deleteInventoryItem(id);
      addActivityLog(
        'Inventory deleted',
        `Deleted inventory item: ${item?.name} (Quantity was: ${item?.quantity})`
      );
      showToast('Inventory item deleted successfully', 'success');
    } catch (error) {
      console.error('❌ [Inventory] Failed to delete inventory item from database:', error);
      showToast('Failed to delete inventory item. Please try again.', 'error');
    }
  };
  const handleDeleteSupplier = async (id: string) => {
    const supplier = suppliers.find(s => s.id === id);

    try {
      console.log('💾 [Supplier] Deleting supplier from database:', supplier?.name);

      // Delete supplier from database
      const success = await supplierService.deleteSupplier(id);

      if (success) {
        // Update local state
        const updatedSuppliers = suppliers.filter(s => s.id !== id);
        setSuppliers(updatedSuppliers);

        console.log('✅ [Supplier] Supplier deleted from database successfully');

        addActivityLog(
          'Supplier deleted',
          `Deleted supplier: ${supplier?.name} (Category: ${supplier?.category}, ID: ${id})`
        );
        showToast('Supplier deleted successfully', 'success');
      }
    } catch (error) {
      console.error('❌ [Supplier] Failed to delete supplier from database:', error);
      showToast('Failed to delete supplier. Please try again.', 'error');
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    try {
      // Call backend API to delete user
      const { userAPI } = await import('./services/backendAPI');
      await userAPI.delete(userId);

      console.log('📥 User deleted in backend:', userId);

      // Fetch updated users list
      const usersResponse = await userAPI.getAll();
      const usersData = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : ((usersResponse as any).data?.data || []);

      const appUsers = usersData.map((u: any) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone || '',
        country: u.country || '',
        role: u.role,
        status: u.status || 'Active',
        modulesAssigned: u.modulesAssigned || [],
        profileImage: u.profileImage,
        createdAt: u.createdAt || new Date().toISOString(),
        companyId: currentUser!.companyId,
        companyName: currentUser!.companyName,
        isAdmin: u.role === 'Admin',
        password: ''
      }));

      setUsers(appUsers);
      localStorage.setItem('spendy_users', JSON.stringify(appUsers));

      showToast('User deleted successfully', 'success');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showToast(error.message || 'Failed to delete user', 'error');
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      // Find current user to determine new status
      const user = users.find(u => u.id === userId);
      if (!user) {
        showToast('User not found', 'error');
        return;
      }

      const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';

      // Call backend API to toggle user status
      const { userAPI } = await import('./services/backendAPI');
      await userAPI.toggleStatus(userId, newStatus as 'Active' | 'Inactive');

      console.log('📥 User status toggled in backend:', userId, newStatus);

      // Fetch updated users list
      const usersResponse = await userAPI.getAll();
      const usersData = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : ((usersResponse as any).data?.data || []);

      const appUsers = usersData.map((u: any) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone || '',
        country: u.country || '',
        role: u.role,
        status: u.status || 'Active',
        modulesAssigned: u.modulesAssigned || [],
        profileImage: u.profileImage,
        createdAt: u.createdAt || new Date().toISOString(),
        companyId: currentUser!.companyId,
        companyName: currentUser!.companyName,
        isAdmin: u.role === 'Admin',
        password: ''
      }));

      setUsers(appUsers);
      localStorage.setItem('spendy_users', JSON.stringify(appUsers));

      showToast(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      showToast(error.message || 'Failed to update user status', 'error');
    }
  };

  const handleSaveUser = async (updatedUser: User) => {
    try {
      // Call backend API to update user
      const { userAPI } = await import('./services/backendAPI');
      const response = await userAPI.update(updatedUser.id, {
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        country: updatedUser.country,
        role: updatedUser.role,
        modulesAssigned: updatedUser.modulesAssigned,
        profileImage: updatedUser.profileImage
      });

      console.log('📥 User saved in backend:', response.data);

      // Fetch updated users list
      const usersResponse = await userAPI.getAll();
      const usersData = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : ((usersResponse as any).data?.data || []);

      const appUsers = usersData.map((u: any) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone || '',
        country: u.country || '',
        role: u.role,
        status: u.status || 'Active',
        modulesAssigned: u.modulesAssigned || [],
        profileImage: u.profileImage,
        createdAt: u.createdAt || new Date().toISOString(),
        companyId: currentUser!.companyId,
        companyName: currentUser!.companyName,
        isAdmin: u.role === 'Admin',
        password: ''
      }));

      setUsers(appUsers);
      localStorage.setItem('spendy_users', JSON.stringify(appUsers));

      // If the edited user is the currently logged-in user, update session too
      if (currentUser && currentUser.id === updatedUser.id) {
        const updatedCurrentUser = appUsers.find((u: any) => u.id === updatedUser.id);
        if (updatedCurrentUser) {
          setCurrentUser(updatedCurrentUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
        }
      }

      showToast('User updated successfully', 'success');
    } catch (error: any) {
      console.error('Error saving user:', error);
      showToast(error.message || 'Failed to update user', 'error');
    }
  };
  
  const handleUpdateProfile = (profileData: Partial<User>) => {
    if (!currentUser) return;
    
    const updatedUser = {
      ...currentUser,
      ...profileData
    };
    
    setCurrentUser(updatedUser);
    
    // Update in users array if not admin
    if (!currentUser.isAdmin) {
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    }
    
    // Update localStorage
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    showToast('Profile updated successfully', 'success');
  };
  
    const renderPage = () => {
    // Normalize wallets data - handle both array and API response object
    const walletsArray: Wallet[] = Array.isArray(wallets) ? wallets : (wallets as any)?.data || [];

    const isStaff = currentUser?.role === 'Staff';
    const isApprover = currentUser?.role === 'Approver';
    const isStoreManager = currentUser?.role === 'Store Manager';

    const scopedEvents = getAccessibleEvents(currentUser, events);
    const scopedExpenses = getAccessibleExpenses(currentUser, expenses, events);
    const scopedPayments = getAccessiblePayments(currentUser, payments, events);
    const scopedRequests = getAccessibleRequests(currentUser, requests, events);

    // Check if user has access to the current page using the utility function
    if (!hasPageAccess(currentUser, currentPage)) {
      // Always allow dashboard for admins
      if (currentUser?.role === 'Admin' && currentPage === 'dashboard') {
        // Continue to dashboard rendering
      } else {
        // For staff users, redirect to their first accessible page instead of showing access denied
        if (isStaff) {
          // Staff users should only see expenses, payments, and my-account
          const staffAccessiblePages = ['expenses', 'payments', 'my-account'];
          const firstAccessiblePage = staffAccessiblePages.find(page => hasPageAccess(currentUser, page));

          if (firstAccessiblePage) {
            handleNavigate(firstAccessiblePage);
            return null;
          }
        }

        // For other roles, show access denied page
        return <AccessDenied onNavigate={handleNavigate} sidebarCollapsed={sidebarCollapsed} />;
      }
    }

    // Allow staff users to access their dashboard page
    // (Removed the redirect logic that was sending staff users away from dashboard)

    switch (currentPage) {
      case 'dashboard':
        if (isStaff) {
          return <StaffDashboard onNavigate={handleNavigate} onOpenModal={handleOpenModal} currentUser={currentUser!} events={scopedEvents} wallets={walletsArray} expenses={scopedExpenses} payments={scopedPayments} requests={scopedRequests} transactions={transactions} />;
        }
        if (isApprover) {
          return <ApproverDashboard onNavigate={handleNavigate} onOpenModal={handleOpenModal} currentUser={currentUser!} events={scopedEvents} expenses={scopedExpenses} payments={scopedPayments} requests={scopedRequests} />;
        }
        if (isStoreManager) {
          return <StoreManagerDashboard onNavigate={handleNavigate} onOpenModal={handleOpenModal} currentUser={currentUser!} events={scopedEvents} wallets={walletsArray} expenses={scopedExpenses} payments={scopedPayments} requests={scopedRequests} inventory={inventory} />;
        }
        return <Dashboard onNavigate={handleNavigate} onOpenModal={handleOpenModal} currentUser={currentUser!} events={scopedEvents} wallets={walletsArray} expenses={scopedExpenses} payments={scopedPayments} requests={scopedRequests} suppliers={suppliers} activityLog={activityLog} />;
      case 'events':
        return <Events onNavigate={handleNavigate} onOpenModal={handleOpenModal} onArchiveEvent={handleArchiveEvent} events={scopedEvents.filter(e => e.type === 'Event')} payments={scopedPayments} currentUser={currentUser!} pageName="Events" lockedType="Event" />;
      case 'activations':
        return <Events onNavigate={handleNavigate} onOpenModal={handleOpenModal} onArchiveEvent={handleArchiveEvent} events={scopedEvents.filter(e => e.type === 'Activation')} payments={scopedPayments} currentUser={currentUser!} pageName="Activations" lockedType="Activation" />;
      case 'operations':
        return <Events onNavigate={handleNavigate} onOpenModal={handleOpenModal} onArchiveEvent={handleArchiveEvent} events={scopedEvents.filter(e => e.type === 'Operation')} payments={scopedPayments} currentUser={currentUser!} pageName="Operations" lockedType="Operation" />;
      case 'event-detail': {
        if (selectedId) {
          const event = scopedEvents.find(e => e.id === selectedId);
          if (event) {
            return <EventDetail event={event} expenses={scopedExpenses} requests={scopedRequests} payments={scopedPayments} wallets={walletsArray} inventory={inventory} invoices={invoices} activityLog={activityLog} onNavigate={handleNavigate} onOpenModal={handleOpenModal} onArchiveEvent={handleArchiveEvent} onUpdateEventStatus={handleUpdateEventStatus} currentUser={currentUser!} />;
          }
        }
        return <Events onNavigate={handleNavigate} onOpenModal={handleOpenModal} onArchiveEvent={handleArchiveEvent} events={scopedEvents.filter(e => e.type === 'Event')} payments={scopedPayments} currentUser={currentUser!} pageName="Events" lockedType="Event" />;
      }
      case 'edit-event': {
        if (selectedId) {
          const event = scopedEvents.find(e => e.id === selectedId);
          if (event) {
            return <EditEvent
              event={event}
              users={users}
              clients={systemData.clients}
              eventCategories={systemData.eventcategorys}
              activationCategories={systemData.activationcategorys}
              onSave={handleEditEvent}
              onCancel={() => handleNavigate('event-detail', event.id)}
            />;
          }
        }
        return <Events onNavigate={handleNavigate} onOpenModal={handleOpenModal} onArchiveEvent={handleArchiveEvent} events={scopedEvents.filter(e => e.type === 'Event')} payments={scopedPayments} currentUser={currentUser!} pageName="Events" lockedType="Event" />;
      }
      case 'wallets': {
        // CRITICAL SAFETY: Ensure only current company's wallets are passed
        const filteredWallets = walletsArray.filter(w => w.companyId === currentUser!.companyId);
        console.log('🔐 [Render] Passing wallets to Wallets component:', filteredWallets.map(w => ({
          name: w.name,
          companyId: w.companyId
        })));
        return <Wallets onNavigate={handleNavigate} onOpenModal={handleOpenModal} wallets={filteredWallets} onDeleteWallet={handleDeleteWallet} currentUser={currentUser!} users={users} />;
      }
      case 'wallet-detail': {
        const selectedWallet = walletsArray.find(w => w.id === selectedId);
        return <WalletDetail wallet={selectedWallet} transactions={transactions} onOpenModal={handleOpenModal} currentUser={currentUser!} onNavigate={handleNavigate} users={users} />;
      }
      case 'transaction-detail': {
        const transaction = transactions.find(t => t.id === selectedId);
        if (!transaction) return <Wallets onNavigate={handleNavigate} onOpenModal={handleOpenModal} wallets={walletsArray} onDeleteWallet={handleDeleteWallet} currentUser={currentUser!} users={users} />;
        const wallet = walletsArray.find(w => w.id === transaction.walletId);
        return <TransactionDetail transaction={transaction} wallet={wallet} onNavigate={handleNavigate} currentUser={currentUser!} />;
      }
      case 'expenses':
        if (isStaff) {
          return <StaffExpenses onOpenModal={handleOpenModal} onNavigate={handleNavigate} expenses={scopedExpenses} events={scopedEvents} currentUser={currentUser!} />;
        }
        return <Expenses onOpenModal={handleOpenModal} onNavigate={handleNavigate} expenses={scopedExpenses} events={scopedEvents} currentUser={currentUser!} />;
      case 'expense-detail': {
        if (!selectedId) return <Expenses onOpenModal={handleOpenModal} onNavigate={handleNavigate} expenses={scopedExpenses} events={scopedEvents} currentUser={currentUser!} />;
        const expense = scopedExpenses.find(e => e.id === selectedId);
        if (!expense) return <Expenses onOpenModal={handleOpenModal} onNavigate={handleNavigate} expenses={scopedExpenses} events={scopedEvents} currentUser={currentUser!} />;
        const expenseEvent = scopedEvents.find(e => e.id === expense.eventId);
        const expenseWallet = expense.walletId ? walletsArray.find(w => w.id === expense.walletId) : undefined;
        return <ExpenseDetail expense={expense} event={expenseEvent} wallet={expenseWallet} onNavigate={handleNavigate} onOpenModal={handleOpenModal} currentUser={currentUser!} />;
      }
      case 'payments':
        if (isStaff) {
          // Filter wallets to only show staff user's personal wallet
          const staffWallets = walletsArray.filter(wallet =>
            wallet.ownerId === currentUser!.id && wallet.type === 'USER'
          );
          return <StaffPayments onOpenModal={(modal, data) => {
            // For make-payment modal, handle both direct navigation and modal opening
            if (modal === 'make-payment' && data) {
              // If data has expenseId, navigate to payment detail page
              if (data.expenseId) {
                handleNavigate('payment-detail', data.expenseId);
              } else {
                // Otherwise open the modal with the payment data
                handleOpenModal(modal, data);
              }
            } else {
              handleOpenModal(modal, data);
            }
          }} payments={scopedPayments} expenses={scopedExpenses} requests={scopedRequests} approvals={scopedRequests.filter(r => r.status === 'Approved')} wallets={staffWallets} currentUser={currentUser!} onNavigate={handleNavigate} onPayExpense={handlePayExpense} showToast={showToast} />;
        }
        return <Payments onOpenModal={(modal, data) => {
          // For make-payment modal, handle both direct navigation and modal opening
          if (modal === 'make-payment' && data) {
            // If data has expenseId, navigate to payment detail page
            if (data.expenseId) {
              handleNavigate('payment-detail', data.expenseId);
            } else {
              // Otherwise open the modal with the payment data
              handleOpenModal(modal, data);
            }
          } else {
            handleOpenModal(modal, data);
          }
        }} payments={scopedPayments} expenses={scopedExpenses} requests={scopedRequests} approvals={scopedRequests.filter(r => r.status === 'Approved')} wallets={walletsArray} currentUser={currentUser!} onNavigate={handleNavigate} onPayExpense={handlePayExpense} showToast={showToast} />;
      case 'make-payment-page': {
        // Find the expense for the make payment page
        const expenseForPayment = scopedExpenses.find(e => e.id === selectedId);
        return <MakePaymentPage
          expenses={scopedExpenses}
          requests={scopedRequests}
          approvals={scopedRequests.filter(r => r.status === 'Approved')}
          wallets={walletsArray}
          selectedExpense={expenseForPayment}
          onSuccess={handleMakePayment}
          onNavigate={handleNavigate}
        />;
      }
      case 'payment-detail': {
        // Find expense for payment detail page
        const expenseForPayment = scopedExpenses.find(e => e.id === selectedId);
        if (!expenseForPayment) return <Payments onOpenModal={handleOpenModal} payments={scopedPayments} expenses={scopedExpenses} requests={scopedRequests} approvals={scopedRequests.filter(r => r.status === 'Approved')} wallets={walletsArray} currentUser={currentUser!} onNavigate={handleNavigate} onPayExpense={handlePayExpense} showToast={showToast} />;
        return <PaymentDetail expense={expenseForPayment} wallets={walletsArray} payments={scopedPayments} approvals={scopedRequests.filter(r => r.status === 'Approved')} currentUser={currentUser!} onNavigate={handleNavigate} onMakePayment={(paymentData) => {
          if (paymentData.approval) {
            const newRequest: Request = paymentData.approval;
            const updatedRequests = [...requests, newRequest];
            setRequests(updatedRequests);
            localStorage.setItem('spendy_requests', JSON.stringify(updatedRequests));
          }
          const newPayment: Payment = paymentData.payment;
          const updatedPayments = [...payments, newPayment];
          setPayments(updatedPayments);
          localStorage.setItem('spendy_payments', JSON.stringify(updatedPayments));
          showToast('Payment processed successfully', 'success');
        }} />;
      }
      case 'payment-details-readonly': {
        // Find payment for read-only payment details page
        const paymentForDetails = scopedPayments.find(p => p.id === selectedId);
        if (!paymentForDetails) return <Payments onOpenModal={handleOpenModal} payments={scopedPayments} expenses={scopedExpenses} requests={scopedRequests} approvals={scopedRequests.filter(r => r.status === 'Approved')} wallets={walletsArray} currentUser={currentUser!} onNavigate={handleNavigate} onPayExpense={handlePayExpense} showToast={showToast} />;

        // Find related expense if exists
        const relatedExpense = paymentForDetails.expenseId ? scopedExpenses.find(e => e.id === paymentForDetails.expenseId) : undefined;
        // Find related wallet if exists - use Main Wallet as fallback
        const relatedWallet = walletsArray.find(w => w.type === 'Main Wallet');

        return <PaymentDetailsReadOnly
          payment={paymentForDetails}
          expense={relatedExpense}
          wallet={relatedWallet}
          currentUser={currentUser!}
          onNavigate={handleNavigate}
        />;
      }
      case 'approvals':
        return <Approvals onOpenModal={handleOpenModal} onNavigate={handleNavigate} requests={scopedRequests} expenses={scopedExpenses} payments={payments} suppliers={suppliers} onApprove={handleApproveRequest} onReject={handleRejectRequest} onUndoRejection={handleUndoRejection} onEditRequest={handleEditRequest} />;
      case 'request-review': {
        const selectedRequest = scopedRequests.find(r => r.id === selectedId);
        if (!selectedRequest) return <Approvals onOpenModal={handleOpenModal} onNavigate={handleNavigate} requests={scopedRequests} expenses={scopedExpenses} payments={payments} suppliers={suppliers} onApprove={handleApproveRequest} onReject={handleRejectRequest} onUndoRejection={handleUndoRejection} onEditRequest={handleEditRequest} />;
        return <RequestReview request={selectedRequest} wallets={walletsArray} suppliers={suppliers} currentUser={currentUser} onNavigate={handleNavigate} onApprove={handleApproveRequest} onReject={handleRejectRequest} onUndoRejection={handleUndoRejection} onEditRequest={handleEditRequest} />;
      }
      case 'batch-approval-review': {
        const selectedRequest = scopedRequests.find(r => r.id === selectedId);
        if (!selectedRequest) return <Approvals onOpenModal={handleOpenModal} onNavigate={handleNavigate} requests={scopedRequests} expenses={scopedExpenses} payments={payments} suppliers={suppliers} onApprove={handleApproveRequest} onReject={handleRejectRequest} onUndoRejection={handleUndoRejection} onEditRequest={handleEditRequest} />;
        return <BatchApprovalReview request={selectedRequest} expenses={expenses} wallets={walletsArray} currentUser={currentUser!} onNavigate={handleNavigate} onApprove={handleApproveRequest} onReject={handleRejectRequest} onUndoRejection={handleUndoRejection} onEditRequest={handleEditRequest} />;
      }
      case 'users':
        return <Users onOpenModal={handleOpenModal} onNavigate={handleNavigate} users={users} onCopyCredentials={handleCopyCredentials} onDeleteUser={handleDeleteUser} onToggleUserStatus={handleToggleUserStatus} currentUser={currentUser!} activityLog={activityLog} />;
      case 'edit-user': {
        const userToEdit = modalData as User | null || (selectedId ? users.find(u => u.id === selectedId) : null);
        if (!userToEdit) return <Users onOpenModal={handleOpenModal} onNavigate={handleNavigate} users={users} onCopyCredentials={handleCopyCredentials} onDeleteUser={handleDeleteUser} onToggleUserStatus={handleToggleUserStatus} currentUser={currentUser!} activityLog={activityLog} />;
        return <EditUser onNavigate={handleNavigate} onSaveUser={handleSaveUser} user={userToEdit} wallets={walletsArray} />;
      }
      case 'system-setup':
        return <SystemSetup currentUser={currentUser!} />;
      case 'analytics':
        return <Analytics events={events} expenses={expenses} wallets={walletsArray} payments={payments} requests={scopedRequests} />;
      case 'suppliers':
        return <Suppliers onOpenModal={handleOpenModal} suppliers={suppliers} onDeleteSupplier={handleDeleteSupplier} onNavigate={handleNavigate} />;
      case 'supplier-detail': {
        const selectedSupplier = suppliers.find(s => s.id === selectedId);
        return <SupplierDetail
          supplier={selectedSupplier || null}
          requests={scopedRequests}
          expenses={scopedExpenses}
          onNavigate={handleNavigate}
          onPaySupplier={(supplier) => handleNavigate('pay-supplier', supplier.id)}
          onPayPendingExpense={(requestId) => {
            setSelectedId(requestId);
            handleNavigate('make-payment', requestId);
          }}
          onDeleteSupplier={handleDeleteSupplier}
        />;
      }
      case 'pay-supplier': {
        const supplierToPay = suppliers.find(s => s.id === selectedId);
        return <PaySupplier supplier={supplierToPay || null} wallets={walletsArray} onNavigate={handleNavigate} onPaySupplier={handlePaySupplier} pendingAmount={navigationParams.pendingAmount} />;
      }
      case 'invoices':
        return <Invoices invoices={invoices} onNavigate={handleNavigate} onOpenModal={handleOpenModal} currentUser={currentUser} onDuplicateInvoice={handleDuplicateInvoice} onApproveInvoice={handleApproveInvoice} onRejectInvoice={handleRejectInvoice} onConvertQuote={handleConvertQuote} companyLogo={currentUser?.companyLogo} companyName={currentUser?.companyName} companyPhone={currentUser?.companyPhone} companyOfficialEmail={currentUser?.companyOfficialEmail} companyOfficeAddress={currentUser?.companyOfficeAddress} />;
      case 'products':
        return <Products products={products} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} />;
      case 'invoice-detail': {
        const selectedInvoice = invoices.find(inv => inv.id === selectedId);
        return <InvoiceDetail
          invoice={selectedInvoice || null}
          onNavigate={handleNavigate}
          onUpdateInvoice={handleUpdateInvoice}
          onRecordPayment={handleRecordPayment}
          onOpenModal={handleOpenModal}
          onDeleteInvoice={handleDeleteInvoice}
          currentUser={currentUser}
          onDuplicateInvoice={handleDuplicateInvoice}
          onApproveInvoice={handleApproveInvoice}
          onRejectInvoice={handleRejectInvoice}
          onConvertQuote={handleConvertQuote}
          companyLogo={currentUser?.companyLogo}
          companyName={currentUser?.companyName}
          companyPhone={currentUser?.companyPhone}
          companyOfficialEmail={currentUser?.companyOfficialEmail}
          companyOfficeAddress={currentUser?.companyOfficeAddress}
          spendyPaybillNumber={currentUser?.spendyPaybillNumber}
          spendyAccountNumber={currentUser?.spendyAccountNumber}
        />;
      }
      case 'inventory':
        return <Inventory onOpenModal={handleOpenModal} inventory={inventory} onNavigate={handleNavigate} onDeleteInventory={handleDeleteInventory} currentUser={currentUser!} />;
      case 'inventory-detail': {
        const selectedItem = inventory.find(i => i.id === selectedId);
        if (!selectedItem) return <div>Item not found</div>;
        const filteredMovements = inventoryMovements.filter(m => m.itemId === selectedId).map(m => ({ ...m, balance: m.balance || 0, cost: m.cost || 0 })) as any[];
        return <InventoryDetail item={selectedItem} onNavigate={handleNavigate} onOpenModal={handleOpenModal} movements={filteredMovements} currentUser={currentUser!} />;
      }
      case 'edit-inventory': {
        const itemToEdit = inventory.find(i => i.id === selectedId) || null;
        return <EditInventory onNavigate={handleNavigate} onSave={(id, data) => handleEditInventory(id, data)} item={itemToEdit} />;
      }
      case 'checkout': {
        const checkoutItem = inventory.find(i => i.id === selectedId);
        if (!checkoutItem) return <Inventory onOpenModal={handleOpenModal} inventory={inventory} onNavigate={handleNavigate} onDeleteInventory={handleDeleteInventory} currentUser={currentUser!} />;
        return <CheckOut item={checkoutItem} events={events} onNavigate={handleNavigate} onCheckOut={handleCheckOut} />;
      }
      case 'checkin': {
        const checkinItem = inventory.find(i => i.id === selectedId);
        return <CheckIn item={checkinItem || null} movements={inventoryMovements} events={events} onNavigate={handleNavigate} onCheckIn={handleCheckIn} />;
      }
      case 'my-account':
        if (!currentUser) return <div>Please log in</div>;
        return <MyAccount currentUser={currentUser} onUpdateProfile={handleUpdateProfile} countries={systemData.countries || ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan']} />;
      case 'notifications':
        return <Notifications
          notifications={getUserNotifications(currentUser)}
          currentUser={currentUser || undefined}
          onMarkAsRead={markNotificationAsRead}
          onDeleteNotification={notificationsCtrl.deleteNotification}
        />;
      case 'connect-wallet-page': {
        const connectWalletEvent = events.find(e => e.id === selectedId);
        return <ConnectWalletPage wallets={walletsArray} eventId={selectedId || ''} eventName={connectWalletEvent?.name || ''} onNavigate={handleNavigate} onConnect={(walletId) => {
          const updatedWallets = walletsArray.map(w => w.id === walletId ? { ...w, linkedEvent: selectedId } : w);
          setWallets(updatedWallets);
          localStorage.setItem('spendy_wallets', JSON.stringify(updatedWallets));
          showToast('Wallet connected successfully', 'success');
          handleNavigate('event-detail');
        }} />;
      }
      case 'upload-document-page': {
        const uploadDocEvent = events.find(e => e.id === selectedId);
        return <UploadDocumentPage eventId={selectedId || ''} eventName={uploadDocEvent?.name || ''} onNavigate={handleNavigate} onUploadDocument={(documentData) => {
          if (selectedId) uploadEventDocument(selectedId, documentData.fileName);
          showToast('Document uploaded successfully', 'success');
        }} />;
      }
      default:
        return <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-dark-gray mb-2">
              {currentPage}
            </h2>
            <p className="text-gray-600">This page is under construction</p>
          </div>;
    }
  };
  const selectedWallet = insufficientBalanceData ? wallets.find(w => w.id === insufficientBalanceData.walletId) : null;
  
  // Show authentication pages if not logged in
  console.log('🔐 Authentication check:', { isAuthenticated, authPage, currentUser: !!currentUser });
  if (!isAuthenticated) {
    if (authPage === 'signup') {
      console.log('📝 Rendering SignUp page');
      return (
        <>
          <SignUp
            onSignUp={handleSignUp}
            onNavigateToSignIn={() => setAuthPage('signin')}
            countries={systemData.countries || ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan']}
          />
          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
      );
    }

    console.log('🔑 Rendering SignIn page');
    return (
      <>
        <SignIn
          onSignIn={handleSignIn}
          onNavigateToSignUp={() => setAuthPage('signup')}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  // Show main application if logged in
  if (!currentUser) {
    console.log('⚠️  Authenticated but no currentUser - returning null');
    return null; // Should never happen due to isAuthenticated check
  }

  console.log('✅ Rendering main application');
  return (
    <div className="min-h-screen bg-light-gray">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} currentUser={currentUser!} />
      <Header onNavigate={handleNavigate} onLogout={handleLogout} sidebarCollapsed={sidebarCollapsed} userProfile={{
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        profileImage: currentUser.profileImage
      }} currentUser={currentUser} />
      <PageContainer sidebarCollapsed={sidebarCollapsed}>
        <div className="space-y-4">
          {renderPage()}
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </PageContainer>

      {/* Modals */}
      <NewEventModal isOpen={activeModal === 'new-event'} onClose={handleCloseModal} onSuccess={handleAddEvent} users={users} clients={systemData.clients} eventCategories={systemData.eventcategorys} activationCategories={systemData.activationcategorys} operationCategories={systemData.operationcategorys} systemData={systemData} defaultEventGroup={modalData?.defaultEventGroup as 'Event' | 'Activation' | 'Operation' | undefined} onAddEventCategory={handleAddEventCategory} onAddActivationCategory={handleAddActivationCategory} onAddOperationCategory={handleAddOperationCategory} onAddClient={handleAddClient} onAddBrand={handleAddBrand} />
      <NewWalletModal isOpen={activeModal === 'new-wallet'} onClose={handleCloseModal} events={events} currentUser={currentUser!} onSuccess={(data: Partial<Wallet>) => {
      handleAddWallet(data);
      handleCloseModal();
    }} />
      <ConnectWalletModal
        isOpen={activeModal === 'connect-wallet'}
        onClose={handleCloseModal}
        eventId={selectedId || (modalData && typeof modalData.id === 'string' ? modalData.id : '')}
        eventName={events.find(e => e.id === (selectedId || (modalData && typeof modalData.id === 'string' ? modalData.id : '')))?.name || (modalData && typeof modalData.name === 'string' ? modalData.name : '') || ''}
        wallets={wallets}
        onSuccess={handleConnectWallet}
      />
      <EditWalletModal isOpen={activeModal === 'edit-wallet'} onClose={handleCloseModal} wallet={modalData as unknown as Wallet | undefined} onSuccess={(updatedWallet) => {
        handleEditWallet(updatedWallet);
        handleCloseModal();
      }} />
      <FundWalletModal
        isOpen={activeModal === 'fund-wallet'}
        onClose={handleCloseModal}
        wallets={wallets}
        paybillNumber={currentUser?.spendyPaybillNumber || '247247'}
        mpesaAccountRef={currentUser?.spendyAccountNumber}
        onSuccess={() => {
          showToast('Top-up initiated — your wallet will be credited shortly', 'success');
          handleCloseModal();
          walletCtrl.refreshWallets();
        }}
      />
      <WalletTransferModal isOpen={activeModal === 'wallet-transfer'} onClose={handleCloseModal} wallets={wallets} onSuccess={(updatedWallets, transferData) => {
        setWallets(updatedWallets);
        // Create paired transactions for wallet transfer
        if (transferData) {
          const fromWallet = wallets.find(w => w.id === transferData.fromWalletId);
          const toWallet = wallets.find(w => w.id === transferData.toWalletId);
          if (fromWallet && toWallet) {
            // Withdrawal from source wallet
            createTransaction(transferData.fromWalletId, 'Transfer', transferData.amount, `Transfer to ${toWallet.name}`);
            // Fund to destination wallet
            createTransaction(transferData.toWalletId, 'Transfer', transferData.amount, `Transfer from ${fromWallet.name}`);
            addActivityLog(`Wallet transfer completed`, `Transferred KES ${transferData.amount.toLocaleString()} from ${fromWallet.name} to ${toWallet.name}`);
          }
        }
        showToast('Transfer completed successfully', 'success');
        handleCloseModal();
      }} />
      <SendToSpendyAccountModal
        isOpen={activeModal === 'send-to-spendy-account'}
        onClose={handleCloseModal}
        wallets={wallets}
        onLookupAccount={async (accountNumber: string) => {
          try {
            const user = await (globalThis as any).API?.users?.lookupByAccountNumber(accountNumber);
            return user;
          } catch (error) {
            console.error('Error looking up account:', error);
            return null;
          }
        }}
        onSuccess={async (transferData) => {
          try {
            // Find the recipient user
            const recipientUser = await (globalThis as any).API?.users?.lookupByAccountNumber(transferData.recipientAccountNumber);

            if (!recipientUser) {
              showToast('Recipient account not found', 'error');
              return;
            }

            // Get all wallets to find recipient's main wallet
            const allWallets: Wallet[] = JSON.parse(localStorage.getItem('spendy_wallets') || '[]');
            const recipientMainWallet = allWallets.find(w =>
              w.companyId === recipientUser.companyName &&
              w.type === 'Main Wallet' &&
              w.isDefault === true
            );

            if (!recipientMainWallet) {
              showToast('Recipient wallet not found', 'error');
              return;
            }

            // Deduct from source wallet
            const sourceWallet = wallets.find(w => w.id === transferData.sourceWalletId);
            if (!sourceWallet || sourceWallet.balance < transferData.amount) {
              showToast('Insufficient balance', 'error');
              return;
            }

            // Update source wallet (deduct)
            const updatedSourceWallet = {
              ...sourceWallet,
              balance: sourceWallet.balance - transferData.amount
            };

            // Update recipient wallet (credit)
            const updatedRecipientWallet = {
              ...recipientMainWallet,
              balance: recipientMainWallet.balance + transferData.amount
            };

            // Update both wallets in storage
            const updatedAllWallets = allWallets.map(w => {
              if (w.id === updatedSourceWallet.id) return updatedSourceWallet;
              if (w.id === updatedRecipientWallet.id) return updatedRecipientWallet;
              return w;
            });

            localStorage.setItem('spendy_wallets', JSON.stringify(updatedAllWallets));

            // Update local state for current user's wallets
            const updatedLocalWallets = wallets.map(w =>
              w.id === updatedSourceWallet.id ? updatedSourceWallet : w
            );
            setWallets(updatedLocalWallets);

            // Create transactions for both parties
            createTransaction(
              transferData.sourceWalletId,
              'Transfer',
              transferData.amount,
              `Sent to ${recipientUser.companyName} (Acc: ${transferData.recipientAccountNumber})`
            );

            // Log activity
            addActivityLog(
              'Inter-account transfer completed',
              `Sent KES ${transferData.amount.toLocaleString()} to ${recipientUser.companyName}`
            );

            showToast(`Successfully sent KES ${transferData.amount.toLocaleString()} to ${recipientUser.companyName}`, 'success');
            handleCloseModal();
          } catch (error) {
            console.error('Transfer error:', error);
            showToast('Transfer failed. Please try again.', 'error');
          }
        }}
      />
      <AddExpenseModal
        isOpen={activeModal === 'add-expense'}
        onClose={handleCloseModal}
        events={events}
        suppliers={suppliers}
        systemData={systemData}
        currentUser={currentUser}
        onSuccess={handleAddExpense}
        onAddCategory={(category: string, expenseGroup?: string) => {
          // Add category to the appropriate array based on expense group
          const newCategory = { id: generateUUID(), name: category, status: 'Active', dateCreated: new Date().toISOString() };
          let updatedSystemData = { ...systemData };
          let categoryType = 'Expense';

          if (expenseGroup === 'Project Expenses') {
            updatedSystemData.expensecategorys = [
              ...(systemData.expensecategorys || []),
              newCategory
            ];
            categoryType = 'Expense';
          } else if (expenseGroup === 'Activation Expense') {
            updatedSystemData.activationcategorys = [
              ...(systemData.activationcategorys || []),
              newCategory
            ];
            categoryType = 'Activation';
          } else if (expenseGroup === 'Operational Expense') {
            updatedSystemData.operationcategorys = [
              ...(systemData.operationcategorys || []),
              newCategory
            ];
            categoryType = 'Operation';
          }

          handleUpdateSystemData(updatedSystemData);
          showToast(`${categoryType} category "${category}" added successfully`, 'success');
        }}
      />
      <AddExpenseModal
        isOpen={activeModal === 'edit-expense'}
        onClose={handleCloseModal}
        events={events}
        suppliers={suppliers}
        systemData={systemData}
        currentUser={currentUser}
        expense={modalData}
        onSuccess={handleEditExpense}
        onAddCategory={(category: string, expenseGroup?: string) => {
          const newCategory = { id: generateUUID(), name: category, status: 'Active', dateCreated: new Date().toISOString() };
          let updatedSystemData = { ...systemData };
          let categoryType = 'Expense';

          if (expenseGroup === 'Project Expenses') {
            updatedSystemData.expensecategorys = [
              ...(systemData.expensecategorys || []),
              newCategory
            ];
            categoryType = 'Expense';
          } else if (expenseGroup === 'Activation Expense') {
            updatedSystemData.activationcategorys = [
              ...(systemData.activationcategorys || []),
              newCategory
            ];
            categoryType = 'Activation';
          } else if (expenseGroup === 'Operational Expense') {
            updatedSystemData.operationcategorys = [
              ...(systemData.operationcategorys || []),
              newCategory
            ];
            categoryType = 'Operation';
          }

          handleUpdateSystemData(updatedSystemData);
          showToast(`${categoryType} category "${category}" added successfully`, 'success');
        }}
      />
      <RequestPaymentModal isOpen={activeModal === 'request-payment'} onClose={handleCloseModal} events={events} onSuccess={handleAddExpense} />
      <AllocateInventoryModal isOpen={activeModal === 'allocate-inventory'} onClose={handleCloseModal} inventory={inventory} events={events} onSuccess={() => {
      showToast('Inventory allocated successfully', 'success');
      handleCloseModal();
    }} />
      <UploadDocumentModal 
        isOpen={activeModal === 'upload-document'} 
        onClose={handleCloseModal} 
        eventId={selectedId || (typeof modalData?.id === 'string' ? modalData.id : '') || ''}
        onSuccess={handleUploadDocument}
      />
      <ApproveRejectModal isOpen={activeModal === 'approve-reject'} onClose={handleCloseModal} request={modalData as unknown as Request | null} wallets={wallets} suppliers={suppliers} onApprove={handleApproveRequest} onReject={handleRejectRequest} onInsufficientBalance={handleInsufficientBalance} currentUser={currentUser!} />
      <EditRequestModal isOpen={activeModal === 'edit-request'} onClose={handleCloseModal} request={modalData as Request | null} onSuccess={handleEditRequest} />
      <CreateUserModal isOpen={activeModal === 'create-user' || activeModal === 'edit-user'} onClose={handleCloseModal} editUser={activeModal === 'edit-user' && modalData && 'id' in modalData && typeof modalData.id === 'string' ? modalData as unknown as User : null} onSuccess={userData => {
      if (activeModal === 'edit-user' && modalData && 'id' in modalData && typeof modalData.id === 'string') {
        handleEditUser(modalData.id as string, userData);
      } else {
        handleAddUser(userData);
      }
      handleCloseModal();
    }} />
      <AddInventoryModal isOpen={activeModal === 'add-inventory'} onClose={handleCloseModal} onSuccess={handleAddInventory} />
      <CheckOutModal isOpen={activeModal === 'check-out'} onClose={handleCloseModal} onSuccess={handleCheckOut} item={modalData as InventoryItem | null} clients={systemData.clients} />
      <CheckInModal isOpen={activeModal === 'check-in'} onClose={handleCloseModal} onSuccess={handleCheckIn} item={modalData as InventoryItem | null} clients={systemData.clients} />
      <AddSupplierModal isOpen={activeModal === 'add-supplier'} onClose={handleCloseModal} supplierCategories={systemData.suppliercategorys || []} events={events} onSuccess={handleAddSupplier} />
      <EditSupplierModal isOpen={activeModal === 'edit-supplier'} onClose={handleCloseModal} supplierCategories={systemData.suppliercategorys || []} events={events} onSuccess={handleEditSupplier} supplier={modalData as Supplier | null} />
      <ViewSupplierModal isOpen={activeModal === 'view-supplier'} onClose={handleCloseModal} supplier={modalData as Supplier | null} onEdit={handleEditSupplier} onDelete={handleDeleteSupplier} />
      <AddInvoiceModal isOpen={activeModal === 'add-invoice'} onClose={handleCloseModal} onSuccess={handleAddInvoice} clients={systemData.clients} events={events} invoices={invoices} currentUser={currentUser!} products={products} />
      <EditInvoiceModal isOpen={activeModal === 'edit-invoice'} onClose={handleCloseModal} onSuccess={handleUpdateInvoice} invoice={modalData as Invoice | null} clients={systemData.clients} events={events} />
      <MakePaymentModal
        isOpen={activeModal === 'make-payment'}
        onClose={handleCloseModal}
        expenses={expenses}
        requests={requests}
        approvals={requests.filter(r => r.status === 'Approved')}
        payments={payments}
        currentUser={currentUser!}
        supplier={modalData && 'servicesProvided' in modalData ? modalData as unknown as Supplier : undefined}
        selectedApproval={modalData && 'servicesProvided' in modalData ? undefined : (modalData as unknown as Request | undefined)}
        selectedExpense={modalData && 'id' in modalData ? expenses.find(e => e.id === modalData.id) : undefined}
        wallets={wallets}
        onSuccess={handleMakePayment}
      />
      <PaySupplierModal isOpen={activeModal === 'pay-supplier'} onClose={handleCloseModal} supplier={modalData as unknown as Supplier | null} wallets={wallets} currentUser={currentUser!} onSuccess={handlePaySupplier} />
      <EditInventoryModal isOpen={activeModal === 'edit-inventory'} onClose={handleCloseModal} item={modalData as unknown as InventoryItem | undefined} onSuccess={data => {
      if (modalData && 'id' in modalData && typeof modalData.id === 'string') {
        handleEditInventory(modalData.id as string, data);
      }
    }} />
      <InsufficientBalanceModal isOpen={insufficientBalanceData !== null} onClose={() => setInsufficientBalanceData(null)} requiredAmount={insufficientBalanceData?.requiredAmount || 0} currentBalance={selectedWallet?.balance || 0} walletName={selectedWallet?.name || ''} availableWallets={wallets} onFundWallet={handleFundWalletFromInsufficient} onSelectWallet={handleSelectWalletFromInsufficient} onBillSupplier={handleBillSupplierFromInsufficient} />

      <EditMovementModal isOpen={activeModal === 'edit-movement'} onClose={handleCloseModal} movement={modalData as unknown as InventoryMovementDraft | undefined} onSave={(id, data) => handleEditMovement(id, data)} />

      <BatchDisbursementModal
        isOpen={activeModal === 'batch-disbursement'}
        onClose={handleCloseModal}
        expenses={expenses}
        wallets={wallets}
        currentUser={currentUser}
        onSuccess={handleMakePayment}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
