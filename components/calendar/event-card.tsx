import { Animated, View, Text, Pressable } from 'react-native';
import { useRef } from 'react';
import { Feather } from '@expo/vector-icons';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'pessoal' | 'casal' | 'especial' | 'viagem';
  color: string;
  visibility: 'privado' | 'compartilhado';
  createdBy: 'me' | 'partner';
  partnerInitial?: string;
}

interface EventCardProps {
  event: CalendarEvent;
  onPress: () => void;
}

const TYPE_LABELS: Record<CalendarEvent['type'], string> = {
  pessoal: 'Pessoal',
  casal: 'Casal',
  especial: 'Especial',
  viagem: 'Viagem',
};

const TYPE_ICONS: Record<CalendarEvent['type'], React.ComponentProps<typeof Feather>['name']> = {
  pessoal: 'user',
  casal: 'heart',
  especial: 'star',
  viagem: 'map-pin',
};

export function EventCard({ event, onPress }: EventCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.97, damping: 15, stiffness: 300, useNativeDriver: true }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, damping: 15, stiffness: 300, useNativeDriver: true }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="flex-row items-center bg-card border border-white/10 rounded-2xl p-3 gap-3"
        accessibilityLabel={`${event.title}, ${event.startTime ?? 'dia inteiro'}, ${TYPE_LABELS[event.type]}`}
        accessibilityRole="button"
        accessibilityHint="Toque para ver detalhes"
      >
        <View className="w-1 self-stretch rounded-full" style={{ backgroundColor: event.color }} />
        <View
          className="w-9 h-9 rounded-xl items-center justify-center"
          style={{ backgroundColor: event.color + '20' }}
          importantForAccessibility="no-hide-descendants"
        >
          <Feather name={TYPE_ICONS[event.type]} size={16} color={event.color} />
        </View>
        <View className="flex-1">
          <Text className="text-text-primary text-sm font-semibold" numberOfLines={1}>{event.title}</Text>
          <Text className="text-text-muted text-xs mt-0.5">
            {event.startTime ? `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ''}` : 'Dia inteiro'}
          </Text>
        </View>
        <View className="items-end gap-1">
          <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: event.color + '20' }}>
            <Text className="text-xs font-medium" style={{ color: event.color }}>{TYPE_LABELS[event.type]}</Text>
          </View>
          {event.createdBy === 'partner' && event.partnerInitial && (
            <View className="w-5 h-5 rounded-full bg-secondary/20 border border-secondary items-center justify-center">
              <Text className="text-secondary text-[9px] font-bold">{event.partnerInitial}</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
