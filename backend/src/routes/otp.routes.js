import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { otpRequestSchema, otpVerifySchema } from '../schemas/otp.schema.js';
import { requestOtp, verifyOtp } from '../controllers/otp.controller.js';

const router = Router();

router.post('/request', authLimiter, validate(otpRequestSchema), requestOtp);
router.post('/verify', authLimiter, validate(otpVerifySchema), verifyOtp);

export default router;
