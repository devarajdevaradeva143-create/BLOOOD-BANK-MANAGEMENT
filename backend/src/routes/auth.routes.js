import { Router } from 'express';
import { authRequired as requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { loginSchema } from '../schemas/auth.schema.js';
import { login, refresh, logout, me } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
