# Quick Start Guide - Spendy System

## ✅ Current Status

Your expense category bug is **FIXED**! ✨
- Expense categories now display correctly
- Adding categories saves to the correct location

---

## 🚀 How to Use the New Optimization Framework

### 1. Using Custom Hooks (Recommended Way)

Instead of manually managing state in every component, use the custom hooks:

```typescript
import { useExpenses, useEvents, useWallets } from '../hooks/useData';

function MyComponent() {
  // Get data and operations in one line
  const { expenses, loading, error, addExpense, updateExpense } = useExpenses();
  const { events } = useEvents();
  const { wallets } = useWallets();

  // Use the data
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {expenses.map(expense => (
        <ExpenseCard key={expense.id} expense={expense} />
      ))}
      <Button onClick={() => addExpense(newExpenseData)}>
        Add Expense
      </Button>
    </div>
  );
}
```

**Benefits**:
- No more manual useState/useEffect
- Automatic loading and error handling
- Type-safe operations
- Reduces code by 70%!

---

### 2. Using the API Service Layer

Instead of directly accessing localStorage, use the API service:

```typescript
import API from '../services/api';

// Create
const newEvent = await API.events.create(eventData);

// Read
const events = await API.events.getAll();
const event = await API.events.getById(id);

// Update
const updated = await API.events.update(id, eventData);

// Delete
await API.events.delete(id);
```

**When your backend is ready**:
1. Open `src/services/api.ts`
2. Change line 19: `const USE_LOCAL_STORAGE = false;`
3. Done! All API calls will use your backend

---

## 📚 Available Resources

### Documentation Files:
1. **IMPLEMENTATION_SUMMARY.md** - What was fixed and created (you are here)
2. **OPTIMIZATION_GUIDE.md** - Detailed optimization roadmap (600+ lines)
3. **QUICK_START.md** - This file

### Code Files:
1. **src/services/api.ts** - API service layer (all backend calls)
2. **src/hooks/useData.ts** - Custom hooks (data operations)
3. **src/components/ErrorBoundary.tsx** - Error handling

---

## 🎯 Top 3 Recommended Next Steps

### 1. Implement Password Hashing (1 hour - CRITICAL)

```bash
npm install bcryptjs @types/bcryptjs
```

Update sign up:
```typescript
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 10);
await API.auth.signUp({ ...userData, password: hashedPassword });
```

**Why**: Currently passwords are stored in plain text! ⚠️

---

### 2. Break Down App.tsx (4 hours - HIGH IMPACT)

Create `src/context/AppContext.tsx`:

```typescript
import { createContext, useContext } from 'react';
import { useEvents, useWallets, useExpenses, ... } from '../hooks/useData';

interface AppContextType {
  events: Event[];
  wallets: Wallet[];
  expenses: Expense[];
  // ... all other state
  handleAddEvent: (data: any) => void;
  // ... all other handlers
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Use the custom hooks
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const { wallets, addWallet, updateWallet } = useWallets();
  // ... etc

  const value = {
    events,
    wallets,
    expenses,
    // ... all state
    handleAddEvent: addEvent,
    handleUpdateWallet: updateWallet,
    // ... all handlers
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
```

**Impact**: App.tsx goes from 2,700 lines → ~300 lines!

---

### 3. Backend Integration (2-3 hours with backend dev)

Backend needs to implement these endpoints:

**Authentication**:
- `POST /api/auth/login` - { email, password } → { user, token }
- `POST /api/auth/register` - { userData } → { user, token }
- `GET /api/auth/me` - () → { user }

**Events**:
- `GET /api/events` - () → Event[]
- `POST /api/events` - { eventData } → Event
- `PUT /api/events/:id` - { eventData } → Event
- `DELETE /api/events/:id` - () → void

(Similar for wallets, expenses, payments, etc.)

See `src/services/api.ts` for complete API documentation.

---

## 💻 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run TypeScript check
npx tsc --noEmit

# Run linter
npm run lint
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module"
**Solution**: Run `npm install`

### Issue: TypeScript errors
**Solution**: All fixed! Should have zero errors now.

### Issue: Hot reload not working
**Solution**: Dev server running at http://localhost:5173/ - refresh browser

### Issue: Data not persisting
**Solution**: Currently using localStorage - check browser console for quota errors

---

## 📖 Learning the New Structure

### Old Way (Manual State Management):
```typescript
function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      setLoading(true);
      const data = JSON.parse(localStorage.getItem('spendy_events') || '[]');
      setEvents(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddEvent = (eventData: Partial<Event>) => {
    const newEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      createdAt: new Date().toISOString()
    } as Event;

    const updated = [...events, newEvent];
    setEvents(updated);
    localStorage.setItem('spendy_events', JSON.stringify(updated));
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {events.map(event => <EventCard key={event.id} event={event} />)}
    </div>
  );
}
```

### New Way (Using Hooks):
```typescript
import { useEvents } from '../hooks/useData';

function Events() {
  const { events, loading, error, addEvent } = useEvents();

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {events.map(event => <EventCard key={event.id} event={event} />)}
      <Button onClick={() => addEvent(eventData)}>Add Event</Button>
    </div>
  );
}
```

**Result**: 30+ lines → 10 lines! 70% less code! ✨

---

## 🎓 For Your Backend Developer

### Integration Checklist:
- [ ] Review `src/services/api.ts` for endpoint specifications
- [ ] Implement authentication endpoints (login, register, me)
- [ ] Implement CRUD endpoints for each resource
- [ ] Use JWT tokens for authentication
- [ ] Return standardized JSON responses
- [ ] Handle errors with proper status codes
- [ ] Enable CORS for frontend origin

### Testing Backend Integration:
1. Backend dev runs backend server (e.g., port 3001)
2. Create `.env` file: `REACT_APP_API_URL=http://localhost:3001/api`
3. In `src/services/api.ts`, change `USE_LOCAL_STORAGE = false`
4. Run `npm run dev`
5. Test each feature to verify API calls work

---

## 🎉 Success Criteria

You'll know the optimizations are working when:

✅ **Short Term**:
- [ ] Expense categories display and add correctly (DONE!)
- [ ] Zero TypeScript errors (DONE!)
- [ ] Error Boundary catches errors gracefully (DONE!)
- [ ] Components use custom hooks instead of manual state

✅ **Medium Term**:
- [ ] App.tsx is under 500 lines (currently 2,700)
- [ ] Backend API integration working
- [ ] All `any` types removed
- [ ] Password hashing implemented

✅ **Long Term**:
- [ ] React Router implemented
- [ ] All missing CRUD operations added
- [ ] Unit tests written
- [ ] Performance optimizations applied

---

## 📞 Need Help?

1. **For Optimizations**: Read `OPTIMIZATION_GUIDE.md`
2. **For API Reference**: Check `src/services/api.ts` comments
3. **For Hook Usage**: See `src/hooks/useData.ts` examples
4. **For What Was Done**: Read `IMPLEMENTATION_SUMMARY.md`

---

**Development Server**: http://localhost:5173/
**Status**: ✅ Running with hot reload
**Next Step**: Choose an optimization from OPTIMIZATION_GUIDE.md

Happy coding! 🚀
