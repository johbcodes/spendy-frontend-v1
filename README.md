# Spendy - Event Management & Financial System

A comprehensive event management and financial operations system built with React, TypeScript, and Vite. Spendy provides role-based access control, multi-company support, and complete financial tracking for events, operations, and activations.

## Features

### Core Modules

- **Dashboard** - Real-time overview of financial metrics, events, and activities
- **Events Management** - Create and manage Events, Operations, and Activations
- **Wallet System** - Multi-wallet support with company isolation and user personal wallets
- **Expenses** - Comprehensive expense tracking with approval workflows
- **Payments** - M-Pesa integration and wallet-to-wallet transfers
- **Approvals** - Role-based expense approval system
- **Inventory** - Track equipment with check-in/check-out functionality
- **Suppliers** - Supplier management with payment tracking
- **Invoicing** - Generate quotes, proforma invoices, and invoices
- **Products & Items** - Reusable product catalog for invoicing
- **Analytics** - Financial insights and reporting
- **Users** - Multi-user management with role-based access control
- **System Setup** - Company KYC, Spendy account configuration

### Key Capabilities

- **Role-Based Access Control (RBAC)**
  - Admin: Full system access
  - Staff: Expenses and Payments only
  - Store Manager: Inventory and Expenses
  - Approver: Event-scoped approval access

- **Multi-Company Support**
  - Complete data isolation between companies
  - Company-specific wallets, expenses, invoices, and products
  - Unique Spendy account numbers for inter-company payments

- **Wallet System**
  - Main Wallet, Operations Wallet, Events Wallet per company
  - Personal wallets for all users
  - Wallet-to-wallet transfers
  - Event type-based wallet routing

- **Approval Workflow**
  - Auto-approval for Staff and Store Manager roles
  - Admin approval required for other roles
  - Event type determines default wallet selection
  - Supplier assignment option for deferred payments

- **Invoice & Product Management**
  - Auto-save invoice line items as reusable products
  - Company-isolated product catalogs
  - Quote → Proforma/Invoice conversion
  - PDF export with company branding

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Storage**: LocalStorage (browser-based persistence)
- **Date Handling**: Nairobi timezone (EAT/UTC+3)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Modern web browser

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### First-Time Setup

1. Navigate to `http://localhost:5173`
2. Click "Sign Up" to create your company account
3. Fill in company details and KYC information
4. System automatically creates:
   - Admin user account
   - Main Wallet
   - Operations Wallet
   - Events Wallet
   - Admin personal wallet
5. Log in with your admin credentials
6. Add users via Users module (each gets a personal wallet)
7. Create events and start managing expenses

## Project Structure

```
src/
├── components/
│   ├── layout/          # Sidebar, Header, PageContainer
│   └── ui/              # Reusable UI components (Button, Input, Modal, etc.)
├── modals/              # Modal dialogs for various actions
├── pages/               # Main application pages
├── types/               # TypeScript type definitions
├── utils/               # Utility functions (accessControl, dateFormatter, etc.)
├── hooks/               # Custom React hooks
├── App.tsx              # Main application component
└── main.tsx             # Application entry point

public/
├── reset-and-fix.html   # Data reset utility
└── fix-wallets.html     # Wallet diagnostic tool
```

## Key Concepts

### Company Isolation

All data is filtered by `companyId` to ensure complete separation between companies:
- Wallets, Events, Expenses, Payments
- Invoices, Products, Suppliers, Inventory
- Each company operates independently within the same system

### Event Type → Wallet Mapping

When expenses are created:
- **Event** type → Routes to Events Wallet
- **Operation** type → Routes to Operations Wallet
- **Activation** type → Routes to Events Wallet

Admin can override wallet selection during approval.

### Approval Workflow

- **Staff** and **Store Manager**: Auto-approved (no approval required)
- **Admin**, **Approver**, other roles: Require approval
- Approval options:
  1. Approve with funds (select wallet)
  2. Assign to supplier (defer payment)

### User Wallets

All users receive personal wallets:
- Type: `USER`
- Linked to user via `ownerId`
- Company-isolated via `companyId`
- Staff see only their personal wallet in UI
- System uses company wallets behind the scenes for routing

## Development Utilities

### Reset System Data
Navigate to `/reset-and-fix.html` to completely wipe all localStorage data and start fresh.

### Wallet Diagnostics
Navigate to `/fix-wallets.html` to diagnose wallet isolation issues and assign missing companyIds.

## Data Persistence

Currently uses browser localStorage for data persistence. All data is stored locally in the browser:

- `users` - User accounts
- `currentUser` - Currently logged-in user
- `spendy_wallets` - All wallets across companies
- `spendy_events` - Events, operations, activations
- `spendy_expenses` - Expense records
- `spendy_payments` - Payment transactions
- `spendy_invoices` - Invoices, quotes, proformas
- `spendy_products` - Product catalog
- `spendy_suppliers` - Supplier records
- `spendy_inventory` - Inventory items
- `spendy_systemData` - Clients and system configuration
- `spendy_notifications` - System notifications

## Future Enhancements

- Backend API integration (replace localStorage)
- Real M-Pesa API integration
- Advanced analytics and reporting
- Multi-currency support
- Mobile application
- Bulk operations and imports
- Advanced search and filtering
- Audit trail and activity logs
- Email notifications
- File uploads and document management

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari

## Contributing

This is a private project. Please contact the project owner for contribution guidelines.

## License

Proprietary - All rights reserved

## Support

For issues or questions, please refer to the internal documentation or contact the development team.
