import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationsApi } from '@/lib/api';

export function useMyQuotations(page = 1) {
  return useQuery({
    queryKey: ['my-quotations', page],
    queryFn: () => quotationsApi.listMy(page),
  });
}

export function useOfficeQuotations(page = 1) {
  return useQuery({
    queryKey: ['office-quotations', page],
    queryFn: () => quotationsApi.listOffice(page),
  });
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: ['quotation', id],
    queryFn: () => quotationsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ maidId, notes }: { maidId: string; notes?: string }) =>
      quotationsApi.create(maidId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-quotations'] });
    },
  });
}

export function useUpdateQuotationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      quotationsApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
      queryClient.invalidateQueries({ queryKey: ['office-quotations'] });
    },
  });
}
