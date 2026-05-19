// Supabase Edge Function — stripe-webhook
// Sincroniza status da assinatura após eventos do Stripe
// Deploy: supabase functions deploy stripe-webhook
// Configure o webhook no Stripe Dashboard apontando para esta URL
// Env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${(err as Error).message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const coupleId = session.metadata?.couple_id;
    if (!coupleId || !session.subscription) return new Response('OK');

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    await supabase.from('subscriptions').upsert({
      couple_id: coupleId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      plan: 'premium',
      status: subscription.status as 'active' | 'trialing',
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    }, { onConflict: 'couple_id' });
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const coupleId = subscription.metadata?.couple_id as string | undefined;

    // Find couple by stripe_subscription_id if metadata not set
    let targetCoupleId = coupleId;
    if (!targetCoupleId) {
      const { data } = await supabase
        .from('subscriptions')
        .select('couple_id')
        .eq('stripe_subscription_id', subscription.id)
        .single();
      targetCoupleId = data?.couple_id;
    }

    if (!targetCoupleId) return new Response('OK');

    const isActive = subscription.status === 'active' || subscription.status === 'trialing';
    await supabase.from('subscriptions').update({
      plan: isActive ? 'premium' : 'free',
      status: subscription.status as 'active' | 'canceled' | 'past_due' | 'trialing',
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    }).eq('couple_id', targetCoupleId);
  }

  return new Response('OK');
});
