import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAiMessages, getAiUsage, sendAiMessage, AiMessageRow } from '../lib/supabase/ai-chat';
import { useCouple } from './use-couple';

const MONTHLY_LIMIT = 50;

export function useAiChat() {
  const { coupleId } = useCouple();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading: messagesLoading } = useQuery<AiMessageRow[]>({
    queryKey: ['ai-messages', coupleId],
    queryFn: () => getAiMessages(coupleId!),
    enabled: !!coupleId,
    staleTime: 1000 * 30,
  });

  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ['ai-usage', coupleId],
    queryFn: () => getAiUsage(coupleId!),
    enabled: !!coupleId,
    staleTime: 1000 * 60,
  });

  const messagesUsed = usage?.message_count ?? 0;
  const messagesRemaining = Math.max(0, MONTHLY_LIMIT - messagesUsed);
  const isLimitReached = messagesUsed >= MONTHLY_LIMIT;

  const sendMutation = useMutation({
    mutationFn: (message: string) => sendAiMessage(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-messages', coupleId] });
      queryClient.invalidateQueries({ queryKey: ['ai-usage', coupleId] });
    },
  });

  return {
    messages,
    isLoading: messagesLoading || usageLoading,
    messagesUsed,
    messagesRemaining,
    isLimitReached,
    send: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    sendError: sendMutation.error,
  };
}
