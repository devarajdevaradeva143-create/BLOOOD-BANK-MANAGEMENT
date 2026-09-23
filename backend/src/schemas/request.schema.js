import { z } from 'zod';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const genderSchema = z.preprocess(
  (v) => {
    const s = String(v || '').trim().toLowerCase();
    if (!s) return v;
    return s.charAt(0).toUpperCase() + s.slice(1);
  },
  z.enum(['Male', 'Female', 'Other', 'Transgender'])
);

export const requestCreateSchema = z.object({
  patientName: z.string().min(3, 'patientName must be at least 3 chars'),
  patientAge: z.number().min(0).max(120),
  gender: genderSchema,
  bloodGroup: z.enum(BLOOD_GROUPS),
  units: z.number().int().min(1).max(50),
  requiredDate: z.string().min(1, 'requiredDate is required'),
  reason: z.string().min(3, 'reason must be at least 3 chars'),
  districtId: z.string().min(1, 'districtId is required'),
  hospitalName: z.string().min(1, 'hospitalName is required'),
  hospitalAddress: z.string().min(5, 'hospitalAddress must be at least 5 chars'),
  contact: z.string().regex(/^\d{10}$/, 'contact must be 10 digits'),
  requestType: z.enum(['emergency', 'normal']),
});

export const requestStatusSchema = z.object({
  status: z.enum(['submitted', 'approved', 'fulfilled', 'cancelled']),
});
