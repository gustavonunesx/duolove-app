import { Drawer } from 'expo-router/drawer';
import { DrawerContent } from '../../components/shared/drawer-content';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function AppLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#0D0D0D',
            width: 280,
          },
        }}
      >
        <Drawer.Screen name="dashboard" options={{ title: 'Início' }} />
        <Drawer.Screen name="calendar" options={{ title: 'Calendário' }} />
        <Drawer.Screen name="chat" options={{ title: 'Duo' }} />
        <Drawer.Screen name="memories" options={{ title: 'Memórias' }} />
        <Drawer.Screen name="products" options={{ title: 'Produtos' }} />
        <Drawer.Screen name="love-languages" options={{ title: 'Linguagens do Amor' }} />
        <Drawer.Screen name="settings" options={{ title: 'Configurações' }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
