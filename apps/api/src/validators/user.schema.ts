import { z } from 'zod';

// UAE Emirates enum for validation
export const emirateEnum = z.enum([
  'abu_dhabi',
  'dubai',
  'sharjah',
  'ajman',
  'umm_al_quwain',
  'ras_al_khaimah',
  'fujairah',
]);

export const updateProfileSchema = z
  .object({
    // User fields
    name: z.string().min(2).max(255).optional(),
    nameAr: z.string().max(255).optional(),
    email: z.string().email().max(255).optional().nullable(),

    // Customer fields
    emirate: emirateEnum.optional().nullable(),
    preferredLanguage: z.enum(['ar', 'en']).optional(),
    notificationsEnabled: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
