// Supabase Edge Function — send-notifications
// Dispara push notifications diárias via Expo Push API
// Deploy: supabase functions deploy send-notifications
// Cron: configure em Supabase Dashboard > Edge Functions > Schedules (diário às 09:00 UTC)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

async function sendPushBatch(messages: PushMessage[]): Promise<void> {
  if (messages.length === 0) return;
  await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages),
  });
}

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in1w = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const messages: PushMessage[] = [];

  // ── 1. Lembretes de evento em 24h ───────────────────────────────────────────
  const { data: events24h } = await supabase
    .from('events')
    .select('id, title, couple_id, start_at')
    .gte('start_at', now.toISOString())
    .lte('start_at', in24h.toISOString())
    .eq('visibility', 'shared');

  for (const event of events24h ?? []) {
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token, notify_events')
      .in('user_id', [
        supabase.from('couples').select('user1_id').eq('id', event.couple_id),
        supabase.from('couples').select('user2_id').eq('id', event.couple_id),
      ] as unknown as string[])
      .eq('notify_events', true);

    // Simpler approach: get couple members then their tokens
    const { data: couple } = await supabase
      .from('couples')
      .select('user1_id, user2_id')
      .eq('id', event.couple_id)
      .single();

    if (!couple) continue;
    const userIds = [couple.user1_id, couple.user2_id].filter(Boolean);

    const { data: memberTokens } = await supabase
      .from('push_tokens')
      .select('token')
      .in('user_id', userIds)
      .eq('notify_events', true);

    for (const t of memberTokens ?? []) {
      messages.push({
        to: t.token,
        title: '📅 Lembrete de evento',
        body: `"${event.title}" começa em menos de 24h!`,
        data: { type: 'event', eventId: event.id },
      });
    }
  }

  // ── 2. Cápsulas prontas para revelar ────────────────────────────────────────
  const { data: capsules } = await supabase
    .from('capsules')
    .select('id, couple_id, creator_id')
    .lte('reveal_at', now.toISOString())
    .is('revealed_at', null);

  for (const capsule of capsules ?? []) {
    const { data: couple } = await supabase
      .from('couples')
      .select('user1_id, user2_id')
      .eq('id', capsule.couple_id)
      .single();

    if (!couple) continue;
    const userIds = [couple.user1_id, couple.user2_id].filter(Boolean);

    const { data: memberTokens } = await supabase
      .from('push_tokens')
      .select('token')
      .in('user_id', userIds)
      .eq('notify_capsules', true);

    for (const t of memberTokens ?? []) {
      messages.push({
        to: t.token,
        title: '🔓 Cápsula do tempo revelada!',
        body: 'Uma mensagem especial está esperando por vocês.',
        data: { type: 'capsule', capsuleId: capsule.id },
      });
    }
  }

  // ── 3. Aniversários em 1 semana ─────────────────────────────────────────────
  const in1wDate = in1w.toISOString().slice(5, 10); // MM-DD
  const { data: anniversaryCouples } = await supabase
    .from('couples')
    .select('id, user1_id, user2_id, start_date')
    .not('start_date', 'is', null);

  for (const couple of anniversaryCouples ?? []) {
    if (!couple.start_date) continue;
    const startMMDD = couple.start_date.slice(5, 10);
    if (startMMDD !== in1wDate) continue;

    const userIds = [couple.user1_id, couple.user2_id].filter(Boolean);
    const { data: memberTokens } = await supabase
      .from('push_tokens')
      .select('token')
      .in('user_id', userIds)
      .eq('notify_events', true);

    for (const t of memberTokens ?? []) {
      messages.push({
        to: t.token,
        title: '💑 Aniversário se aproximando!',
        body: 'O aniversário do relacionamento de vocês é em 1 semana. Planeje algo especial!',
        data: { type: 'anniversary' },
      });
    }
  }

  await sendPushBatch(messages);

  return new Response(
    JSON.stringify({ sent: messages.length, timestamp: now.toISOString() }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
