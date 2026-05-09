import { useState } from 'react';
import { LayoutDashboardIcon, CalendarIcon, WalletIcon, PackageIcon, UsersIcon, TrendingUpIcon, UserIcon, SettingsIcon, LogOutIcon, ChevronDownIcon, ChevronRightIcon, FileTextIcon, CreditCardIcon, CheckCircleIcon, TruckIcon, MenuIcon, FileIcon, BoxIcon } from 'lucide-react';
import { User, UserModule } from '../../types';
import { hasModuleAccess, getAccessibleMenuItems } from '../../utils/accessControl';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: User;
}

export function Sidebar({
  currentPage,
  onNavigate,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  currentUser
}: SidebarProps) {
  const [walletsExpanded, setWalletsExpanded] = useState(true);
  const [invoicesExpanded, setInvoicesExpanded] = useState(true);

  // Define the complete menu structure with module associations
  const allMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboardIcon,
      module: 'Dashboard' as UserModule
    },
    {
      id: 'events',
      label: 'Events',
      icon: CalendarIcon,
      module: 'Events' as UserModule
    },
    {
      id: 'wallets',
      label: 'Wallets',
      icon: WalletIcon,
      expandable: true,
      module: 'Wallets' as UserModule,
      subItems: [
        {
          id: 'wallets',
          label: 'Overview',
          icon: WalletIcon,
          module: 'Wallets' as UserModule
        },
        {
          id: 'expenses',
          label: 'Expenses',
          icon: FileTextIcon,
          module: 'Expenses' as UserModule
        },
        {
          id: 'payments',
          label: 'Payments',
          icon: CreditCardIcon,
          module: 'Payments' as UserModule
        },
        {
          id: 'approvals',
          label: 'Approvals',
          icon: CheckCircleIcon,
          module: 'Approvals' as UserModule
        }
      ]
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: FileTextIcon,
      module: 'Invoices' as UserModule
    },
    {
      id: 'products',
      label: 'Products & Items',
      icon: BoxIcon,
      module: 'Products' as UserModule
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: PackageIcon,
      module: 'Inventory' as UserModule
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: TruckIcon,
      module: 'Suppliers' as UserModule
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUpIcon,
      module: 'Analytics' as UserModule
    },
    {
      id: 'users',
      label: 'Users',
      icon: UsersIcon,
      module: 'Users' as UserModule
    }
  ];

  // For staff users, show Dashboard, Expenses, Payments, Make Payment, and My Account
  const isStaffUser = currentUser?.role === 'Staff';
  const staffMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboardIcon,
      module: 'Dashboard' as UserModule
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: FileTextIcon,
      module: 'Expenses' as UserModule
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCardIcon,
      module: 'Payments' as UserModule
    }
  ];

  // For approver users, show Dashboard, Events, Approvals, Inventory, Expenses, Payments, and Invoices
  const isApproverUser = currentUser?.role === 'Approver';
  const approverMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboardIcon
    },
    {
      id: 'events',
      label: 'Events',
      icon: CalendarIcon,
      module: 'Events' as UserModule
    },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: CheckCircleIcon,
      module: 'Approvals' as UserModule
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: PackageIcon,
      module: 'Inventory' as UserModule
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: FileTextIcon,
      module: 'Expenses' as UserModule
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCardIcon,
      module: 'Payments' as UserModule
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: FileIcon,
      module: 'Invoices' as UserModule
    }
  ];

  // For store manager users, show Dashboard, Inventory, and My Account
  const isStoreManagerUser = currentUser?.role === 'Store Manager';
  const storeManagerMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboardIcon
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: PackageIcon,
      module: 'Inventory' as UserModule
    }
  ];

  // Filter menu items based on user access using the new access control system
  const filteredMenuItems = getAccessibleMenuItems(currentUser, allMenuItems);

  const bottomItems = [
    {
      id: 'my-account',
      label: 'My Account',
      icon: UserIcon
    },
    {
      id: 'system-setup',
      label: 'System Setup',
      icon: SettingsIcon,
      module: 'System Setup' as UserModule
    }
  ];

  // Filter bottom items - My Account is always shown, System Setup requires module access
  const filteredBottomItems = bottomItems.filter(item => {
    if (item.id === 'my-account') return true;
    return hasModuleAccess(currentUser, item.module as UserModule);
  });

  const isActive = (itemId: string) => currentPage === itemId;

  return (
    <div className={`bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 ease-in-out z-40 shadow-lg shadow-gray-200/50 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo & Toggle */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <img src="/Spendy_1.png" alt="Spendy" className="h-8 transition-all duration-300 animate-fadeIn" />
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 group"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <MenuIcon className="w-5 h-5 text-gray-700 group-hover:text-azure transition-colors duration-200" />
        </button>
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {(isStaffUser ? staffMenuItems : isApproverUser ? approverMenuItems : isStoreManagerUser ? storeManagerMenuItems : filteredMenuItems).map(item => (
            <div key={item.id}>
              {item.expandable ? (
                <>
                  <button
                    onClick={() => {
                      if (isCollapsed) {
                        onToggleCollapse();
                        if (item.id === 'wallets') {
                          setWalletsExpanded(true);
                        } else if (item.id === 'invoices') {
                          setInvoicesExpanded(true);
                        }
                      } else {
                        if (item.id === 'wallets') {
                          setWalletsExpanded(!walletsExpanded);
                        } else if (item.id === 'invoices') {
                          setInvoicesExpanded(!invoicesExpanded);
                        }
                      }
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-sm group"
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5 flex-shrink-0 group-hover:text-azure transition-colors duration-200" />
                      {!isCollapsed && (
                        <span className="font-medium group-hover:text-azure transition-colors duration-200">
                          {item.label}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      (item.id === 'wallets' ? walletsExpanded : item.id === 'invoices' ? invoicesExpanded : false) ? (
                        <ChevronDownIcon className="w-4 h-4 transition-transform duration-200" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4 transition-transform duration-200" />
                      )
                    )}
                  </button>
                  {!isCollapsed && (item.id === 'wallets' ? walletsExpanded : item.id === 'invoices' ? invoicesExpanded : false) && item.subItems && (
                    <div className="ml-4 mt-1 space-y-1 animate-slideIn">
                      {item.subItems
                        .filter((subItem: any) => hasModuleAccess(currentUser, subItem.module))
                        .map((subItem: any) => (
                          <button
                            key={subItem.id}
                            onClick={() => onNavigate(subItem.id)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                              isActive(subItem.id)
                                ? 'bg-azure bg-opacity-15 text-azure font-medium shadow-sm shadow-blue-200/50'
                                : 'text-gray-600 hover:bg-blue-50 hover:text-azure hover:translate-x-1'
                            }`}
                          >
                            <subItem.icon className="w-4 h-4" />
                            <span>{subItem.label}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive(item.id)
                      ? 'bg-azure bg-opacity-15 text-azure font-medium shadow-sm shadow-blue-200/50'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-azure hover:translate-x-1'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Menu */}
      <div className="border-t border-gray-200 p-3 space-y-1">
        {filteredBottomItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isActive(item.id)
                ? 'bg-azure bg-opacity-15 text-azure font-medium shadow-sm'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200"
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOutIcon className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
