import { asyncHandler } from '../middleware/asyncHandler.js';
import BloodUnit from '../models/BloodUnit.js';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/**
 * GET /api/availability (public)
 * Query: ?districtId=&bloodGroup=&units= (alias: required)
 * Sums `quantity` for units that are Available + Passed + not expired.
 */
export const getAvailability = asyncHandler(async (req, res) => {
  const { districtId, district, bloodGroup } = req.query;
  const districtKey = districtId || district;
  const requiredRaw = req.query.units ?? req.query.required ?? 1;

  if (!districtKey) {
    return res.status(400).json({ message: 'districtId is required' });
  }
  if (!bloodGroup) {
    return res.status(400).json({ message: 'bloodGroup is required' });
  }
  if (!BLOOD_GROUPS.includes(bloodGroup)) {
    return res.status(400).json({ message: 'Invalid bloodGroup' });
  }

  const required = Number(requiredRaw);
  if (!Number.isFinite(required) || required < 0) {
    return res.status(400).json({ message: 'Invalid units value' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows = await BloodUnit.aggregate([
    {
      $match: {
        district: String(districtKey).trim(),
        bloodGroup,
        status: 'Available',
        testStatus: 'Passed',
        expiryDate: { $gte: today },
      },
    },
    { $group: { _id: null, total: { $sum: '$quantity' } } },
  ]);

  const available = rows[0]?.total || 0;
  const isAvailable = required > 0 ? available >= required : available > 0;

  return res.status(200).json({
    districtId: String(districtKey).trim(),
    bloodGroup,
    available,
    required,
    isAvailable,
  });
});

export default { getAvailability };
