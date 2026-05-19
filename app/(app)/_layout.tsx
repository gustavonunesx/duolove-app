import { Tabs } from 'expo-router';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1A1A2E', borderTopColor: '#2A2A4E' },
        tabBarActiveTintColor: '#E91E8C',
        tabBarInactiveTintColor: '#8B8B9E',
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Início' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendário' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="memories" options={{ title: 'Memórias' }} />
      <Tabs.Screen name="settings" options={{ title: 'Config.' }} />
    </Tabs>
  );
}
