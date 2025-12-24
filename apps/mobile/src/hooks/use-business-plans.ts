import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessPlansApi } from '@/lib/api';

export function useBusinessPlans() {
  return useQuery({
    queryKey: ['business-plans'],
    queryFn: () => businessPlansApi.getPlans(),
  });
}

export function useCustomerSubscription() {
  return useQuery({
    queryKey: ['customer-subscription'],
    queryFn: () => businessPlansApi.getSubscription(),
  });
}

export function useUnlockPrice(maidId: string) {
  return useQuery({
    queryKey: ['unlock-price', maidId],
    queryFn: () => businessPlansApi.getUnlockPrice(maidId),
    enabled: !!maidId,
  });
}

export function useSubscribeToBusinessPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planId,
      billingCycle,
    }: {
      planId: string;
      billingCycle: 'monthly' | 'yearly';
    }) => businessPlansApi.subscribe(planId, billingCycle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['business-plans'] });
    },
  });
}

export function useCancelBusinessSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => businessPlansApi.cancel(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-subscription'] });
    },
  });
}

export function useUseFreeUnlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => businessPlansApi.useFreeUnlock(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['unlock-price'] });
    },
  });
}
