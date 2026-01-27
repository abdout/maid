import { useQuery } from '@tanstack/react-query';
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

export function useOfficeStats() {
  return useQuery({
    queryKey: ['office-stats'],
    queryFn: () => officesApi.getStats() as Promise<{ success: boolean; data: OfficeStats }>,
  });
}

export function useOfficeProfile() {
  return useQuery({
    queryKey: ['office-profile'],
    queryFn: () => officesApi.getMe(),
  });
}
