import mongoose from 'mongoose';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const historySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['registered', 'testingStarted', 'testCompleted', 'statusUpdated'],
    },
    at: { type: Date, default: Date.now },
    note: { type: String },
    status: { type: String },
    byUser: { type: String },
  },
  { _id: false }
);

const bloodUnitSchema = new mongoose.Schema(
  {
    unitCode: { type: String, required: true, unique: true, trim: true },
    bloodGroup: { type: String, required: true, enum: BLOOD_GROUPS },
    component: {
      type: String,
      required: true,
      enum: ['wholeBlood', 'prbc', 'ffp', 'platelets', 'cryo'],
    },
    district: { type: String, trim: true },
    collectionDate: { type: Date },
    expiryDate: { type: Date },
    storageLocation: { type: String, trim: true },
    quantity: { type: Number, min: 1 },
    collectionStaff: { type: String, trim: true },
    testStatus: {
      type: String,
      enum: ['Pending', 'Passed', 'Failed'],
      default: 'Pending',
    },
    status: {
      type: String,
      enum: [
        'Available',
        'UnderTesting',
        'Reserved',
        'Used',
        'Expired',
        'Discarded',
      ],
      default: 'UnderTesting',
    },
    screeningResult: { type: String },
    testedBy: { type: String },
    testDate: { type: Date },
    remarks: { type: String },
    history: { type: [historySchema], default: [] },
  },
  { timestamps: true }
);

bloodUnitSchema.index({ bloodGroup: 1, district: 1, status: 1 });
bloodUnitSchema.index({ expiryDate: 1 });

export default (
  mongoose.models.BloodUnit || mongoose.model('BloodUnit', bloodUnitSchema)
);
