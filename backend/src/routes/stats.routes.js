import { Router } from 'express';
import { getStats } from '../controllers/stats.controller.js';

const router = Router();

// Public: GET /api/stats
router.get('/', getStats);

export default router;
