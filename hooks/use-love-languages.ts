import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getLoveLanguageResults, saveLoveLanguageResult, LoveLanguageResult } from '../lib/supabase/love-languages';
import { useCouple } from './use-couple';
import { useAuth } from './use-auth';

export function useLoveLanguages() {
  const { coupleId } = useCouple();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: results = [], isLoading } = useQuery<LoveLanguageResult[]>({
    queryKey: ['love-languages', coupleId],
    queryFn: () => getLoveLanguageResults(coupleId!),
    enabled: !!coupleId,
    staleTime: 1000 * 60 * 10,
  });

  const myResult = results.find((r) => r.user_id === user?.id) ?? null;
  const partnerResult = results.find((r) => r.user_id !== user?.id) ?? null;

  const saveMutation = useMutation({
    mutationFn: (payload: {
      primary_language: string;
      secondary_language: string | null;
      scores: Record<string, number>;
    }) => saveLoveLanguageResult({ couple_id: coupleId!, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['love-languages', coupleId] });
    },
  });

  return {
    myResult,
    partnerResult,
    isLoading,
    saveResult: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
