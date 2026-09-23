import { Router } from 'express';
import { z } from 'zod';
import { authRequired as requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { donorCreateSchema } from '../schemas/donor.schema.js';
import { createDonor, listDonors } from '../controllers/donors.controller.js';

const donorCreateWithOtpSchema = donorCreateSchema.extend({
  code: z.string().length(6, 'code must be 6 characters'),
});

const router = Router();

router.post('/', validate(donorCreateWithOtpSchema), createDonor);
router.get('/', requireAuth, listDonors);

export default router;
