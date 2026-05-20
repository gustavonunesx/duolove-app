import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '../../components/ui/glass-card';

// ─── Mock data ────────────────────────────────────────────────────────────────

const COUPLE_START_DATE = new Date('2023-02-14');

const MOCK_EVENTS = [
  { id: '1', title: 'Jantar no Fasano', date: '22 mai', time: '20:00', color: '#E91E8C', type: 'casal' },
  { id: '2', title: 'Cinema — Deadpool 3', date: '25 mai', time: '18:30', color: '#9B59B6', type: 'casal' },
  { id: '3', title: 'Viagem para Floripa', date: '01 jun', time: '07:00', color: '#E91E8C', type: 'viagem' },
];

const MOCK_ANNIVERSARIES = [
  { id: '1', title: 'Aniversário de namoro', date: '14 fev', daysLeft: 271 },
  { id: '2', title: 'Aniversário dela', date: '08 jun', daysLeft: 20 },
];

const MOCK_LAST_MEMORY = {
  title: 'Fim de semana em Campos do Jordão',
  date: '12 mai 2025',
  photo: null,
};

// ─── Days counter ─────────────────────────────────────────────────────────────

function getDaysTogether(): number {
  const diff = Date.now() - COUPLE_START_DATE.getTime();
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

function AppHeader() {
  return (
    <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
      <View className="flex-row items-center gap-3">
        <View className="flex-row">
          <View
            className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary items-center justify-center z-10"
            accessibilityLabel="Seu avatar"
          >
            <Text className="text-primary font-bold text-sm">G</Text>
          </View>
          <View
            className="w-10 h-10 rounded-full bg-secondary/20 border-2 border-secondary items-center justify-center -ml-3"
            accessibilityLabel="Avatar do parceiro"
          >
            <Text className="text-secondary font-bold text-sm">A</Text>
          </View>
        </View>
        <View>
          <Text className="text-text-primary font-semibold text-base">Gustavo & Ana</Text>
          <Text className="text-text-muted text-xs">juntos desde fev 2023</Text>
        </View>
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        className="w-9 h-9 rounded-full bg-card border border-white/10 items-center justify-center"
        accessibilityLabel="Notificações"
        accessibilityRole="button"
      >
        <Feather name="bell" size={18} color="#8B8B9E" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Cards ────────────────────────────────────────────────────────────────────

function DaysTogetherCard() {
  const days = getDaysTogether();
  return (
    <GlassCard className="items-center gap-2" accessibilityLabel={`Vocês estão juntos há ${days} dias`}>
      <View className="flex-row items-center gap-2 mb-1">
        <Feather name="heart" size={16} color="#E91E8C" />
        <Text className="text-text-muted text-sm font-medium">Dias juntos</Text>
      </View>
      <AnimatedCounter target={days} />
      <Text className="text-text-muted text-xs">
        desde {COUPLE_START_DATE.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
      </Text>
    </GlassCard>
  );
}

function NextEventsCard() {
  if (MOCK_EVENTS.length === 0) {
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
        <TouchableOpacity activeOpacity={0.7} accessibilityLabel="Ver todos os eventos" accessibilityRole="link">
          <Text className="text-primary text-xs font-medium">Ver todos</Text>
        </TouchableOpacity>
      </View>
      {MOCK_EVENTS.map((event) => (
        <View
          key={event.id}
          className="flex-row items-center gap-3"
          accessibilityLabel={`${event.title}, ${event.date} às ${event.time}`}
        >
          <View className="w-1 h-10 rounded-full" style={{ backgroundColor: event.color }} />
          <View className="flex-1">
            <Text className="text-text-primary text-sm font-medium" numberOfLines={1}>{event.title}</Text>
            <Text className="text-text-muted text-xs">{event.date} · {event.time}</Text>
          </View>
          <View className="px-2 py-1 rounded-full" style={{ backgroundColor: event.color + '20' }}>
            <Text className="text-xs font-medium" style={{ color: event.color }}>{event.type}</Text>
          </View>
        </View>
      ))}
    </GlassCard>
  );
}

function AnniversariesCard() {
  return (
    <GlassCard className="gap-3">
      <View className="flex-row items-center gap-2 mb-1">
        <Feather name="star" size={15} color="#E91E8C" />
        <Text className="text-text-primary font-semibold text-sm">Datas especiais</Text>
      </View>
      {MOCK_ANNIVERSARIES.map((a) => (
        <View
          key={a.id}
          className="flex-row items-center justify-between"
          accessibilityLabel={`${a.title}, ${a.date}, ${a.daysLeft === 0 ? 'hoje' : `em ${a.daysLeft} dias`}`}
        >
          <View className="flex-1">
            <Text className="text-text-primary text-sm font-medium">{a.title}</Text>
            <Text className="text-text-muted text-xs">{a.date}</Text>
          </View>
          <View className="bg-primary/10 px-3 py-1 rounded-full">
            <Text className="text-primary text-xs font-semibold">
              {a.daysLeft === 0 ? 'Hoje!' : `em ${a.daysLeft}d`}
            </Text>
          </View>
        </View>
      ))}
    </GlassCard>
  );
}

function PartnerStatusCard() {
  return (
    <GlassCard accessibilityLabel="Ana está online e viu sua última mensagem">
      <View className="flex-row items-center gap-3">
        <View className="relative">
          <View className="w-12 h-12 rounded-full bg-secondary/20 border-2 border-secondary items-center justify-center">
            <Text className="text-secondary font-bold">A</Text>
          </View>
          <View
            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card"
            accessibilityLabel="Online"
          />
        </View>
        <View className="flex-1">
          <Text className="text-text-primary font-semibold text-sm">Ana está online</Text>
          <Text className="text-text-muted text-xs">Viu sua última mensagem</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          className="bg-primary/10 px-4 py-2 rounded-full"
          accessibilityLabel="Enviar mensagem para Ana"
          accessibilityRole="button"
        >
          <Text className="text-primary text-xs font-semibold">Mensagem</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
}

function LastMemoryCard() {
  return (
    <GlassCard className="gap-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Feather name="image" size={15} color="#E91E8C" />
          <Text className="text-text-primary font-semibold text-sm">Última memória</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          accessibilityLabel="Ver todas as memórias"
          accessibilityRole="link"
        >
          <Text className="text-primary text-xs font-medium">Ver todas</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center gap-3">
        <View className="w-16 h-16 rounded-xl bg-primary/10 items-center justify-center">
          <Feather name="image" size={24} color="#E91E8C" />
        </View>
        <View className="flex-1">
          <Text className="text-text-primary text-sm font-medium" numberOfLines={2}>{MOCK_LAST_MEMORY.title}</Text>
          <Text className="text-text-muted text-xs mt-1">{MOCK_LAST_MEMORY.date}</Text>
        </View>
      </View>
    </GlassCard>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  return (
    <View className="flex-1 bg-surface">
      <AppHeader />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <FadeInCard delay={0}><DaysTogetherCard /></FadeInCard>
        <FadeInCard delay={80}><PartnerStatusCard /></FadeInCard>
        <FadeInCard delay={160}><NextEventsCard /></FadeInCard>
        <FadeInCard delay={240}><AnniversariesCard /></FadeInCard>
        <FadeInCard delay={320}><LastMemoryCard /></FadeInCard>
      </ScrollView>
    </View>
  );
}
