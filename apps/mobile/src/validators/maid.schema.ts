import { z } from 'zod';

// Step 1: Basic Info Schema
export const basicInfoSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name must be in English only'),
  nameAr: z.string().optional(),
  nationalityId: z.string().uuid('Please select a nationality'),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 65;
    }, 'Age must be between 18 and 65 years'),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed'], {
    required_error: 'Please select marital status',
  }),
  religion: z.enum(['muslim', 'non_muslim'], {
    required_error: 'Please select religion',
  }),
});

// Step 2: Experience & Salary Schema
export const experienceSchema = z.object({
  experienceYears: z
    .number()
    .min(0, 'Experience cannot be negative')
    .max(30, 'Experience cannot exceed 30 years'),
  salary: z
    .string()
    .min(1, 'Salary is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 500 && num <= 10000;
    }, 'Salary must be between 500 and 10,000 AED'),
  skills: z.array(z.string()).optional(),
});

// Step 3: Languages Schema
export const languagesSchema = z.object({
  languageIds: z
    .array(z.string().uuid())
    .min(1, 'Please select at least one language'),
});

// Step 4: Documents & Photos Schema
export const documentsSchema = z.object({
  photoUrl: z.string().url('Please upload a profile photo'),
  additionalPhotos: z.array(z.string().url()).optional(),
  passportUrl: z.string().url().optional().or(z.literal('')),
});

// Step 5: Review & Publish Schema
export const publishSchema = z.object({
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  bioAr: z.string().max(500, 'Arabic bio must be less than 500 characters').optional(),
  status: z.enum(['available', 'inactive']).default('available'),
});

// Complete maid schema for final submission
export const completeMaidSchema = basicInfoSchema
  .merge(experienceSchema)
  .merge(languagesSchema)
  .merge(documentsSchema)
  .merge(publishSchema);

// Type exports
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type ExperienceFormData = z.infer<typeof experienceSchema>;
export type LanguagesFormData = z.infer<typeof languagesSchema>;
export type DocumentsFormData = z.infer<typeof documentsSchema>;
export type PublishFormData = z.infer<typeof publishSchema>;
export type CompleteMaidFormData = z.infer<typeof completeMaidSchema>;

// Validation helper functions
export function validateBasicInfo(data: unknown) {
  return basicInfoSchema.safeParse(data);
}

export function validateExperience(data: unknown) {
  return experienceSchema.safeParse(data);
}

export function validateLanguages(data: unknown) {
  return languagesSchema.safeParse(data);
}

export function validateDocuments(data: unknown) {
  return documentsSchema.safeParse(data);
}

export function validatePublish(data: unknown) {
  return publishSchema.safeParse(data);
}

export function validateCompleteMaid(data: unknown) {
  return completeMaidSchema.safeParse(data);
}

// Error message helpers
export function getFieldError(
  errors: z.ZodError | null,
  field: string
): string | undefined {
  if (!errors) return undefined;
  const fieldError = errors.errors.find((e) => e.path.includes(field));
  return fieldError?.message;
}

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  error.errors.forEach((err) => {
    const key = err.path.join('.');
    formatted[key] = err.message;
  });
  return formatted;
}
