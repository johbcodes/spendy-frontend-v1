import { z } from 'zod';

export const eventSchema = z.object({
  name: z.string().trim().min(1, 'Event name is required'),
  type: z.enum(['Project', 'Activation', 'Operation']).default('Project'),
  category: z.string().trim().optional(),
  client: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  brands: z.array(z.string().trim()).default([]),
  projectLeadId: z.string().trim().optional(),
  budget: z.coerce.number().min(0, 'Budget cannot be negative').default(0),
  spent: z.coerce.number().min(0, 'Spent cannot be negative').default(0),
  startDate: z.string().trim().min(1, 'Start date is required'),
  endDate: z.string().trim().optional(),
  status: z.string().trim().default('Planning'),
  location: z.string().trim().optional(),
});

export const eventFiltersSchema = z.object({
  searchTerm: z.string().default(''),
  status: z.string().default('all'),
  type: z.string().default('all'),
  client: z.string().default('all'),
});

export type EventFormValues = z.infer<typeof eventSchema>;
export type EventFiltersFormValues = z.infer<typeof eventFiltersSchema>;
