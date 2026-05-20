import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '../../components/ui/glass-card';
import { Skeleton, SkeletonCard } from '../../components/ui/skeleton';
import { DrawerMenuButton } from '../../components/shared/drawer-menu-button';
import { useAuth } from '../../hooks/use-auth';
import { useCouple } from '../../hooks/use-couple';
import { useEvents } from '../../hooks/use-events';
import { useMemories } from '../../hooks/use-memories';
import type { EventRow } from '../../lib/supabase/events';
import type { MemoryRow } from '../../lib/supabase/memories';

// ─── Days counter ─────────────────────────────────────────────────────────────

function getDaysTogether(startDate: string): number {
  const diff = Date.now() - new Date(startDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function AnimatedCounter({ target }: { target: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const listener = progress.addListener(({ value }) => {
      setDisplayed(Math.floor(value * target));
    });
    Animated.timing(progress, {
      toValue: 1,
      duration: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => progress.removeListener(listener);
  }, [target]);

  return (
    <Text
      className="text-5xl font-bold text-primary text-center"
      accessibilityLabel={`${target} dias juntos`}
    >
      {displayed.toLocaleString('pt-BR')}
    </Text>
  );
}

// ─── Fade-in card ─────────────────────────────────────────────────────────────

function FadeInCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        stiffness: 180,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function AppHeader({ userName, partnerName }: { userName: string; partnerName: string | null }) {
  const userInitial = userName?.charAt(0).toUpperCase() ?? '?';
  const partnerInitial = partnerName?.charAt(0).toUpperCase() ?? '?';

  return (
    <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
      <View className="flex-row items-center gap-3">
        <View className="flex-row">
          <View
            className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary items-center justify-center z-10"
            accessibilityLabel="Seu avatar"
          >
            <Text className="text-primary font-bold text-sm">{userInitial}</Text>
          </View>
          <View
            className="w-10 h-10 rounded-full bg-secondary/20 border-2 border-secondary items-center justify-center -ml-3"
            accessibilityLabel="Avatar do parceiro"
          >
            <Text className="text-secondary font-bold text-sm">{partnerInitial}</Text>
          </View>
        </View>
        <View>
          {partnerName ? (
            <>
              <Text className="text-text-primary font-semibold text-base">
                {userName} & {partnerName}
              </Text>
            </>
          ) : (
            <Text className="text-text-primary font-semibold text-base">{userName}</Text>
          )}
        </View>
      </View>
      <DrawerMenuButton />
    </View>
  );
}

// ─── Cards ────────────────────────────────────────────────────────────────────

function DaysTogetherCard({ startDate, isLoading }: { startDate: string | null; isLoading: boolean }) {
  if (isLoading) {
    return (
      <SkeletonCard className="items-center gap-2">
        <Skeleton height={16} width={120} />
        <Skeleton height={56} width={140} />
        <Skeleton height={12} width={180} />
      </SkeletonCard>
    );
  }

  if (!startDate) {
    return (
      <GlassCard className="items-center gap-2">
        <View className="flex-row items-center gap-2 mb-1">
          <Feather name="heart" size={16} color="#E91E8C" />
          <Text className="text-text-muted text-sm font-medium">Dias juntos</Text>
        </View>
        <Text className="text-5xl font-bold text-primary text-center">—</Text>
        <Text className="text-text-muted text-xs">Configure a data do relacionamento</Text>
      </GlassCard>
    );
  }

  const days = getDaysTogether(startDate);
  const startDateObj = new Date(startDate);

  return (
    <GlassCard className="items-center gap-2" accessibilityLabel={`Vocês estão juntos há ${days} dias`}>
      <View className="flex-row items-center gap-2 mb-1">
        <Feather name="heart" size={16} color="#E91E8C" />
        <Text className="text-text-muted text-sm font-medium">Dias juntos</Text>
      </View>
      <AnimatedCounter target={days} />
      <Text className="text-text-muted text-xs">
        desde {startDateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
      </Text>
    </GlassCard>
  );
}

const TYPE_COLOR: Record<string, string> = {
  couple: '#E91E8C',
  personal: '#9B59B6',
  anniversary: '#F39C12',
  travel: '#3498DB',
};

const TYPE_LABEL: Record<string, string> = {
  couple: 'casal',
  personal: 'pessoal',
  anniversary: 'especial',
  travel: 'viagem',
};

function NextEventsCard({ events, isLoading }: { events: EventRow[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <SkeletonCard className="gap-3">
        <Skeleton height={14} width={140} />
        {[1, 2].map((i) => (
          <View key={i} className="flex-row items-center gap-3">
            <Skeleton width={4} height={40} rounded="full" />
            <View className="flex-1 gap-1.5">
              <Skeleton height={13} width="60%" />
              <Skeleton height={10} width="35%" />
            </View>
          </View>
        ))}
      </SkeletonCard>
    );
  }

  const upcoming = events
    .filter((e) => new Date(e.start_at) >= new Date())
    .slice(0, 3);

  if (upcoming.length === 0) {
    return (
      <GlassCard className="items-center py-6 gap-2">
        <Feather name="calendar" size={32} color="#8B8B9E" />
        <Text className="text-text-muted text-sm text-center">Vocês ainda não têm eventos juntos 💭</Text>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="gap-3">
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-2">
          <Feather name="calendar" size={15} color="#E91E8C" />
          <Text className="text-text-primary font-semibold text-sm">Próximos eventos</Text>
        </View>
      </View>
      {upcoming.map((event) => {
        const color = event.color ?? TYPE_COLOR[event.type] ?? '#E91E8C';
        const label = TYPE_LABEL[event.type] ?? event.type;
        const dateStr = new Date(event.start_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        const timeStr = new Date(event.start_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return (
          <View
            key={event.id}
            className="flex-row items-center gap-3"
            accessibilityLabel={`${event.title}, ${dateStr} às ${timeStr}`}
          >
            <View className="w-1 h-10 rounded-full" style={{ backgroundColor: color }} />
            <View className="flex-1">
              <Text className="text-text-primary text-sm font-medium" numberOfLines={1}>{event.title}</Text>
              <Text className="text-text-muted text-xs">{dateStr} · {timeStr}</Text>
            </View>
            <View className="px-2 py-1 rounded-full" style={{ backgroundColor: color + '20' }}>
              <Text className="text-xs font-medium" style={{ color }}>{label}</Text>
            </View>
          </View>
        );
      })}
    </GlassCard>
  );
}

function PartnerStatusCard({ partnerName, hasPartner }: { partnerName: string | null; hasPartner: boolean }) {
  if (!hasPartner) {
    return (
      <GlassCard>
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-full bg-white/5 border-2 border-white/10 items-center justify-center">
            <Feather name="user-plus" size={20} color="#8B8B9E" />
          </View>
          <View className="flex-1">
            <Text className="text-text-primary font-semibold text-sm">Nenhum parceiro vinculado</Text>
            <Text className="text-text-muted text-xs">Vá em Configurações para convidar</Text>
          </View>
        </View>
      </GlassCard>
    );
  }

  const initial = partnerName?.charAt(0).toUpperCase() ?? '?';

  return (
    <GlassCard accessibilityLabel={`${partnerName} está no app`}>
      <View className="flex-row items-center gap-3">
        <View className="relative">
          <View className="w-12 h-12 rounded-full bg-secondary/20 border-2 border-secondary items-center justify-center">
            <Text className="text-secondary font-bold">{initial}</Text>
          </View>
          <View
            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card"
            accessibilityLabel="Online"
          />
        </View>
        <View className="flex-1">
          <Text className="text-text-primary font-semibold text-sm">{partnerName}</Text>
          <Text className="text-text-muted text-xs">Parceiro(a) vinculado</Text>
        </View>
      </View>
    </GlassCard>
  );
}

function LastMemoryCard({ memory, isLoading }: { memory: MemoryRow | null; isLoading: boolean }) {
  if (isLoading) {
    return (
      <SkeletonCard className="gap-3">
        <Skeleton height={14} width={120} />
        <View className="flex-row items-center gap-3">
          <Skeleton width={64} height={64} rounded="lg" />
          <View className="flex-1 gap-2">
            <Skeleton height={13} width="70%" />
            <Skeleton height={11} width="40%" />
          </View>
        </View>
      </SkeletonCard>
    );
  }

  if (!memory) {
    return (
      <GlassCard className="items-center py-6 gap-2">
        <Feather name="image" size={32} color="#8B8B9E" />
        <Text className="text-text-muted text-sm text-center">Nenhuma memória ainda ✨</Text>
      </GlassCard>
    );
  }

  const dateStr = new Date(memory.date).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <GlassCard className="gap-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Feather name="image" size={15} color="#E91E8C" />
          <Text className="text-text-primary font-semibold text-sm">Última memória</Text>
        </View>
      </View>
      <View className="flex-row items-center gap-3">
        <View className="w-16 h-16 rounded-xl bg-primary/10 items-center justify-center">
          <Feather name="image" size={24} color="#E91E8C" />
        </View>
        <View className="flex-1">
          <Text className="text-text-primary text-sm font-medium" numberOfLines={2}>{memory.title}</Text>
          <Text className="text-text-muted text-xs mt-1">{dateStr}</Text>
        </View>
      </View>
    </GlassCard>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { user } = useAuth();
  const { couple, isLoading: coupleLoading } = useCouple();
  const { events, isLoading: eventsLoading } = useEvents();
  const { memories, isLoading: memoriesLoading } = useMemories();

  const userName = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Você';
  const hasPartner = !!couple?.user2_id;

  // Aqui precisamos buscar o nome do parceiro — por ora mostramos o ID do parceiro
  // TODO: buscar perfil do parceiro via useQuery quando tivermos hook de users
  const partnerName = hasPartner ? 'Parceiro(a)' : null;

  const lastMemory = memories.length > 0 ? memories[0] : null;

  return (
    <View className="flex-1 bg-surface">
      <AppHeader userName={userName} partnerName={partnerName} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <FadeInCard delay={0}>
          <DaysTogetherCard
            startDate={couple?.start_date ?? null}
            isLoading={coupleLoading}
          />
        </FadeInCard>
        <FadeInCard delay={80}>
          <PartnerStatusCard partnerName={partnerName} hasPartner={hasPartner} />
        </FadeInCard>
        <FadeInCard delay={160}>
          <NextEventsCard events={events} isLoading={eventsLoading} />
        </FadeInCard>
        <FadeInCard delay={240}>
          <LastMemoryCard memory={lastMemory} isLoading={memoriesLoading} />
        </FadeInCard>
      </ScrollView>
    </View>
  );
}
