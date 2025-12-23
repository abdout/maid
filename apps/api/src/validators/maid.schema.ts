import { z } from 'zod';

export const createMaidSchema = z.object({
  name: z.string().min(2).max(255),
  nameAr: z.string().max(255).optional(),
  nationalityId: z.string().uuid(),
  dateOfBirth: z.coerce.date(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  religion: z.enum(['muslim', 'non_muslim']),
  experienceYears: z.number().int().min(0).max(50).default(0),
  salary: z.number().positive(),
  photoUrl: z.string().url().optional(),
  bio: z.string().max(1000).optional(),
  bioAr: z.string().max(1000).optional(),
  languageIds: z.array(z.string().uuid()).optional(),
});

export const updateMaidSchema = createMaidSchema.partial();

export const maidFiltersSchema = z.object({
  nationalityId: z.string().uuid().optional(),
  ageMin: z.coerce.number().int().min(18).max(65).optional(),
  ageMax: z.coerce.number().int().min(18).max(65).optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  religion: z.enum(['muslim', 'non_muslim']).optional(),
  experienceYears: z.coerce.number().int().min(0).optional(),
  salaryMin: z.coerce.number().positive().optional(),
  salaryMax: z.coerce.number().positive().optional(),
  status: z.enum(['available', 'busy', 'reserved', 'inactive']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateMaidInput = z.infer<typeof createMaidSchema>;
export type UpdateMaidInput = z.infer<typeof updateMaidSchema>;
export type MaidFiltersInput = z.infer<typeof maidFiltersSchema>;
