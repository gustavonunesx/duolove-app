import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CalendarEvent } from './event-card';
import { DateTimePickerModal } from '../ui/datetime-picker-modal';

const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MONTHS_LONG = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function formatLongDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS_LONG[d.getMonth()]}`;
}

const EVENT_TYPES: { value: CalendarEvent['type']; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { value: 'casal', label: 'Casal', icon: 'heart' },
  { value: 'pessoal', label: 'Pessoal', icon: 'user' },
  { value: 'especial', label: 'Especial', icon: 'star' },
  { value: 'viagem', label: 'Viagem', icon: 'map-pin' },
];

const COLOR_OPTIONS = ['#E91E8C', '#9B59B6', '#3498DB', '#2ECC71', '#F39C12', '#E74C3C'];

interface EventFormSheetProps {
  visible: boolean;
  selectedDate?: string;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id' | 'createdBy'>) => void;
}

export function EventFormSheet({ visible, selectedDate, onClose, onSave }: EventFormSheetProps) {
  const slideAnim = useRef(new Animated.Value(600)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('casal');
  const [color, setColor] = useState('#E91E8C');
  const [visibility, setVisibility] = useState<CalendarEvent['visibility']>('compartilhado');
  const [date, setDate] = useState(selectedDate ?? '');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setDate(selectedDate ?? '');
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, damping: 20, stiffness: 200, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 600, duration: 250, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      setTitle('');
      setDescription('');
      setType('casal');
      setColor('#E91E8C');
      setVisibility('compartilhado');
      setDate('');
      setStartTime('');
      setEndTime('');
    }
  }, [visible]);

  function handleConfirmDateTime(v: { date: string; startTime?: string; endTime?: string }) {
    setDate(v.date);
    setStartTime(v.startTime ?? '');
    setEndTime(v.endTime ?? '');
  }

  function handleSave() {
    if (!title.trim() || !date) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      type,
      color,
      visibility,
    });
    onClose();
  }

  const canSave = !!title.trim() && !!date;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} accessibilityViewIsModal>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
          accessibilityLabel="Fechar"
        >
          <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', opacity: backdropOpacity }} />
        </Pressable>

        <Animated.View
          className="bg-card rounded-t-3xl border-t border-white/10"
          style={{ transform: [{ translateY: slideAnim }], maxHeight: '90%' }}
        >
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 bg-white/20 rounded-full" />
          </View>

          <View className="flex-row items-center justify-between px-5 py-3">
            <Text className="text-text-primary text-lg font-bold" accessibilityRole="header">Novo evento</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} accessibilityLabel="Fechar" accessibilityRole="button">
              <Feather name="x" size={22} color="#8B8B9E" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="px-5"
            contentContainerStyle={{ paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Título do evento"
              placeholderTextColor="#8B8B9E"
              className="bg-surface border border-white/10 rounded-2xl px-4 py-3 text-text-primary text-base mb-3"
              accessibilityLabel="Título do evento"
            />

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Descrição (opcional)"
              placeholderTextColor="#8B8B9E"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="bg-surface border border-white/10 rounded-2xl px-4 py-3 text-text-primary text-sm mb-4"
              style={{ height: 80 }}
              accessibilityLabel="Descrição do evento"
            />

            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">Data e horário</Text>

            <TouchableOpacity
              onPress={() => setDateTimePickerVisible(true)}
              activeOpacity={0.7}
              className="bg-surface border border-white/10 rounded-2xl px-4 py-3 mb-4 flex-row items-center justify-between"
              accessibilityRole="button"
              accessibilityLabel="Selecionar data e horário"
            >
              <View className="flex-1 pr-3">
                {date ? (
                  <Text className="text-text-primary text-sm font-medium" numberOfLines={1}>
                    {formatLongDate(date)}
                    {startTime ? ` · ${startTime}${endTime ? `–${endTime}` : ''}` : ''}
                  </Text>
                ) : (
                  <Text className="text-text-muted text-sm">Selecionar data e horário</Text>
                )}
              </View>
              <Feather name="calendar" size={18} color="#8B8B9E" />
            </TouchableOpacity>

            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">Tipo</Text>
            <View className="flex-row gap-2 mb-4">
              {EVENT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  onPress={() => setType(t.value)}
                  activeOpacity={0.7}
                  className={`flex-1 items-center py-2.5 rounded-2xl border gap-1 ${
                    type === t.value ? 'bg-primary/20 border-primary' : 'bg-surface border-white/10'
                  }`}
                  accessibilityLabel={`Tipo ${t.label}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: type === t.value }}
                >
                  <Feather name={t.icon} size={16} color={type === t.value ? '#E91E8C' : '#8B8B9E'} />
                  <Text className={`text-xs font-medium ${type === t.value ? 'text-primary' : 'text-text-muted'}`}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">Cor</Text>
            <View className="flex-row gap-3 mb-4">
              {COLOR_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  activeOpacity={0.8}
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: c }}
                  accessibilityLabel={`Cor ${c}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: color === c }}
                >
                  {color === c && <Feather name="check" size={16} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">Visibilidade</Text>
            <View className="flex-row gap-3 mb-6">
              {(['compartilhado', 'privado'] as const).map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => setVisibility(v)}
                  activeOpacity={0.7}
                  className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl border ${
                    visibility === v ? 'bg-primary/20 border-primary' : 'bg-surface border-white/10'
                  }`}
                  accessibilityLabel={v === 'compartilhado' ? 'Compartilhado com parceiro' : 'Privado'}
                  accessibilityRole="button"
                  accessibilityState={{ selected: visibility === v }}
                >
                  <Feather
                    name={v === 'compartilhado' ? 'users' : 'lock'}
                    size={15}
                    color={visibility === v ? '#E91E8C' : '#8B8B9E'}
                  />
                  <Text className={`text-sm font-medium capitalize ${visibility === v ? 'text-primary' : 'text-text-muted'}`}>
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.8}
              className={`bg-primary rounded-2xl py-4 items-center ${!canSave ? 'opacity-40' : ''}`}
              disabled={!canSave}
              accessibilityLabel="Salvar evento"
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSave }}
            >
              <Text className="text-white font-semibold text-base">Salvar evento</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      <DateTimePickerModal
        visible={dateTimePickerVisible}
        value={{ date, startTime: startTime || undefined, endTime: endTime || undefined }}
        onClose={() => setDateTimePickerVisible(false)}
        onConfirm={handleConfirmDateTime}
      />
    </Modal>
  );
}
