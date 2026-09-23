import { Router } from 'express';
import { getAvailability } from '../controllers/availability.controller.js';

const router = Router();

// Public: GET /api/availability?districtId=&bloodGroup=&units=
router.get('/', getAvailability);

export default router;
