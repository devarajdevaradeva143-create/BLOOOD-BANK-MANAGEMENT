import mongoose from 'mongoose';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const bloodRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true, trim: true },
    patientName: { type: String, required: true, trim: true },
    patientAge: { type: Number, min: 0, max: 120 },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Transgender'] },
    bloodGroup: { type: String, required: true, enum: BLOOD_GROUPS },
    units: { type: Number, required: true, min: 1, max: 50 },
    requiredDate: { type: Date },
    reason: { type: String, trim: true },
    districtId: { type: String, trim: true },
    hospitalName: { type: String, trim: true },
    hospitalAddress: { type: String, trim: true },
    contact: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, 'Contact must be 10 digits'],
    },
    contactVerified: { type: Boolean, default: false },
    requestType: { type: String, enum: ['emergency', 'normal'] },
    status: {
      type: String,
      enum: ['submitted', 'approved', 'fulfilled', 'cancelled'],
      default: 'submitted',
    },
  },
  { timestamps: true }
);

bloodRequestSchema.index({ districtId: 1, bloodGroup: 1, status: 1 });

export default (
  mongoose.models.BloodRequest || mongoose.model('BloodRequest', bloodRequestSchema)
);
