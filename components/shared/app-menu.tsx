import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../hooks/use-auth';
import { useCouple } from '../../hooks/use-couple';
import { useSubscription } from '../../hooks/use-subscription';
import { useMenuStore } from '../../stores/menu-store';

const PANEL_WIDTH = Math.min(300, Dimensions.get('window').width * 0.82);

type MenuItem = {
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  route: string;
  premiumOnly?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  { label: 'Início', icon: 'home', route: '/(app)/dashboard' },
  { label: 'Calendário', icon: 'calendar', route: '/(app)/calendar' },
  { label: 'Duo', icon: 'message-circle', route: '/(app)/chat', premiumOnly: true },
  { label: 'Memórias', icon: 'image', route: '/(app)/memories' },
  { label: 'Produtos', icon: 'gift', route: '/(app)/products' },
  { label: 'Linguagens do Amor', icon: 'heart', route: '/(app)/love-languages', premiumOnly: true },
  { label: 'Configurações', icon: 'settings', route: '/(app)/settings' },
];

/** Botão hambúrguer (3 linhas) — colocar no topo esquerdo do header de cada tela. */
export function AppMenuButton() {
  const open = useMenuStore((s) => s.open);
  return (
    <TouchableOpacity
      onPress={open}
      activeOpacity={0.7}
      className="w-9 h-9 items-center justify-center rounded-full"
      accessibilityLabel="Abrir menu de navegação"
      accessibilityRole="button"
    >
      <Feather name="menu" size={24} color="#F5F0EB" />
    </TouchableOpacity>
  );
}

/** Overlay deslizante — montar uma única vez no layout autenticado. */
export function AppMenu() {
  const isOpen = useMenuStore((s) => s.isOpen);
  const close = useMenuStore((s) => s.close);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { couple } = useCouple();
  const { isPremium } = useSubscription();

  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, damping: 22, stiffness: 220, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -PANEL_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [isOpen]);

  const displayName = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Usuário';
  const initial = displayName.charAt(0).toUpperCase();

  function isActive(route: string): boolean {
    const name = route.split('/').pop();
    return !!name && pathname.includes(name);
  }

  function navigate(route: string) {
    close();
    // pequena espera para a animação de fechamento iniciar antes de navegar.
    // navigate (em vez de push) evita empilhar telas de topo repetidamente.
    setTimeout(() => router.navigate(route as never), 60);
  }

  return (
    <Modal transparent visible={isOpen} animationType="none" onRequestClose={close} accessibilityViewIsModal>
      {/* Backdrop */}
      <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={close} accessibilityLabel="Fechar menu">
        <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', opacity: backdropOpacity }} />
      </Pressable>

      {/* Painel */}
      <Animated.View
        className="bg-surface border-r border-white/10"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: PANEL_WIDTH,
          transform: [{ translateX: slideAnim }],
        }}
      >
        <View className="flex-1 px-4 pt-14 pb-6">
          {/* Header do perfil */}
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

          {/* Itens de navegação */}
          <View className="gap-1">
            {MENU_ITEMS.map((item) => {
              const active = isActive(item.route);
              return (
                <TouchableOpacity
                  key={item.route}
                  onPress={() => navigate(item.route)}
                  activeOpacity={0.7}
                  className={`flex-row items-center gap-3 px-3 py-3.5 rounded-2xl ${active ? 'bg-primary/15' : ''}`}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected: active }}
                >
                  <View
                    className="w-8 h-8 rounded-xl items-center justify-center"
                    style={{ backgroundColor: active ? '#E91E8C30' : '#FFFFFF10' }}
                  >
                    <Feather name={item.icon} size={16} color={active ? '#E91E8C' : '#8B8B9E'} />
                  </View>
                  <Text className={`flex-1 text-sm font-medium ${active ? 'text-primary' : 'text-text-primary'}`}>
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

          <View className="flex-1" />

          {/* Sair */}
          <TouchableOpacity
            onPress={() => { close(); signOut(); }}
            activeOpacity={0.7}
            className="flex-row items-center gap-3 px-3 py-3.5"
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
          >
            <View className="w-8 h-8 rounded-xl items-center justify-center bg-red-500/10">
              <Feather name="log-out" size={16} color="#EF4444" />
            </View>
            <Text className="text-red-400 text-sm font-medium">Sair</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}
