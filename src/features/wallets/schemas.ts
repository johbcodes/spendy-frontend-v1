import { z } from 'zod';

export const newWalletSchema = z.object({
  name: z.string().trim().min(1, 'Wallet name is required'),
  linkedEvent: z.string().optional(),
});

export const fundWalletSchema = z.object({
  walletId: z.string().min(1, 'Please select a wallet'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  paymentMethod: z.enum(['stk', 'paybill', 'till']),
  phoneNumber: z.string().optional(),
});

export const transferSchema = z.object({
  fromWalletId: z.string().min(1, 'Please select a source wallet'),
  toWalletId: z.string().min(1, 'Please select a destination wallet'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  notes: z.string().optional(),
}).refine(data => data.fromWalletId !== data.toWalletId, {
  message: 'Source and destination wallets must be different',
  path: ['toWalletId'],
});

export const sendToSpendySchema = z.object({
  sourceWalletId: z.string().min(1, 'Please select a wallet'),
  recipientAccountNumber: z.string().length(6, 'Account number must be 6 digits'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  reference: z.string().optional(),
});

export type NewWalletFormValues = z.infer<typeof newWalletSchema>;
export type FundWalletFormValues = z.infer<typeof fundWalletSchema>;
export type TransferFormValues = z.infer<typeof transferSchema>;
export type SendToSpendyFormValues = z.infer<typeof sendToSpendySchema>;
