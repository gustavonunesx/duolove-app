import { DrawerContentScrollView } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../hooks/use-auth';
import { useCouple } from '../../hooks/use-couple';
import { useSubscription } from '../../hooks/use-subscription';

type DrawerItem = {
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  route: string;
  premiumOnly?: boolean;
};

const DRAWER_ITEMS: DrawerItem[] = [
  { label: 'Início', icon: 'home', route: '/(app)/dashboard' },
  { label: 'Calendário', icon: 'calendar', route: '/(app)/calendar' },
  { label: 'Duo', icon: 'message-circle', route: '/(app)/chat', premiumOnly: true },
  { label: 'Memórias', icon: 'image', route: '/(app)/memories' },
  { label: 'Produtos', icon: 'gift', route: '/(app)/products' },
  { label: 'Linguagens do Amor', icon: 'heart', route: '/(app)/love-languages', premiumOnly: true },
  { label: 'Configurações', icon: 'settings', route: '/(app)/settings' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DrawerContent(props: any) {
  const { user, signOut } = useAuth();
  const { couple } = useCouple();
  const { isPremium } = useSubscription();

  const displayName = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Usuário';
  const initial = displayName.charAt(0).toUpperCase();

  const activeRoute = (props as any).state?.routes?.[(props as any).state?.index]?.name;

  function isActive(route: string) {
    const routeName = route.split('/').pop();
    return activeRoute === routeName;
  }

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1 }}
      style={{ backgroundColor: '#0D0D0D' }}
    >
      <View className="flex-1 px-4 pt-10 pb-6">
        {/* Profile section */}
        <View className="flex-row items-center gap-3 mb-8 px-2">
          <View className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary items-center justify-center">
            <Text className="text-primary text-lg font-bold">{initial}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-text-primary font-bold text-base" numberOfLines={1}>{displayName}</Text>
            {couple?.start_date && (
              <Text className="text-text-muted text-xs" numberOfLines={1}>
                Juntos desde {new Date(couple.start_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
              </Text>
            )}
          </View>
          {isPremium && (
            <View className="bg-primary/20 px-2 py-1 rounded-full border border-primary/40">
              <Text className="text-primary text-[10px] font-bold">Premium</Text>
            </View>
          )}
        </View>

        {/* Nav items */}
        <View className="gap-1">
          {DRAWER_ITEMS.map((item) => {
            const active = isActive(item.route);
            return (
              <TouchableOpacity
                key={item.route}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
                className={`flex-row items-center gap-3 px-3 py-3.5 rounded-2xl ${active ? 'bg-primary/15' : ''}`}
              >
                <View
                  className="w-8 h-8 rounded-xl items-center justify-center"
                  style={{ backgroundColor: active ? '#E91E8C30' : '#FFFFFF10' }}
                >
                  <Feather
                    name={item.icon}
                    size={16}
                    color={active ? '#E91E8C' : '#8B8B9E'}
                  />
                </View>
                <Text
                  className={`flex-1 text-sm font-medium ${active ? 'text-primary' : 'text-text-primary'}`}
                >
                  {item.label}
                </Text>
                {item.premiumOnly && !isPremium && (
                  <View className="bg-yellow-500/20 px-1.5 py-0.5 rounded-full">
                    <Feather name="lock" size={10} color="#F59E0B" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Spacer */}
        <View className="flex-1" />

        {/* Sign out */}
        <TouchableOpacity
          onPress={signOut}
          activeOpacity={0.7}
          className="flex-row items-center gap-3 px-3 py-3.5"
        >
          <View className="w-8 h-8 rounded-xl items-center justify-center bg-red-500/10">
            <Feather name="log-out" size={16} color="#EF4444" />
          </View>
          <Text className="text-red-400 text-sm font-medium">Sair</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}
