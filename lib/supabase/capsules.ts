import { supabase } from './client';

export interface CapsuleRow {
  id: string;
  couple_id: string;
  creator_id: string;
  message: string;
  reveal_at: string;
  revealed_at: string | null;
  created_at: string;
}

export interface CapsuleInsert {
  couple_id: string;
  creator_id: string;
  message: string;
  reveal_at: string;
}

export async function getCapsules(coupleId: string): Promise<CapsuleRow[]> {
  const { data, error } = await supabase
    .from('capsules')
    .select('*')
    .eq('couple_id', coupleId)
    .order('reveal_at', { ascending: true });
  if (error) throw error;
  return data as CapsuleRow[];
}

export async function createCapsule(capsule: CapsuleInsert): Promise<CapsuleRow> {
  const { data, error } = await supabase
    .from('capsules')
    .insert(capsule)
    .select()
    .single();
  if (error) throw error;
  return data as CapsuleRow;
}

export async function revealCapsule(id: string): Promise<CapsuleRow> {
  const { data, error } = await supabase
    .from('capsules')
    .update({ revealed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as CapsuleRow;
}
