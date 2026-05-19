import { supabase } from './client';

export interface EventRow {
  id: string;
  couple_id: string;
  creator_id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  type: 'personal' | 'couple' | 'anniversary' | 'travel';
  color: string;
  visibility: 'private' | 'shared';
  created_at: string;
}

export interface EventInsert {
  couple_id: string;
  creator_id: string;
  title: string;
  description?: string | null;
  start_at: string;
  end_at: string;
  type?: 'personal' | 'couple' | 'anniversary' | 'travel';
  color?: string;
  visibility?: 'private' | 'shared';
}

export interface EventUpdate {
  title?: string;
  description?: string | null;
  start_at?: string;
  end_at?: string;
  type?: 'personal' | 'couple' | 'anniversary' | 'travel';
  color?: string;
  visibility?: 'private' | 'shared';
}

export async function getEvents(coupleId: string): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('couple_id', coupleId)
    .order('start_at', { ascending: true });
  if (error) throw error;
  return data as EventRow[];
}

export async function createEvent(event: EventInsert): Promise<EventRow> {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single();
  if (error) throw error;
  return data as EventRow;
}

export async function updateEvent(id: string, updates: EventUpdate): Promise<EventRow> {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as EventRow;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
