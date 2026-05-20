import '../global.css';
import { useCallback, useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthListener, useAuth } from '../hooks/use-auth';
import { usePushNotifications } from '../hooks/use-push-notifications';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function PushNotificationRegistrar() {
  usePushNotifications();
  return null;
}

function RouteGuard() {
  useAuthListener();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)/dashboard');
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

function AppContent() {
  const opacity = useRef(new Animated.Value(0)).current;

  const onLayoutReady = useCallback(async () => {
    await SplashScreen.hideAsync();
    Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{ flex: 1, opacity }} onLayout={onLayoutReady}>
      <StatusBar style="light" />
      <RouteGuard />
      <PushNotificationRegistrar />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D0D0D' } }} />
    </Animated.View>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1, backgroundColor: '#0D0D0D' }}>
        <AppContent />
      </View>
    </QueryClientProvider>
  );
}
