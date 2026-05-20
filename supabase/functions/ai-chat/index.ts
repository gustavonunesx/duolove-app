// Supabase Edge Function — ai-chat
// Chat com o Duo (IA conselheira do casal) via OpenAI GPT-4o-mini
// Deploy: supabase functions deploy ai-chat
// Env vars: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MONTHLY_LIMIT = 50;
const MAX_CONTEXT_MESSAGES = 15;
const MAX_TOKENS = 400;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) return jsonResponse({ error: 'Unauthorized' }, 401);

    // Fetch couple
    const { data: couple } = await supabase
      .from('couples')
      .select('id, start_date, user1_id, user2_id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .single();

    if (!couple) return jsonResponse({ error: 'Casal não encontrado' }, 404);

    // Premium check via subscriptions table
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('couple_id', couple.id)
      .single();

    const isPremium = subscription?.plan === 'premium' && subscription?.status === 'active';
    if (!isPremium) {
      return jsonResponse({ error: 'Premium required' }, 403);
    }

    // Rate limit
    const month = new Date().toISOString().slice(0, 7);
    const { data: usageRow } = await supabase
      .from('ai_usage')
      .select('message_count')
      .eq('couple_id', couple.id)
      .eq('month', month)
      .single();

    const currentCount = usageRow?.message_count ?? 0;
    if (currentCount >= MONTHLY_LIMIT) {
      return jsonResponse({ error: 'Rate limit reached', limit: MONTHLY_LIMIT }, 429);
    }

    // Parse request body
    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return jsonResponse({ error: 'message is required' }, 400);
    }

    // Load context: couple events + last 15 messages
    const [{ data: events }, { data: history }] = await Promise.all([
      supabase
        .from('events')
        .select('title, start_at, type')
        .eq('couple_id', couple.id)
        .gte('start_at', new Date().toISOString())
        .order('start_at', { ascending: true })
        .limit(3),
      supabase
        .from('ai_messages')
        .select('role, content')
        .eq('couple_id', couple.id)
        .order('created_at', { ascending: false })
        .limit(MAX_CONTEXT_MESSAGES),
    ]);

    const startDateStr = couple.start_date
      ? new Date(couple.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
      : null;

    const upcomingEvents = (events ?? [])
      .map((e: { title: string; start_at: string }) =>
        `- ${e.title} em ${new Date(e.start_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}`
      )
      .join('\n') || 'Nenhum evento próximo';

    const systemPrompt = `Você é o Duo, o assistente amoroso do casal no app DuoLove. Você é empático, carinhoso e prático — como um amigo próximo que entende de relacionamentos.

Contexto do casal:
- Juntos desde: ${startDateStr ?? 'não informado'}
- Próximos eventos: ${upcomingEvents}

Diretrizes:
- Responda sempre em português do Brasil, de forma calorosa e próxima
- Seja conciso (máximo 3 parágrafos curtos)
- Ofereça sugestões práticas quando relevante
- Não dê conselhos médicos ou jurídicos
- Se o casal tiver conflitos, seja neutro e empático com ambos os lados`;

    // Build messages for OpenAI
    const contextMessages = (history ?? []).reverse().map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    contextMessages.push({ role: 'user', content: message });

    // Call OpenAI GPT-4o-mini
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: MAX_TOKENS,
        messages: [
          { role: 'system', content: systemPrompt },
          ...contextMessages,
        ],
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json().catch(() => ({}));
      console.error('OpenAI error:', err);
      return jsonResponse({ error: 'Erro ao chamar a IA' }, 502);
    }

    const openaiData = await openaiRes.json();
    const reply: string = openaiData.choices?.[0]?.message?.content ?? '';

    // Persist messages
    await supabase.from('ai_messages').insert([
      { user_id: user.id, couple_id: couple.id, role: 'user', content: message },
      { user_id: user.id, couple_id: couple.id, role: 'assistant', content: reply },
    ]);

    // Update usage counter (upsert)
    await supabase.from('ai_usage').upsert(
      { couple_id: couple.id, month, message_count: currentCount + 1 },
      { onConflict: 'couple_id,month' }
    );

    const { data: updatedUsage } = await supabase
      .from('ai_usage')
      .select('*')
      .eq('couple_id', couple.id)
      .eq('month', month)
      .single();

    return jsonResponse({ reply, usage: updatedUsage });
  } catch (err) {
    console.error('ai-chat error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
