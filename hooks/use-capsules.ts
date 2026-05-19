import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCapsules,
  createCapsule,
  revealCapsule,
  CapsuleRow,
  CapsuleInsert,
} from '../lib/supabase/capsules';
import { useAuth } from './use-auth';
import { useCouple } from './use-couple';

export function useCapsules() {
  const { user } = useAuth();
  const { coupleId } = useCouple();
  const queryClient = useQueryClient();

  const queryKey = ['capsules', coupleId];

  const { data: capsules = [], isLoading } = useQuery<CapsuleRow[]>({
    queryKey,
    queryFn: () => getCapsules(coupleId!),
    enabled: !!coupleId,
  });

  const addCapsule = useMutation({
    mutationFn: (data: Omit<CapsuleInsert, 'couple_id' | 'creator_id'>) =>
      createCapsule({ ...data, couple_id: coupleId!, creator_id: user!.id }),
    onSuccess: (newCapsule) => {
      queryClient.setQueryData<CapsuleRow[]>(queryKey, (prev = []) => [...prev, newCapsule]);
    },
  });

  const reveal = useMutation({
    mutationFn: (id: string) => revealCapsule(id),
    onSuccess: (updated) => {
      queryClient.setQueryData<CapsuleRow[]>(queryKey, (prev = []) =>
        prev.map((c) => c.id === updated.id ? updated : c)
      );
    },
  });

  return {
    capsules,
    isLoading,
    addCapsule: addCapsule.mutateAsync,
    isAdding: addCapsule.isPending,
    revealCapsule: reveal.mutateAsync,
  };
}
