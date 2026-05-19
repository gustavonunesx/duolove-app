import { supabase } from './client';

export interface PushTokenRow {
  id: string;
  user_id: string;
  token: string;
  notify_events: boolean;
  notify_messages: boolean;
  notify_capsules: boolean;
  notify_invites: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  notify_events: boolean;
  notify_messages: boolean;
  notify_capsules: boolean;
  notify_invites: boolean;
}

export async function upsertPushToken(userId: string, token: string): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .upsert({ user_id: userId, token }, { onConflict: 'user_id,token' });
  if (error) throw error;
}

export async function getUserPushToken(userId: string): Promise<PushTokenRow | null> {
  const { data, error } = await supabase
    .from('push_tokens')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as PushTokenRow | null;
}

export async function updateNotificationPreferences(
  userId: string,
  prefs: Partial<NotificationPreferences>
): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .update(prefs)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deletePushToken(userId: string, token: string): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('token', token);
  if (error) throw error;
}

export async function getCoupleTokens(coupleId: string): Promise<PushTokenRow[]> {
  const { data, error } = await supabase
    .from('push_tokens')
    .select('*, users!inner(id)')
    .in('user_id', [
      supabase
        .from('couples')
        .select('user1_id, user2_id')
        .eq('id', coupleId)
    ] as unknown as string[]);
  if (error) throw error;
  return (data ?? []) as PushTokenRow[];
}
