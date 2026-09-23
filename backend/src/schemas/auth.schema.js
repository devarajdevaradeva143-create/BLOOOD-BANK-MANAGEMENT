import { z } from 'zod';

export const loginSchema = z.object({
  staffId: z.string().min(1, 'staffId is required'),
  pin: z.string().min(4, 'pin must be at least 4 chars').max(10, 'pin must be at most 10 chars'),
});
