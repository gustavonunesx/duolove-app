import { File } from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from './client';

export interface MemoryRow {
  id: string;
  couple_id: string;
  creator_id: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  date: string;
  tags: string[];
  created_at: string;
}

export interface MemoryInsert {
  couple_id: string;
  creator_id: string;
  title: string;
  description?: string | null;
  photo_url?: string | null;
  date: string;
  tags?: string[];
}

export interface MemoryUpdate {
  title?: string;
  description?: string | null;
  photo_url?: string | null;
  date?: string;
  tags?: string[];
}

export async function getMemories(coupleId: string): Promise<MemoryRow[]> {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('couple_id', coupleId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data as MemoryRow[];
}

export async function createMemory(memory: MemoryInsert): Promise<MemoryRow> {
  const { data, error } = await supabase
    .from('memories')
    .insert(memory)
    .select()
    .single();
  if (error) throw error;
  return data as MemoryRow;
}

export async function deleteMemory(id: string, photoUrl: string | null): Promise<void> {
  if (photoUrl) {
    const path = photoUrl.split('/memories/')[1];
    if (path) {
      await supabase.storage.from('memories').remove([path]);
    }
  }
  const { error } = await supabase.from('memories').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadMemoryPhoto(
  coupleId: string,
  userId: string,
  uri: string
): Promise<string> {
  // Normaliza extensão (remove query/fragment de URIs do picker)
  const rawExt = uri.split('.').pop()?.split(/[?#]/)[0]?.toLowerCase() ?? 'jpg';
  const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
  const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const fileName = `${coupleId}/${userId}/${Date.now()}.${ext}`;

  // No React Native, fetch(uri).blob() é instável e causa "Network request failed".
  // Padrão confiável: ler como base64 (expo-file-system) e enviar um ArrayBuffer.
  const base64 = await new File(uri).base64();
  const arrayBuffer = decode(base64);

  const { error } = await supabase.storage
    .from('memories')
    .upload(fileName, arrayBuffer, { contentType });
  if (error) throw error;

  const { data } = supabase.storage.from('memories').getPublicUrl(fileName);
  return data.publicUrl;
}
