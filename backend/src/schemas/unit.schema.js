import { z } from 'zod';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const unitCreateSchema = z.object({
  unitCode: z
    .string()
    .regex(/^BU-[A-Za-z0-9-]{2,20}$/, 'Invalid unit code (e.g. BU-101)')
    .optional(),
  bloodGroup: z.enum(BLOOD_GROUPS),
  component: z.enum(['wholeBlood', 'prbc', 'ffp', 'platelets', 'cryo']),
  district: z.string().min(1, 'district is required'),
  collectionDate: z.string().min(1, 'collectionDate is required'),
  expiryDate: z.string().min(1, 'expiryDate is required'),
  storageLocation: z.string().min(1, 'storageLocation is required'),
  quantity: z.number().min(1),
  collectionStaff: z.string().min(1, 'collectionStaff is required'),
});

export const unitStatusSchema = z.object({
  status: z.enum([
    'Available',
    'UnderTesting',
    'Reserved',
    'Used',
    'Expired',
    'Discarded',
  ]),
  note: z.string().max(500).optional(),
});

export const testResultSchema = z.object({
  testStatus: z.enum(['Pending', 'Passed', 'Failed']),
  screeningResult: z.string().optional(),
  testedBy: z.string().optional(),
  testDate: z.string().optional(),
  remarks: z.string().optional(),
});
