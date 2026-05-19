import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMemories,
  createMemory,
  deleteMemory,
  uploadMemoryPhoto,
  MemoryRow,
  MemoryInsert,
} from '../lib/supabase/memories';
import { useAuth } from './use-auth';
import { useCouple } from './use-couple';

export function useMemories() {
  const { user } = useAuth();
  const { coupleId } = useCouple();
  const queryClient = useQueryClient();

  const queryKey = ['memories', coupleId];

  const { data: memories = [], isLoading } = useQuery<MemoryRow[]>({
    queryKey,
    queryFn: () => getMemories(coupleId!),
    enabled: !!coupleId,
  });

  const addMemory = useMutation({
    mutationFn: async ({
      photoUri,
      ...data
    }: Omit<MemoryInsert, 'couple_id' | 'creator_id' | 'photo_url'> & { photoUri?: string }) => {
      let photo_url: string | null = null;
      if (photoUri) {
        photo_url = await uploadMemoryPhoto(coupleId!, user!.id, photoUri);
      }
      return createMemory({
        ...data,
        couple_id: coupleId!,
        creator_id: user!.id,
        photo_url,
      });
    },
    onSuccess: (newMemory) => {
      queryClient.setQueryData<MemoryRow[]>(queryKey, (prev = []) => [newMemory, ...prev]);
    },
  });

  const removeMemory = useMutation({
    mutationFn: ({ id, photoUrl }: { id: string; photoUrl: string | null }) =>
      deleteMemory(id, photoUrl),
    onSuccess: (_, { id }) => {
      queryClient.setQueryData<MemoryRow[]>(queryKey, (prev = []) => prev.filter((m) => m.id !== id));
    },
  });

  return {
    memories,
    isLoading,
    addMemory: addMemory.mutateAsync,
    isAdding: addMemory.isPending,
    removeMemory: removeMemory.mutateAsync,
  };
}
