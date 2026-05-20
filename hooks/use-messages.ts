import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase/client';
import {
  getMessages,
  sendMessage,
  getReactions,
  addReaction,
  removeReaction,
  MessageRow,
  ReactionRow,
} from '../lib/supabase/messages';
import { useAuth } from './use-auth';
import { useCouple } from './use-couple';

export function useMessages(eventId?: string | null) {
  const { user } = useAuth();
  const { coupleId } = useCouple();
  const queryClient = useQueryClient();

  const messagesKey = ['messages', coupleId, eventId ?? null];
  const reactionsKey = ['reactions', coupleId, eventId ?? null];

  const { data: messages = [], isLoading } = useQuery<MessageRow[]>({
    queryKey: messagesKey,
    queryFn: () => getMessages(coupleId!, eventId),
    enabled: !!coupleId,
  });

  const { data: reactions = [] } = useQuery<ReactionRow[]>({
    queryKey: reactionsKey,
    queryFn: () => getReactions(messages.map((m) => m.id)),
    enabled: messages.length > 0,
  });

  // Realtime — canal couple:{id}:messages
  useEffect(() => {
    if (!coupleId) return;

    const channelName = `couple:${coupleId}:messages`;
    const existing = supabase.getChannels().find((c) => c.topic === `realtime:${channelName}`);
    if (existing) supabase.removeChannel(existing);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          const newMsg = payload.new as MessageRow;
          const matchesContext = eventId ? newMsg.event_id === eventId : newMsg.event_id === null;
          if (!matchesContext) return;

          queryClient.setQueryData<MessageRow[]>(messagesKey, (prev = []) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_reactions' },
        () => {
          queryClient.invalidateQueries({ queryKey: reactionsKey });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [coupleId, eventId]);

  const send = useMutation({
    mutationFn: (content: string) => {
      if (!coupleId || !user) throw new Error('Sem casal vinculado');
      return sendMessage({
        couple_id: coupleId,
        sender_id: user.id,
        event_id: eventId ?? null,
        content,
      });
    },
    onSuccess: (newMsg) => {
      queryClient.setQueryData<MessageRow[]>(messagesKey, (prev = []) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    },
  });

  const toggleReaction = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const existing = reactions.find(
        (r) => r.message_id === messageId && r.user_id === user!.id && r.emoji === emoji
      );
      if (existing) {
        await removeReaction(messageId, user!.id, emoji);
      } else {
        await addReaction(messageId, user!.id, emoji);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reactionsKey });
    },
  });

  function getMessageReactions(messageId: string) {
    return reactions.filter((r) => r.message_id === messageId);
  }

  return {
    messages,
    reactions,
    isLoading,
    getMessageReactions,
    sendMessage: send.mutateAsync,
    isSending: send.isPending,
    toggleReaction: toggleReaction.mutateAsync,
  };
}
