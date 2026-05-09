import { z } from 'zod';

export const paymentFiltersSchema = z.object({
  searchTerm: z.string(),
  status: z.string(),
});
