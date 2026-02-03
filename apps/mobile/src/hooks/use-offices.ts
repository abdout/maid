import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { officesApi } from '@/lib/api';

interface OfficeStats {
  maids: {
    total: number;
    available: number;
    busy: number;
    reserved: number;
  };
  quotations: {
    total: number;
    pending: number;
    accepted: number;
  };
}

interface OfficeProfile {
  id: string;
  name: string;
  nameAr: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  addressAr: string | null;
  logoUrl: string | null;
  isVerified: boolean;
  scopes: ('recruitment' | 'leasing' | 'typing')[];
  licenseNumber: string | null;
  licenseExpiry: string | null;
  licenseImageUrl: string | null;
  managerPhone1: string | null;
  managerPhone2: string | null;
  googleMapsUrl: string | null;
  emirate: string | null;
  website: string | null;
  createdAt: string;
}

export function useOfficeStats() {
  return useQuery({
    queryKey: ['office-stats'],
    queryFn: () => officesApi.getStats() as Promise<{ success: boolean; data: OfficeStats }>,
  });
}

export function useOfficeProfile() {
  return useQuery({
    queryKey: ['office-profile'],
    queryFn: () => officesApi.getMe() as Promise<{ success: boolean; data: OfficeProfile }>,
  });
}

export function useRegisterOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => officesApi.register(data as Parameters<typeof officesApi.register>[0]),
    onSuccess: () => {
      // Invalidate relevant queries after registration
      queryClient.invalidateQueries({ queryKey: ['office-profile'] });
      queryClient.invalidateQueries({ queryKey: ['office-stats'] });
    },
  });
}

export function useUpdateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => officesApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-profile'] });
    },
  });
}
