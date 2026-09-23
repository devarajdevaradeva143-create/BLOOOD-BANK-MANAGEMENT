import { asyncHandler } from '../middleware/asyncHandler.js';
import Donor from '../models/Donor.js';
import { genDonorId } from '../utils/ids.js';
import { logAudit } from '../middleware/audit.js';
import { verifyOtpInternal } from './otp.controller.js';

function parsePagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(query.limit, 10) || 20)
  );
  return { page, limit, skip: (page - 1) * limit };
}

/**
 * POST /api/donors  (public — OTP gate replaces auth)
 * Body: donor fields + { code } (mobile OTP, purpose 'donor').
 */
export const createDonor = asyncHandler(async (req, res) => {
  const { mobile, code, otp, otpCode, ...donorData } = req.body;
  const plainCode = code ?? otp ?? otpCode;

  if (!mobile) {
    return res.status(400).json({ message: 'mobile is required' });
  }
  if (!plainCode) {
    return res.status(400).json({ message: 'OTP code is required' });
  }

  await verifyOtpInternal(String(mobile).trim(), String(plainCode).trim(), 'donor');

  const donor = await Donor.create({
    ...donorData,
    mobile: String(mobile).trim(),
    donorId: genDonorId(),
    mobileVerified: true,
  });

  logAudit(null, 'donor.create', 'Donor', donor.donorId, req, {
    mobile: donor.mobile,
  });

  return res.status(201).json({ message: 'Donor registered', donor });
});

/**
 * GET /api/donors  (auth required at route level)
 * Query: ?bloodGroup=&district=&search=&page=&limit=
 */
export const listDonors = asyncHandler(async (req, res) => {
  const { bloodGroup, district, search } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = {};
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (district) filter.district = new RegExp(`^${String(district).trim()}$`, 'i');
  if (search) {
    const q = String(search).trim();
    filter.$or = [
      { fullName: new RegExp(q, 'i') },
      { donorId: new RegExp(q, 'i') },
      { mobile: new RegExp(q, 'i') },
    ];
  }

  const [data, total] = await Promise.all([
    Donor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Donor.countDocuments(filter),
  ]);

  return res.status(200).json({
    data,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

export default { createDonor, listDonors };
