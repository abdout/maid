import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { maidsApi, favoritesApi } from '@/lib/api';
import type { MaidFilters } from '@maid/shared';

// Global optimistic state for instant UI updates
// This is a simple store that lives outside React for maximum speed
const optimisticToggles = new Map<string, boolean>(); // maidId -> pending state
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return optimisticToggles;
}

function setOptimisticToggle(maidId: string, isFavorite: boolean) {
  optimisticToggles.set(maidId, isFavorite);
  notifyListeners();
}

function clearOptimisticToggle(maidId: string) {
  optimisticToggles.delete(maidId);
  notifyListeners();
}

interface MaidQueryParams extends Partial<MaidFilters> {
  page?: number;
  pageSize?: number;
  search?: string;
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
      queryClient.invalidateQueries({ queryKey: ['maids'] });
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

/**
 * Hook that provides instant optimistic favorite state.
 * Combines server data with local optimistic toggles for instant UI updates.
 */
export function useOptimisticFavorites() {
  const { data: favoritesData } = useFavorites();

  // Subscribe to optimistic toggle changes for instant re-renders
  const togglesRef = useRef(optimisticToggles);
  useSyncExternalStore(
    subscribe,
    () => {
      // Return a new reference only if the map has changed
      if (togglesRef.current !== optimisticToggles) {
        togglesRef.current = optimisticToggles;
      }
      return togglesRef.current.size;
    },
    () => 0
  );

  // Memoize the server favorites set
  const serverFavoriteIds = useMemo(() => {
    return new Set(favoritesData?.data?.map((f) => f.maidId) || []);
  }, [favoritesData?.data]);

  // Function to check if a maid is favorited, considering optimistic state
  const isFavorite = useCallback((maidId: string): boolean => {
    // Check if there's a pending optimistic toggle for this maid
    if (optimisticToggles.has(maidId)) {
      return optimisticToggles.get(maidId)!;
    }
    // Otherwise use server state
    return serverFavoriteIds.has(maidId);
  }, [serverFavoriteIds]);

  return { isFavorite, serverFavoriteIds };
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
    // Optimistic update - immediately update UI BEFORE API call starts
    onMutate: async ({ maidId, isFavorite }) => {
      // Set optimistic state instantly - this happens synchronously
      setOptimisticToggle(maidId, !isFavorite);

      // Cancel any outgoing refetches to avoid overwriting
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      // Snapshot current value for rollback
      const previousFavorites = queryClient.getQueryData(['favorites']);

      return { previousFavorites, maidId };
    },
    // Rollback on error
    onError: (_err, { maidId, isFavorite }, context) => {
      // Revert optimistic state to original
      setOptimisticToggle(maidId, isFavorite);

      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites);
      }
    },
    // Sync with server after mutation settles
    onSettled: (_, __, { maidId }) => {
      // Clear optimistic toggle since server is now source of truth
      clearOptimisticToggle(maidId);

      // Invalidate to get fresh data from server
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorite', maidId] });
    },
  });
}
