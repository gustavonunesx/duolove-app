import { Stack } from 'expo-router';
import { AppMenu } from '../../components/shared/app-menu';

export default function AppLayout() {
  return (
    <>
      <AppMenu />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0D0D0D' },
          animation: 'fade',
          animationDuration: 200,
        }}
      >
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="calendar" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="memories" />
        <Stack.Screen name="products" />
        <Stack.Screen name="love-languages" />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
}
