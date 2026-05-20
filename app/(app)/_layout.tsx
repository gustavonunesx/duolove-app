import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';

function TabIcon({ name, focused }: { name: React.ComponentProps<typeof Feather>['name']; focused: boolean }) {
  return (
    <Feather name={name} size={22} color={focused ? '#E91E8C' : '#8B8B9E'} />
  );
}

function DuoTabIcon({ focused }: { focused: boolean }) {
  return (
    <View className="w-7 h-7 rounded-full bg-primary/20 border border-primary items-center justify-center"
      style={{ borderColor: focused ? '#E91E8C' : '#8B8B9E', backgroundColor: focused ? '#E91E8C20' : 'transparent' }}
    >
      <Feather name="message-circle" size={14} color={focused ? '#E91E8C' : '#8B8B9E'} />
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A1A2E',
          borderTopColor: '#2A2A4E',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#E91E8C',
        tabBarInactiveTintColor: '#8B8B9E',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendário',
          tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Duo',
          tabBarIcon: ({ focused }) => <DuoTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: 'Memórias',
          tabBarIcon: ({ focused }) => <TabIcon name="image" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Produtos',
          tabBarIcon: ({ focused }) => <TabIcon name="gift" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="love-languages"
        options={{
          title: 'Amor',
          tabBarIcon: ({ focused }) => <TabIcon name="heart" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Config.',
          tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
