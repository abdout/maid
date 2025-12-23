import { useQuery } from '@tanstack/react-query';
import { lookupsApi } from '@/lib/api';

export function useNationalities() {
  return useQuery({
    queryKey: ['nationalities'],
    queryFn: () => lookupsApi.getNationalities(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useLanguages() {
  return useQuery({
    queryKey: ['languages'],
    queryFn: () => lookupsApi.getLanguages(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
