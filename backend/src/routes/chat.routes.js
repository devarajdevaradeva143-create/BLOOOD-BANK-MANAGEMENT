import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { chatLimiter } from '../middleware/rateLimit.js';
import { postChat } from '../controllers/chat.controller.js';

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'content required').max(2000, 'message too long'),
});

const chatSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(10),
  lang: z.enum(['en', 'ta']).default('en'),
  page: z.enum(['donor', 'request']).default('donor'),
});

const router = Router();

router.post('/', chatLimiter, validate(chatSchema), postChat);

export default router;
