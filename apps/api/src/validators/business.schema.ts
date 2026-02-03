import { z } from 'zod';

// Business type enum
export const businessTypeEnum = z.enum(['typing_office', 'visa_transfer']);

// Filters for listing businesses
export const businessFiltersSchema = z.object({
  type: businessTypeEnum.optional(),
  search: z.string().min(2).max(100).optional(),
  emirate: z.string().max(50).optional(),
  isVerified: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

// Create business schema (for admin)
export const createBusinessSchema = z.object({
  type: businessTypeEnum,
  name: z.string().min(2).max(255),
  nameAr: z.string().max(255).optional(),
  phone: z.string().min(5).max(20),
  whatsapp: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
  address: z.string().max(500).optional(),
  addressAr: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  coverPhotoUrl: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  descriptionAr: z.string().max(1000).optional(),
  emirate: z.string().max(50).optional(),
  googleMapsUrl: z.string().url().optional(),
  services: z.string().optional(), // JSON string of services
  servicesAr: z.string().optional(),
  priceRange: z.string().max(50).optional(),
  workingHours: z.string().max(100).optional(),
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateBusinessSchema = createBusinessSchema.partial();

export type BusinessFiltersInput = z.infer<typeof businessFiltersSchema>;
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
