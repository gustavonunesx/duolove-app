import { supabase } from './client';

export type AiMessageRow = {
  id: string;
  user_id: string;
  couple_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

export type AiUsageRow = {
  id: string;
  couple_id: string;
  month: string;
  message_count: number;
};

export async function getAiMessages(coupleId: string): Promise<AiMessageRow[]> {
  const { data, error } = await supabase
    .from('ai_messages')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) throw error;
  return data ?? [];
}

export async function getAiUsage(coupleId: string): Promise<AiUsageRow | null> {
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const { data, error } = await supabase
    .from('ai_usage')
    .select('*')
    .eq('couple_id', coupleId)
    .eq('month', month)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function sendAiMessage(message: string): Promise<{ reply: string; usage: AiUsageRow }> {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

  const res = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Erro ao enviar mensagem');
  }

  return res.json();
}
