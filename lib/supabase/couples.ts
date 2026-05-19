import { supabase } from './client';
import { randomUUID } from 'expo-crypto';

export interface CoupleRow {
  id: string;
  user1_id: string;
  user2_id: string | null;
  start_date: string | null;
  theme: 'rose' | 'lilac' | 'wine';
  plan: 'free' | 'premium';
  created_at: string;
}

export interface InviteRow {
  id: string;
  couple_id: string;
  inviter_id: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export async function getUserCouple(userId: string): Promise<CoupleRow | null> {
  const { data, error } = await supabase
    .from('couples')
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .maybeSingle();

  if (error) throw error;
  return data as CoupleRow | null;
}

export async function createCouple(userId: string): Promise<CoupleRow> {
  const { data, error } = await supabase
    .from('couples')
    .insert({ user1_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as CoupleRow;
}

export async function generateInvite(coupleId: string, inviterId: string): Promise<InviteRow> {
  const token = randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('couple_invites')
    .insert({ couple_id: coupleId, inviter_id: inviterId, token, expires_at: expiresAt })
    .select()
    .single();
  if (error) throw error;
  return data as InviteRow;
}

export async function validateInvite(token: string) {
  const { data, error } = await supabase
    .from('couple_invites')
    .select('*, users!couple_invites_inviter_id_fkey(name, avatar_url)')
    .eq('token', token.toUpperCase())
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error || !data) return null;
  return data as InviteRow & { users: { name: string; avatar_url: string | null } | null };
}

export async function acceptInvite(token: string, userId: string): Promise<void> {
  const invite = await validateInvite(token);
  if (!invite) throw new Error('Convite inválido ou expirado.');

  const { error: coupleError } = await supabase
    .from('couples')
    .update({ user2_id: userId })
    .eq('id', invite.couple_id);
  if (coupleError) throw coupleError;

  const { error: inviteError } = await supabase
    .from('couple_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('token', token.toUpperCase());
  if (inviteError) throw inviteError;
}
