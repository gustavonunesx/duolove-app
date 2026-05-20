import { supabase } from './client';

export type LoveLanguageResult = {
  id: string;
  user_id: string;
  couple_id: string;
  primary_language: string;
  secondary_language: string | null;
  scores: Record<string, number>;
  created_at: string;
};

export async function getLoveLanguageResults(coupleId: string): Promise<LoveLanguageResult[]> {
  const { data, error } = await supabase
    .from('love_language_results')
    .select('*')
    .eq('couple_id', coupleId);

  if (error) throw error;
  return data ?? [];
}

export async function saveLoveLanguageResult(payload: {
  couple_id: string;
  primary_language: string;
  secondary_language: string | null;
  scores: Record<string, number>;
}): Promise<LoveLanguageResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('love_language_results')
    .upsert(
      { user_id: user.id, ...payload },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}
