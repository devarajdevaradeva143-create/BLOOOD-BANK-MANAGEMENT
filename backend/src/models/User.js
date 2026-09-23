import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, enum: ['Doctor', 'Staff'] },
    designation: { type: String, trim: true },
    pinHash: { type: String, required: true },
    refreshTokens: { type: [refreshTokenSchema], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
