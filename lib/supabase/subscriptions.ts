import { supabase } from './client';

export interface SubscriptionRow {
  id: string;
  couple_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'free' | 'premium';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_end: string | null;
  created_at: string;
}

export async function getSubscription(coupleId: string): Promise<SubscriptionRow | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('couple_id', coupleId)
    .maybeSingle();
  if (error) throw error;
  return data as SubscriptionRow | null;
}

export function isPremiumActive(sub: SubscriptionRow | null): boolean {
  if (!sub) return false;
  return sub.plan === 'premium' && (sub.status === 'active' || sub.status === 'trialing');
}
