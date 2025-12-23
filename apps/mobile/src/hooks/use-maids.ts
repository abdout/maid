import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maidsApi, favoritesApi } from '@/lib/api';
import type { MaidFilters } from '@maid/shared';

interface MaidQueryParams extends Partial<MaidFilters> {
  page?: number;
  pageSize?: number;
}

export function useMaids(params?: MaidQueryParams) {
  return useQuery({
    queryKey: ['maids', params],
    queryFn: () => maidsApi.list(params as Record<string, string | number>),
  });
}

export function useMaid(id: string) {
  return useQuery({
    queryKey: ['maid', id],
    queryFn: () => maidsApi.getById(id),
    enabled: !!id,
  });
}

export function useOfficeMaids(params?: MaidQueryParams) {
  return useQuery({
    queryKey: ['office-maids', params],
    queryFn: () => maidsApi.officeList(params as Record<string, string | number>),
  });
}

export function useCreateMaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => maidsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-maids'] });
    },
  });
}

export function useUpdateMaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      maidsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['maid', id] });
      queryClient.invalidateQueries({ queryKey: ['office-maids'] });
    },
  });
}

export function useDeleteMaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => maidsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-maids'] });
    },
  });
}

export function useUpdateMaidStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      maidsApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['maid', id] });
      queryClient.invalidateQueries({ queryKey: ['office-maids'] });
      queryClient.invalidateQueries({ queryKey: ['maids'] });
    },
  });
}

// Favorites
export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.list(),
  });
}

export function useIsFavorite(maidId: string) {
  return useQuery({
    queryKey: ['favorite', maidId],
    queryFn: () => favoritesApi.check(maidId),
    enabled: !!maidId,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ maidId, isFavorite }: { maidId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        return favoritesApi.remove(maidId);
      }
      return favoritesApi.add(maidId);
    },
    onSuccess: (_, { maidId }) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorite', maidId] });
    },
  });
}
