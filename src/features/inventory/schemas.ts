import { z } from 'zod';
import { INVENTORY_CONDITIONS } from './rules';

export const inventoryItemSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required'),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  quantity: z.coerce.number().int().positive('Quantity must be greater than zero'),
  location: z.string().trim().optional(),
  condition: z.enum(INVENTORY_CONDITIONS).default('Good'),
  costPerItem: z.coerce.number().min(0).default(0),
  rentalPrice: z.coerce.number().min(0).default(0),
});

export const inventoryCheckoutSchema = z.object({
  quantity: z.coerce.number().int().positive(),
  eventId: z.string().trim().min(1, 'Event is required'),
  conditionOut: z.string().trim().min(1, 'Condition is required'),
  notes: z.string().trim().optional(),
});

export const inventoryCheckinSchema = z.object({
  checkoutId: z.string().trim().min(1, 'Checkout record is required'),
  conditionIn: z.string().trim().min(1, 'Return condition is required'),
  notes: z.string().trim().optional(),
});

export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;
export type InventoryCheckoutFormValues = z.infer<typeof inventoryCheckoutSchema>;
export type InventoryCheckinFormValues = z.infer<typeof inventoryCheckinSchema>;
