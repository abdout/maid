import { z } from 'zod';

// Enums
export const serviceTypeEnum = z.enum(['individual', 'business', 'cleaning', 'cooking', 'babysitter', 'elderly', 'driver']);
export const packageTypeEnum = z.enum(['traditional', 'flexible', 'hourly']);
export const cookingSkillsEnum = z.enum(['good', 'average', 'willing_to_learn', 'none']);
export const availabilityTypeEnum = z.enum(['inside_uae', 'outside_uae']);
export const sexEnum = z.enum(['male', 'female']);
export const educationLevelEnum = z.enum(['college', 'high_school', 'primary', 'none']);
export const jobTypeEnum = z.enum(['domestic_worker', 'nurse_caregiver', 'driver']);
export const ageRangePresetEnum = z.enum(['20-30', '31-40', '40+']);

export const createMaidSchema = z.object({
  // Basic info
  name: z.string().min(2).max(255),
  nameAr: z.string().max(255).optional(),
  nationalityId: z.string().uuid(),
  dateOfBirth: z.coerce.date(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  religion: z.enum(['muslim', 'non_muslim']),
  sex: sexEnum.default('female'),
  educationLevel: educationLevelEnum.optional(),
  hasChildren: z.boolean().default(false),

  // Job and package
  jobType: jobTypeEnum.default('domestic_worker'),
  packageType: packageTypeEnum.default('traditional'),
  serviceType: serviceTypeEnum.default('individual'),

  // Experience and skills
  hasExperience: z.boolean().default(false),
  experienceYears: z.number().int().min(0).max(50).default(0),
  experienceDetails: z.string().max(70).optional(),
  skillsDetails: z.string().max(70).optional(),
  cookingSkills: cookingSkillsEnum.optional(),
  babySitter: z.boolean().default(false),

  // Pricing and availability
  salary: z.number().positive(),
  officeFees: z.number().nonnegative().optional(),
  availability: availabilityTypeEnum.default('inside_uae'),

  // Contact info
  whatsappNumber: z.string().max(20).optional(),
  contactNumber: z.string().max(20).optional(),
  cvReference: z.string().max(50).optional(),

  // Media and bio
  photoUrl: z.string().url().optional(),
  bio: z.string().max(1000).optional(),
  bioAr: z.string().max(1000).optional(),
  languageIds: z.array(z.string().uuid()).optional(),
  status: z.enum(['available', 'inactive']).optional(),
});

export const updateMaidSchema = createMaidSchema.partial();

export const maidFiltersSchema = z.object({
  search: z.string().min(2).max(100).optional(),
  // Support both single nationalityId (legacy) and array (new)
  nationalityId: z.string().uuid().optional(),
  nationalityIds: z.array(z.string().uuid()).max(3).optional(),
  // Age filters
  ageMin: z.coerce.number().int().min(18).max(65).optional(),
  ageMax: z.coerce.number().int().min(18).max(65).optional(),
  ageRange: ageRangePresetEnum.optional(),
  // Other filters
  maritalStatus: z.enum(['married', 'not_married']).optional(),
  religion: z.enum(['muslim', 'non_muslim']).optional(),
  experienceYears: z.coerce.number().int().min(0).optional(),
  salaryMin: z.coerce.number().nonnegative().optional(),
  salaryMax: z.coerce.number().positive().optional(),
  status: z.enum(['available', 'busy', 'reserved', 'inactive']).optional(),
  serviceType: serviceTypeEnum.optional(),
  jobType: jobTypeEnum.optional(),
  packageType: packageTypeEnum.optional(),
  availability: availabilityTypeEnum.optional(),
  cookingSkills: cookingSkillsEnum.optional(),
  babySitter: z.boolean().optional(),
  sex: sexEnum.optional(),
  // Pagination
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateMaidInput = z.infer<typeof createMaidSchema>;
export type UpdateMaidInput = z.infer<typeof updateMaidSchema>;
export type MaidFiltersInput = z.infer<typeof maidFiltersSchema>;
