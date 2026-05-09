# How to Start Using the New Infrastructure

This guide shows you exactly how to start using the new security, validation, and error handling features that are ready to use right now!

## 1. Add Password Hashing to Sign Up 🔒

### Current Code (Insecure)
```typescript
// src/pages/SignUp.tsx - Currently stores passwords in plain text
const handleSignUp = (userData: SignUpData) => {
  onSignUp({
    ...userData,
    password: userData.password // ❌ Plain text password!
  });
};
```

### New Code (Secure)
```typescript
// src/pages/SignUp.tsx - Secure password hashing
import { hashPassword } from '../utils/auth';

const handleSignUp = async (userData: SignUpData) => {
  try {
    // Hash the password before storing
    const hashedPassword = await hashPassword(userData.password);

    onSignUp({
      ...userData,
      password: hashedPassword // ✅ Secure hashed password
    });
  } catch (error) {
    console.error('Error during sign up:', error);
    // Show error to user
  }
};
```

## 2. Add Password Verification to Sign In 🔐

### Current Code
```typescript
// src/pages/SignIn.tsx - Plain text comparison
const user = users.find(u => u.email === email);
if (user && user.password === password) {
  // Login successful
}
```

### New Code (Supports Both Old and New Passwords)
```typescript
// src/pages/SignIn.tsx - Secure password verification
import { verifyPassword } from '../utils/auth';

const user = users.find(u => u.email === email);
if (user) {
  // Check if password is hashed (starts with $2) or plain text (legacy)
  const isPasswordValid = user.password.startsWith('$2')
    ? await verifyPassword(password, user.password) // New: bcrypt verification
    : password === user.password; // Old: plain text comparison (for migration)

  if (isPasswordValid) {
    // Login successful
    // Optionally: If it was plain text, update to hashed
    if (!user.password.startsWith('$2')) {
      const hashedPassword = await hashPassword(password);
      updateUserPassword(user.id, hashedPassword);
    }
  }
}
```

## 3. Add Form Validation 📝

### Example: Add Expense Modal

#### Current Code
```typescript
// src/modals/AddExpenseModal.tsx - Manual validation
const handleSubmit = () => {
  if (!title) {
    alert('Title is required');
    return;
  }
  if (amount <= 0) {
    alert('Amount must be positive');
    return;
  }
  // More manual checks...
  onSubmit(formData);
};
```

#### New Code (Type-Safe with Zod)
```typescript
// src/modals/AddExpenseModal.tsx - Automated validation
import { ExpenseSchema, validate, getFirstError } from '../validation/schemas';

const handleSubmit = () => {
  // Validate all fields at once
  const result = validate(ExpenseSchema, formData);

  if (!result.success) {
    // Show the first error (or all errors)
    const errorMessage = getFirstError(result.errors);
    alert(errorMessage);

    // Or show all errors in form
    setFormErrors(result.errors);
    return;
  }

  // Data is now type-safe and validated!
  onSubmit(result.data);
};
```

### Available Validation Schemas

```typescript
import {
  // Authentication
  SignInSchema,
  SignUpSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,

  // Business Logic
  EventSchema,
  ExpenseSchema,
  BatchExpenseSchema,
  WalletSchema,
  WalletTransferSchema,
  FundWalletSchema,
  PaymentSchema,
  SupplierSchema,
  InventorySchema,
  CheckOutSchema,
  CheckInSchema,
  UserSchema,

  // Helper function
  validate,
  getFirstError
} from '../validation/schemas';
```

## 4. Replace localStorage Calls 💾

### Current Code (Error-Prone)
```typescript
// Prone to JSON parse errors, quota issues
const data = JSON.parse(localStorage.getItem('key') || '[]');
localStorage.setItem('key', JSON.stringify(data));
```

### New Code (Safe and Automatic)
```typescript
import { safeGetLocalStorage, safeSetLocalStorage } from '../utils/errorHandler';

// Automatically handles errors, missing keys, and quota issues
const data = safeGetLocalStorage('key', []); // Returns [] if key doesn't exist
const success = safeSetLocalStorage('key', data); // Returns true/false

if (!success) {
  // Storage failed (very rare)
  console.error('Failed to save data');
}
```

**Benefits**:
- Automatic error handling
- Automatic quota management (trims old data if needed)
- Type-safe default values
- No more try-catch blocks needed

## 5. Add Custom Error Handling 🚨

### Current Code
```typescript
// Generic error messages
catch (error) {
  alert('Something went wrong');
}
```

### New Code (User-Friendly)
```typescript
import { AppError, getErrorMessage, logError } from '../utils/errorHandler';

try {
  // Your code here
  if (!data) {
    throw new AppError(
      'Please select an event before adding expenses',
      'VALIDATION_ERROR',
      400
    );
  }
} catch (error) {
  // Get user-friendly message
  const message = getErrorMessage(error, 'Adding expense');

  // Log for debugging
  logError(error, 'AddExpense');

  // Show to user
  alert(message);
}
```

### Creating Custom Errors

```typescript
import { AppError } from '../utils/errorHandler';

// Validation error
throw new AppError(
  'Email is required',
  'VALIDATION_ERROR',
  400
);

// Permission error
throw new AppError(
  'You do not have permission to delete this item',
  'PERMISSION_DENIED',
  403
);

// Not found error
throw new AppError(
  'Event not found',
  'NOT_FOUND',
  404
);
```

## 6. Example: Refactoring a Complete Form

Let's refactor the Add Expense Modal as a complete example:

### Before
```typescript
// src/modals/AddExpenseModal.tsx - BEFORE
export function AddExpenseModal({ onClose, onSubmit, eventId }: Props) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');

  const handleSubmit = () => {
    // Manual validation
    if (!title) {
      alert('Title is required');
      return;
    }
    if (amount <= 0) {
      alert('Amount must be positive');
      return;
    }
    if (!category) {
      alert('Category is required');
      return;
    }

    // Submit
    try {
      onSubmit({
        title,
        amount,
        category,
        eventId,
        date: new Date().toISOString()
      });
      onClose();
    } catch (error) {
      alert('Error adding expense');
    }
  };

  // ... rest of component
}
```

### After (With All New Features)
```typescript
// src/modals/AddExpenseModal.tsx - AFTER
import { ExpenseSchema, validate, getFirstError } from '../validation/schemas';
import { AppError, getErrorMessage, logError } from '../utils/errorHandler';
import { safeSetLocalStorage } from '../utils/errorHandler';

export function AddExpenseModal({ onClose, onSubmit, eventId }: Props) {
  const [formData, setFormData] = useState({
    title: '',
    amount: 0,
    category: '',
    eventId,
    date: new Date().toISOString(),
    description: '',
    receiptUrl: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    try {
      // 1. Validate using Zod schema
      const result = validate(ExpenseSchema, formData);

      if (!result.success) {
        setErrors(result.errors);
        const firstError = getFirstError(result.errors);
        throw new AppError(firstError || 'Validation failed', 'VALIDATION_ERROR');
      }

      // 2. Submit validated data
      onSubmit(result.data);

      // 3. Save to localStorage safely
      const expenses = safeGetLocalStorage('spendy_expenses', []);
      safeSetLocalStorage('spendy_expenses', [...expenses, result.data]);

      onClose();

    } catch (error) {
      // 4. User-friendly error handling
      const message = getErrorMessage(error, 'Adding expense');
      logError(error, 'AddExpenseModal');

      alert(message);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // ... rest of component with error display
  return (
    <div>
      <input
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        className={errors.title ? 'border-red-500' : ''}
      />
      {errors.title && <span className="text-red-500">{errors.title}</span>}
      {/* ... other fields */}
    </div>
  );
}
```

## 7. Password Strength Indicator

Add a password strength indicator to your sign-up form:

```typescript
import { validatePasswordStrength } from '../utils/auth';

const [password, setPassword] = useState('');
const [strengthMessage, setStrengthMessage] = useState('');

const handlePasswordChange = (value: string) => {
  setPassword(value);

  const strength = validatePasswordStrength(value);
  setStrengthMessage(strength.message);

  // You can also show visual indicator
  // strength.isValid = true/false
};

return (
  <div>
    <input
      type="password"
      value={password}
      onChange={(e) => handlePasswordChange(e.target.value)}
    />
    <p className={strength.isValid ? 'text-green-500' : 'text-red-500'}>
      {strengthMessage}
    </p>
  </div>
);
```

## 8. Email Validation

Validate email addresses before submission:

```typescript
import { validateEmail } from '../utils/auth';

const handleEmailChange = (value: string) => {
  setEmail(value);

  if (value && !validateEmail(value)) {
    setEmailError('Please enter a valid email address');
  } else {
    setEmailError('');
  }
};
```

## Quick Reference

### Import Statements You'll Need

```typescript
// Password Security
import { hashPassword, verifyPassword, validatePasswordStrength, validateEmail } from '../utils/auth';

// Validation
import {
  ExpenseSchema,
  EventSchema,
  SignUpSchema,
  validate,
  getFirstError
} from '../validation/schemas';

// Error Handling
import {
  AppError,
  getErrorMessage,
  logError,
  safeGetLocalStorage,
  safeSetLocalStorage,
  handleStorageQuotaError
} from '../utils/errorHandler';
```

## Testing Your Changes

After implementing these features:

1. **Test Password Hashing**:
   - Sign up a new user
   - Check localStorage - password should start with `$2`
   - Log in with the new user
   - Should work correctly

2. **Test Validation**:
   - Try submitting forms with invalid data
   - Should see clear, helpful error messages
   - Valid data should submit successfully

3. **Test Error Handling**:
   - Errors should be logged to console
   - Users should see friendly messages
   - App should not crash

## Benefits You'll See Immediately

✅ **Security**: Passwords are hashed, not stored in plain text
✅ **Reliability**: Validation catches errors before they cause problems
✅ **User Experience**: Clear, helpful error messages
✅ **Developer Experience**: Less code, fewer bugs
✅ **Type Safety**: Validation errors caught at runtime and compile-time

---

Start with one or two changes (password hashing and validation are good first steps), test them thoroughly, then gradually add the rest. You don't need to change everything at once!
