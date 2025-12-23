import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api';

export function useCvUnlockPrice(maidId: string) {
  return useQuery({
    queryKey: ['cv-unlock-price', maidId],
    queryFn: () => paymentsApi.getCvUnlockPrice(maidId),
    enabled: !!maidId,
  });
}

export function useIsUnlocked(maidId: string) {
  return useQuery({
    queryKey: ['cv-unlock-check', maidId],
    queryFn: () => paymentsApi.checkUnlock(maidId),
    enabled: !!maidId,
  });
}

export function useCreatePaymentIntent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (maidId: string) => paymentsApi.createPaymentIntent(maidId),
    onSuccess: (_, maidId) => {
      queryClient.invalidateQueries({ queryKey: ['cv-unlock-check', maidId] });
    },
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      stripePaymentIntentId,
    }: {
      paymentId: string;
      stripePaymentIntentId?: string;
    }) => paymentsApi.confirmPayment(paymentId, stripePaymentIntentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv-unlock-check'] });
      queryClient.invalidateQueries({ queryKey: ['unlocked-cvs'] });
      queryClient.invalidateQueries({ queryKey: ['maid'] });
    },
  });
}

export function useUnlockedCvs() {
  return useQuery({
    queryKey: ['unlocked-cvs'],
    queryFn: () => paymentsApi.getUnlockedCvs(),
  });
}

export function usePaymentHistory(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['payment-history', page, pageSize],
    queryFn: () => paymentsApi.getPaymentHistory(page, pageSize),
  });
}

// Tabby hooks
export function useCreateTabbyCheckout() {
  return useMutation({
    mutationFn: (maidId: string) => paymentsApi.createTabbyCheckout(maidId),
  });
}

export function useConfirmTabbyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      tabbyPaymentId,
    }: {
      paymentId: string;
      tabbyPaymentId: string;
    }) => paymentsApi.confirmTabbyPayment(paymentId, tabbyPaymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv-unlock-check'] });
      queryClient.invalidateQueries({ queryKey: ['unlocked-cvs'] });
      queryClient.invalidateQueries({ queryKey: ['maid'] });
    },
  });
}
