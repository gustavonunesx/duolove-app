import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { getUserCouple, createCouple, generateInvite, CoupleRow } from '../lib/supabase/couples';

export function useCouple() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: couple, isLoading } = useQuery<CoupleRow | null>({
    queryKey: ['couple', user?.id],
    queryFn: () => getUserCouple(user!.id),
    enabled: !!user,
  });

  const ensureCouple = useMutation({
    mutationFn: async (): Promise<CoupleRow> => {
      if (couple) return couple;
      return createCouple(user!.id);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['couple', user?.id], data);
    },
  });

  const generateInviteMutation = useMutation({
    mutationFn: async () => {
      let c = couple;
      if (!c) c = await ensureCouple.mutateAsync();
      return generateInvite(c.id, user!.id);
    },
  });

  return {
    couple: couple ?? null,
    coupleId: couple?.id ?? null,
    isLoading,
    ensureCouple: ensureCouple.mutateAsync,
    generateInvite: generateInviteMutation.mutateAsync,
    isGeneratingInvite: generateInviteMutation.isPending,
  };
}
