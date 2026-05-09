import { z } from 'zod';

export const expenseSchema = z.object({
  title: z.string().trim().min(1, 'Expense title is required'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  category: z.string().trim().min(1, 'Category is required'),
  eventId: z.string().trim().min(1, 'Event is required'),
  description: z.string().trim().optional(),
  supplierId: z.string().trim().optional(),
  batchPaymentDetails: z.array(z.unknown()).optional(),
});

export const expenseFiltersSchema = z.object({
  searchTerm: z.string().default(''),
  eventId: z.string().default('all'),
  category: z.string().default('all'),
  status: z.string().default('all'),
  type: z.string().default('all'),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
export type ExpenseFiltersFormValues = z.infer<typeof expenseFiltersSchema>;
