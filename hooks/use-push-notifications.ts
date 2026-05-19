import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  upsertPushToken,
  getUserPushToken,
  updateNotificationPreferences,
  PushTokenRow,
  NotificationPreferences,
} from '../lib/supabase/push-tokens';
import { useAuth } from './use-auth';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function requestPermissionAndGetToken(): Promise<string | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'DuoLove',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const prefsKey = ['push-token', user?.id];

  const { data: tokenRow } = useQuery<PushTokenRow | null>({
    queryKey: prefsKey,
    queryFn: () => getUserPushToken(user!.id),
    enabled: !!user,
  });

  // Register token on mount when user is logged in
  useEffect(() => {
    if (!user) return;

    requestPermissionAndGetToken()
      .then((token) => {
        if (token) {
          upsertPushToken(user.id, token).then(() => {
            queryClient.invalidateQueries({ queryKey: prefsKey });
          });
        }
      })
      .catch(() => {
        // Silently ignore — Expo Go on simulator may not support push tokens
      });

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // Notification received while app is foregrounded — handled by setNotificationHandler above
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      // User tapped notification — navigate if needed (handled per feature)
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [user?.id]);

  const updatePrefs = useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) =>
      updateNotificationPreferences(user!.id, prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prefsKey });
    },
  });

  return {
    preferences: tokenRow
      ? {
          notify_events: tokenRow.notify_events,
          notify_messages: tokenRow.notify_messages,
          notify_capsules: tokenRow.notify_capsules,
          notify_invites: tokenRow.notify_invites,
        }
      : null,
    hasToken: !!tokenRow?.token,
    updatePreferences: updatePrefs.mutateAsync,
    isUpdating: updatePrefs.isPending,
  };
}
