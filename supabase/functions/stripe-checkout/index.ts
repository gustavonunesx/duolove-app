// Supabase Edge Function — stripe-checkout
// Cria uma Stripe Checkout Session para upgrade premium
// Deploy: supabase functions deploy stripe-checkout
// Env vars necessárias: STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY_ID, STRIPE_PRICE_YEARLY_ID, APP_URL

import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return new Response('Unauthorized', { status: 401 });

    const { interval = 'month' } = await req.json();

    // Get or create couple
    const { data: couple } = await supabase
      .from('couples')
      .select('id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .single();

    if (!couple) return new Response('Couple not found', { status: 404 });

    // Get or create Stripe customer
    let { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('couple_id', couple.id)
      .maybeSingle();

    let customerId = sub?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { couple_id: couple.id, user_id: user.id },
      });
      customerId = customer.id;

      await supabase.from('subscriptions').upsert({
        couple_id: couple.id,
        stripe_customer_id: customerId,
        plan: 'free',
        status: 'active',
      }, { onConflict: 'couple_id' });
    }

    const priceId = interval === 'year'
      ? Deno.env.get('STRIPE_PRICE_YEARLY_ID')!
      : Deno.env.get('STRIPE_PRICE_MONTHLY_ID')!;

    const appUrl = Deno.env.get('APP_URL') ?? 'duolove://';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${appUrl}premium-success`,
      cancel_url: `${appUrl}(app)/settings`,
      metadata: { couple_id: couple.id },
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
