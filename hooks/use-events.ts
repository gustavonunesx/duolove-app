import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase/client';
import { getEvents, createEvent, updateEvent, deleteEvent, EventRow, EventInsert, EventUpdate } from '../lib/supabase/events';
import { useAuth } from './use-auth';
import { useCouple } from './use-couple';

export function useEvents() {
  const { user } = useAuth();
  const { coupleId } = useCouple();
  const queryClient = useQueryClient();

  const queryKey = ['events', coupleId];

  const { data: events = [], isLoading } = useQuery<EventRow[]>({
    queryKey,
    queryFn: () => getEvents(coupleId!),
    enabled: !!coupleId,
  });

  // Realtime sync — canal couple:{id}:events
  useEffect(() => {
    if (!coupleId) return;

    const channel = supabase
      .channel(`couple:${coupleId}:events`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          queryClient.setQueryData<EventRow[]>(queryKey, (prev = []) => {
            if (payload.eventType === 'INSERT') {
              return [...prev, payload.new as EventRow];
            }
            if (payload.eventType === 'UPDATE') {
              return prev.map((e) => e.id === (payload.new as EventRow).id ? payload.new as EventRow : e);
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter((e) => e.id !== (payload.old as { id: string }).id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [coupleId]);

  const addEvent = useMutation({
    mutationFn: (event: Omit<EventInsert, 'couple_id' | 'creator_id'>) =>
      createEvent({ ...event, couple_id: coupleId!, creator_id: user!.id }),
    onSuccess: (newEvent) => {
      queryClient.setQueryData<EventRow[]>(queryKey, (prev = []) => [...prev, newEvent]);
    },
  });

  const editEvent = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: EventUpdate }) => updateEvent(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData<EventRow[]>(queryKey, (prev = []) =>
        prev.map((e) => e.id === updated.id ? updated : e)
      );
    },
  });

  const removeEvent = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<EventRow[]>(queryKey, (prev = []) => prev.filter((e) => e.id !== id));
    },
  });

  return {
    events,
    isLoading,
    addEvent: addEvent.mutateAsync,
    editEvent: editEvent.mutateAsync,
    removeEvent: removeEvent.mutateAsync,
    isAdding: addEvent.isPending,
  };
}
