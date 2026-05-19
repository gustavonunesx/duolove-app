import { supabase } from './client';

export interface MessageRow {
  id: string;
  couple_id: string;
  sender_id: string;
  event_id: string | null;
  content: string;
  created_at: string;
}

export interface MessageInsert {
  couple_id: string;
  sender_id: string;
  event_id?: string | null;
  content: string;
}

export interface ReactionRow {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export async function getMessages(coupleId: string, eventId?: string | null): Promise<MessageRow[]> {
  let query = supabase
    .from('messages')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: true });

  if (eventId) {
    query = query.eq('event_id', eventId);
  } else {
    query = query.is('event_id', null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as MessageRow[];
}

export async function sendMessage(message: MessageInsert): Promise<MessageRow> {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();
  if (error) throw error;
  return data as MessageRow;
}

export async function getReactions(messageIds: string[]): Promise<ReactionRow[]> {
  if (messageIds.length === 0) return [];
  const { data, error } = await supabase
    .from('message_reactions')
    .select('*')
    .in('message_id', messageIds);
  if (error) throw error;
  return data as ReactionRow[];
}

export async function addReaction(messageId: string, userId: string, emoji: string): Promise<void> {
  const { error } = await supabase
    .from('message_reactions')
    .insert({ message_id: messageId, user_id: userId, emoji });
  if (error) throw error;
}

export async function removeReaction(messageId: string, userId: string, emoji: string): Promise<void> {
  const { error } = await supabase
    .from('message_reactions')
    .delete()
    .eq('message_id', messageId)
    .eq('user_id', userId)
    .eq('emoji', emoji);
  if (error) throw error;
}
