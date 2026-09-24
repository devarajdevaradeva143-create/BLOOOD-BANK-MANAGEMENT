import { asyncHandler } from '../middleware/asyncHandler.js';
import Donor from '../models/Donor.js';
import BloodRequest from '../models/BloodRequest.js';
import BloodUnit from '../models/BloodUnit.js';

/**
 * GET /api/stats (public)
 * Live counters for the donor/request homepages.
 * No auth — aggregates only, no personal data.
 */
export const getStats = asyncHandler(async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [donors, requests, fulfilledAgg, availableAgg] = await Promise.all([
    Donor.countDocuments(),
    BloodRequest.countDocuments(),
    BloodRequest.aggregate([
      { $match: { status: 'fulfilled' } },
      { $group: { _id: null, units: { $sum: '$units' } } },
    ]),
    BloodUnit.aggregate([
      {
        $match: {
          status: 'Available',
          testStatus: 'Passed',
          expiryDate: { $gte: today },
        },
      },
      { $group: { _id: null, units: { $sum: '$quantity' } } },
    ]),
  ]);

  const fulfilledUnits = fulfilledAgg[0]?.units || 0;
  const availableUnits = availableAgg[0]?.units || 0;

  return res.status(200).json({
    donors,
    requests,
    fulfilledUnits,
    // One donation can help up to three patients.
    livesSupported: fulfilledUnits * 3,
    availableUnits,
  });
});

export default { getStats };
