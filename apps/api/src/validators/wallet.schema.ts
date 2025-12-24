import { z } from 'zod';

export const topUpSchema = z.object({
  amount: z.number().min(10, 'Minimum top-up is 10 AED').max(10000, 'Maximum top-up is 10,000 AED'),
});

export const cvUnlockSchema = z.object({
  maidId: z.string().uuid('Invalid maid ID'),
});

export const transactionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type TopUpInput = z.infer<typeof topUpSchema>;
export type CvUnlockInput = z.infer<typeof cvUnlockSchema>;
export type TransactionsQuery = z.infer<typeof transactionsQuerySchema>;
