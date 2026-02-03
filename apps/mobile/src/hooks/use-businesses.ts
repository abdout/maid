import { useQuery } from '@tanstack/react-query';
import { businessesApi } from '@/lib/api';

type BusinessType = 'typing_office' | 'visa_transfer';

interface BusinessQueryParams {
  type?: BusinessType;
  search?: string;
  emirate?: string;
  page?: number;
  pageSize?: number;
}

export function useBusinesses(params?: BusinessQueryParams) {
  return useQuery({
    queryKey: ['businesses', params],
    queryFn: () => businessesApi.list(params),
  });
}

export function useBusiness(id: string) {
  return useQuery({
    queryKey: ['business', id],
    queryFn: () => businessesApi.getById(id),
    enabled: !!id,
  });
}
