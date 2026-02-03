import { z } from 'zod';

/**
 * Schema for creating an office with admin account
 */
export const createOfficeWithAdminSchema = z.object({
  office: z.object({
    name: z.string().min(1, 'Office name is required').max(255),
    nameAr: z.string().max(255).optional(),
    phone: z.string().min(1, 'Phone is required').max(20),
    email: z.string().email('Invalid email').max(255).optional(),
    address: z.string().optional(),
    addressAr: z.string().optional(),
    scopes: z.array(z.enum(['recruitment', 'leasing', 'typing'])).min(1, 'At least one scope required').default(['recruitment']),
    emirate: z.string().max(50).optional(),
  }),
  admin: z.object({
    email: z.string().email('Invalid admin email'),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    name: z.string().max(255).optional(),
  }),
  autoVerify: z.boolean().default(true),
});

export type CreateOfficeWithAdminInput = z.infer<typeof createOfficeWithAdminSchema>;

/**
 * Schema for approving/rejecting an office
 */
export const approveOfficeSchema = z.object({
  approved: z.boolean(),
  reason: z.string().max(500).optional(),
});

export type ApproveOfficeInput = z.infer<typeof approveOfficeSchema>;

/**
 * Schema for resetting office admin password
 */
export const resetOfficePasswordSchema = z.object({
  adminUserId: z.string().uuid('Invalid admin user ID'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

export type ResetOfficePasswordInput = z.infer<typeof resetOfficePasswordSchema>;

/**
 * Schema for creating a maid for a specific office
 */
export const createMaidForOfficeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  nameAr: z.string().max(255).optional(),
  nationalityId: z.string().uuid('Invalid nationality ID'),
  dateOfBirth: z.string(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  religion: z.enum(['muslim', 'non_muslim']),
  experienceYears: z.number().int().min(0).optional(),
  salary: z.string(),
  photoUrl: z.string().optional(),
  status: z.enum(['available', 'inactive', 'busy', 'reserved']).optional(),
  serviceType: z.enum(['individual', 'business', 'cleaning', 'cooking', 'babysitter', 'elderly', 'driver']).optional(),
  bio: z.string().optional(),
  bioAr: z.string().optional(),
  sex: z.enum(['male', 'female']).optional(),
  educationLevel: z.enum(['college', 'high_school', 'primary', 'none']).optional(),
  hasChildren: z.boolean().optional(),
  jobType: z.enum(['domestic_worker', 'nurse_caregiver', 'driver']).optional(),
  packageType: z.enum(['traditional', 'flexible', 'hourly']).optional(),
  hasExperience: z.boolean().optional(),
  experienceDetails: z.string().max(70).optional(),
  skillsDetails: z.string().max(70).optional(),
  cookingSkills: z.enum(['good', 'average', 'willing_to_learn', 'none']).optional(),
  babySitter: z.boolean().optional(),
  officeFees: z.string().optional(),
  availability: z.enum(['inside_uae', 'outside_uae']).optional(),
  whatsappNumber: z.string().max(20).optional(),
  contactNumber: z.string().max(20).optional(),
  cvReference: z.string().max(50).optional(),
  hiringType: z.enum(['customer_visa', 'monthly_yearly', 'hourly_daily']).optional(),
  languageIds: z.array(z.string().uuid()).optional(),
});

export type CreateMaidForOfficeInput = z.infer<typeof createMaidForOfficeSchema>;
