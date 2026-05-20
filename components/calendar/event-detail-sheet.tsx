import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CalendarEvent } from './event-card';

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

interface EventDetailSheetProps {
  event: CalendarEvent | null;
  visible: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function EventDetailSheet({ event, visible, onClose, onDelete }: EventDetailSheetProps) {
  const slideAnim = useRef(new Animated.Value(500)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, damping: 20, stiffness: 200, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 500, duration: 250, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!event) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} accessibilityViewIsModal>
      <Animated.View className="flex-1 bg-black/60 justify-end" style={{ opacity: backdropOpacity }}>
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Fechar" />
        <Animated.View
          className="bg-card rounded-t-3xl border-t border-white/10"
          style={{ transform: [{ translateY: slideAnim }] }}
        >
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 bg-white/20 rounded-full" />
          </View>

          <View className="flex-row items-center justify-between px-5 py-3">
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: event.color + '20' }}
                importantForAccessibility="no-hide-descendants"
              >
                <Feather name={TYPE_ICONS[event.type]} size={18} color={event.color} />
              </View>
              <View>
                <Text
                  className="text-text-primary font-bold text-lg"
                  numberOfLines={1}
                  accessibilityRole="header"
                >
                  {event.title}
                </Text>
                <Text className="text-text-muted text-xs">{TYPE_LABELS[event.type]}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityLabel="Fechar"
              accessibilityRole="button"
            >
              <Feather name="x" size={22} color="#8B8B9E" />
            </TouchableOpacity>
          </View>

          <View className="px-5 pb-10 gap-4">
            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface rounded-2xl p-3" accessibilityLabel={`Data: ${event.date}`}>
                <Text className="text-text-muted text-xs mb-1">Data</Text>
                <Text className="text-text-primary text-sm font-semibold">{event.date}</Text>
              </View>
              <View
                className="flex-1 bg-surface rounded-2xl p-3"
                accessibilityLabel={`Horário: ${event.startTime ? `${event.startTime}${event.endTime ? ` até ${event.endTime}` : ''}` : 'Dia inteiro'}`}
              >
                <Text className="text-text-muted text-xs mb-1">Horário</Text>
                <Text className="text-text-primary text-sm font-semibold">
                  {event.startTime
                    ? `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ''}`
                    : 'Dia inteiro'}
                </Text>
              </View>
            </View>

            {event.description ? (
              <View className="bg-surface rounded-2xl p-4" accessibilityLabel={`Descrição: ${event.description}`}>
                <Text className="text-text-muted text-xs mb-1">Descrição</Text>
                <Text className="text-text-primary text-sm">{event.description}</Text>
              </View>
            ) : null}

            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface rounded-2xl p-3 flex-row items-center gap-2">
                <Feather name={event.visibility === 'compartilhado' ? 'users' : 'lock'} size={14} color="#8B8B9E" />
                <Text className="text-text-primary text-sm capitalize">{event.visibility}</Text>
              </View>
              <View className="flex-1 bg-surface rounded-2xl p-3 flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color }} />
                <Text className="text-text-primary text-sm">
                  {event.createdBy === 'me' ? 'Por você' : `Por ${event.partnerInitial ?? 'parceiro'}`}
                </Text>
              </View>
            </View>

            {onDelete && (
              <TouchableOpacity
                onPress={() => { onDelete(event.id); onClose(); }}
                activeOpacity={0.7}
                className="flex-row items-center justify-center gap-2 border border-red-500/30 rounded-2xl py-3"
                accessibilityLabel="Excluir este evento"
                accessibilityRole="button"
              >
                <Feather name="trash-2" size={16} color="#FF4D4D" />
                <Text className="text-red-400 text-sm font-medium">Excluir evento</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
