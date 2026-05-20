import '../global.css';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
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
  const opacity = useSharedValue(0);

  const onLayoutReady = useCallback(async () => {
    await SplashScreen.hideAsync();
    opacity.value = withTiming(1, { duration: 350 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    flex: 1,
  }));

  return (
    <Animated.View style={animatedStyle} onLayout={onLayoutReady}>
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
