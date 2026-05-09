# Spendy Refactoring Plan

## Current State Analysis

### Critical Issues

1. **App.tsx Size: 3,489 lines**
   - Massive monolithic component
   - All state management, business logic, and handlers in one file
   - Difficult to maintain, test, and debug
   - Risk of merge conflicts in team environments

2. **State Management**
   - 30+ useState hooks in App.tsx
   - No centralized state management
   - Props drilling through multiple component layers
   - Difficult to track state flow

3. **Business Logic**
   - 100+ handler functions in App.tsx
   - Mixed concerns (UI, data, API simulation)
   - Repeated patterns across handlers
   - No separation of concerns

4. **Data Layer**
   - localStorage operations scattered throughout
   - No data access abstraction
   - Merge-save pattern repeated in multiple places
   - No transaction management

## Refactoring Strategy

### Phase 1: Immediate Improvements (Can be done now)

#### 1.1 Extract Service Layer
Create dedicated services for data operations:

```
src/services/
├── walletService.ts      # Wallet CRUD operations
├── eventService.ts       # Event CRUD operations
├── expenseService.ts     # Expense CRUD operations
├── paymentService.ts     # Payment CRUD operations
├── invoiceService.ts     # Invoice CRUD operations
├── productService.ts     # Product CRUD operations
├── supplierService.ts    # Supplier CRUD operations
├── inventoryService.ts   # Inventory CRUD operations
├── userService.ts        # User CRUD operations
└── storageService.ts     # Base localStorage wrapper
```

Benefits:
- Single responsibility for each service
- Reusable data access patterns
- Easy to replace with API calls later
- Testable in isolation

#### 1.2 Extract Business Logic
Create custom hooks for complex business logic:

```
src/hooks/
├── useWallets.ts         # Wallet state & handlers
├── useEvents.ts          # Event state & handlers
├── useExpenses.ts        # Expense state & handlers
├── usePayments.ts        # Payment state & handlers
├── useInvoices.ts        # Invoice state & handlers
├── useProducts.ts        # Product state & handlers
├── useSuppliers.ts       # Supplier state & handlers
├── useInventory.ts       # Inventory state & handlers
├── useUsers.ts           # User state & handlers
├── useAuth.ts            # Authentication logic
└── useNotifications.ts   # Notification system
```

Benefits:
- Each hook manages related state and logic
- Reusable across components
- Easier to test
- App.tsx becomes a composition of hooks

#### 1.3 Extract Constants
Move magic strings and configuration to constants:

```
src/constants/
├── routes.ts             # Route definitions
├── modules.ts            # Module configurations
├── walletTypes.ts        # Wallet type definitions
├── roles.ts              # Role definitions
└── config.ts             # App configuration
```

#### 1.4 Extract Utilities
Consolidate utility functions:

```
src/utils/
├── validation.ts         # Input validation
├── formatting.ts         # Currency, date formatting
├── calculations.ts       # Financial calculations
├── filters.ts            # Data filtering utilities
└── generators.ts         # ID and number generation
```

### Phase 2: State Management (Future - requires more changes)

#### 2.1 Context-Based State Management
Replace props drilling with React Context:

```
src/contexts/
├── AuthContext.tsx       # Current user, auth state
├── WalletContext.tsx     # Wallet state
├── EventContext.tsx      # Event state
├── ExpenseContext.tsx    # Expense state
└── AppContext.tsx        # Global app state
```

OR

#### 2.2 State Management Library
Consider Zustand or Redux Toolkit:
- Centralized state
- DevTools integration
- Time-travel debugging
- Better performance

### Phase 3: Component Architecture (Future)

#### 3.1 Feature-Based Structure
Reorganize by feature instead of type:

```
src/features/
├── wallets/
│   ├── components/       # Wallet-specific components
│   ├── hooks/           # useWallets, useWalletTransfer
│   ├── services/        # walletService
│   ├── types/           # Wallet types
│   └── utils/           # Wallet utilities
├── events/
│   └── ...
├── expenses/
│   └── ...
└── ...
```

Benefits:
- Co-located related code
- Clear feature boundaries
- Easier to navigate
- Better for code splitting

#### 3.2 Component Decomposition
Break down large components:
- Maximum 200-300 lines per component
- Single responsibility
- Composition over inheritance

### Phase 4: Type Safety (Future)

#### 4.1 Stricter TypeScript
- Enable `strict` mode in tsconfig.json
- Remove optional chaining where not needed
- Add discriminated unions for type narrowing
- Use `as const` for literal types

#### 4.2 Validation Layer
Add runtime validation:
- Zod or Yup for schema validation
- Validate data at boundaries (localStorage, forms)
- Type guards for unknown data

### Phase 5: Performance (Future)

#### 5.1 Code Splitting
- Lazy load pages
- Separate chunks for each feature
- Reduce initial bundle size

#### 5.2 Memoization
- Use React.memo for expensive components
- useMemo for expensive calculations
- useCallback for event handlers passed as props

#### 5.3 Virtual Scrolling
For large lists:
- Expenses list
- Payments list
- Invoices list
- Use react-window or react-virtual

## Recommended Refactoring Order

### Priority 1 (Do First - Safe & High Impact)

1. **Extract storageService** (1-2 hours)
   - Create base service for localStorage operations
   - Replace direct localStorage calls
   - Test: Ensure no data loss

2. **Extract data services** (4-6 hours)
   - Create walletService, eventService, etc.
   - Move CRUD operations from App.tsx
   - Test: All operations work as before

3. **Extract constants** (1 hour)
   - Move magic strings to constants files
   - Update imports
   - Test: Build succeeds

4. **Extract utility functions** (2-3 hours)
   - Move validation, formatting functions
   - Consolidate duplicate code
   - Test: All utilities work

### Priority 2 (Do Second - Medium Risk)

5. **Create custom hooks** (8-12 hours)
   - Extract useWallets, useEvents, etc.
   - Move state and handlers
   - Test thoroughly after each hook

6. **Refactor App.tsx** (4-6 hours)
   - Compose with custom hooks
   - Remove extracted code
   - Simplify render logic
   - Test: Full application flow

### Priority 3 (Future - Higher Risk)

7. **Implement Context API** (8-12 hours)
   - Create contexts
   - Migrate from props drilling
   - Test: Complex component trees

8. **Feature-based restructure** (16-24 hours)
   - Reorganize file structure
   - Update all imports
   - Test: Everything still works

## Immediate Action Items (Before Push)

### Must Do:
1. ✅ Create comprehensive .gitignore
2. ✅ Create detailed README.md
3. ⏳ Remove debug files from tracking:
   - debug-storage.html
   - App.tsx.backup (if exists)
   - All *.md files except README.md (move to /docs)

4. ⏳ Clean up code:
   - Remove console.log statements (or wrap in DEV flag)
   - Remove commented code blocks
   - Fix any TypeScript warnings

5. ⏳ Create CONTRIBUTING.md guide

### Nice to Have:
1. Extract storageService (Quick win, 1-2 hours)
2. Extract constants (Quick win, 1 hour)
3. Add ESLint rules for code quality
4. Add Prettier for consistent formatting

## Testing Strategy

After each refactoring step:
1. Manual testing of affected features
2. Test user flows: Sign up → Add event → Create expense → Approve → Payment
3. Test company isolation
4. Test role-based access
5. Test wallet operations
6. Test invoice creation and product auto-save

## Risk Mitigation

1. **Create git branch for refactoring**
   ```bash
   git checkout -b refactor/service-layer
   ```

2. **Commit frequently**
   - Small, focused commits
   - Clear commit messages
   - Easy to revert if issues

3. **Keep working copy**
   - Don't delete old code until new code is proven
   - Use feature flags if needed

4. **Document breaking changes**
   - Update this document
   - Add migration notes

## Long-Term Vision

### Backend Integration (6+ months)
When ready to add backend:
- Services already abstracted
- Replace storageService with apiService
- Add authentication tokens
- Add error handling
- Add loading states

### Architecture Goal
```
Presentation Layer (Components)
        ↓
Business Logic Layer (Hooks)
        ↓
Service Layer (Services)
        ↓
Data Layer (API/Storage)
```

Clean separation of concerns, testable, maintainable.

## Metrics

### Current State
- App.tsx: 3,489 lines
- Total files: 123 TypeScript files
- Average component size: ~150 lines
- Largest file: App.tsx (3,489 lines)

### Target State
- App.tsx: < 300 lines
- Largest file: < 500 lines
- Average component size: < 200 lines
- Test coverage: > 70%

## Conclusion

The codebase is functional and feature-complete, but needs architectural improvements for long-term maintainability. The refactoring can be done incrementally without breaking existing functionality.

**Recommendation**: Before pushing to GitHub:
1. Clean up debug files
2. Add proper documentation
3. Consider extracting storageService and constants (quick wins)
4. Plan larger refactoring for future sprints

The code is ready to push as-is, but will benefit greatly from the refactoring outlined above.
