import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/lib/api';

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionsApi.getPlans(),
  });
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['current-subscription'],
    queryFn: () => subscriptionsApi.getCurrent(),
  });
}

export function useCanPublish() {
  return useQuery({
    queryKey: ['can-publish'],
    queryFn: () => subscriptionsApi.canPublish(),
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planId,
      billingCycle,
    }: {
      planId: string;
      billingCycle: 'monthly' | 'yearly';
    }) => subscriptionsApi.subscribe(planId, billingCycle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['can-publish'] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionsApi.cancel(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['can-publish'] });
    },
  });
}
