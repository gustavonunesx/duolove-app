import { useQuery } from '@tanstack/react-query';
import { getSubscription, isPremiumActive, SubscriptionRow } from '../lib/supabase/subscriptions';
import { useCouple } from './use-couple';

export function useSubscription() {
  const { coupleId } = useCouple();

  const { data: subscription, isLoading } = useQuery<SubscriptionRow | null>({
    queryKey: ['subscription', coupleId],
    queryFn: () => getSubscription(coupleId!),
    enabled: !!coupleId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    subscription: subscription ?? null,
    isPremium: isPremiumActive(subscription ?? null),
    isLoading,
  };
}
