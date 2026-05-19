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
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0 }),
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
      setStartTime('');
      setEndTime('');
    }
  }, [visible]);

  function handleSave() {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      date: selectedDate ?? '',
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      type,
      color,
      visibility,
    });
    onClose();
  }

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Animated.View
          className="flex-1 bg-black/60"
          style={{ opacity: backdropOpacity }}
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <Animated.View
          className="bg-card rounded-t-3xl border-t border-white/10"
          style={{ transform: [{ translateY: slideAnim }], marginTop: -600 }}
        >
          {/* Handle */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 bg-white/20 rounded-full" />
          </View>

          <View className="flex-row items-center justify-between px-5 py-3">
            <Text className="text-text-primary text-lg font-bold">Novo evento</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={22} color="#8B8B9E" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="px-5"
            contentContainerStyle={{ paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Título do evento"
              placeholderTextColor="#8B8B9E"
              className="bg-surface border border-white/10 rounded-2xl px-4 py-3 text-text-primary text-base mb-3"
            />

            {/* Description */}
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
            />

            {/* Date & time */}
            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">Data e horário</Text>
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-surface border border-white/10 rounded-2xl px-4 py-3">
                <Text className="text-text-muted text-xs mb-1">Data</Text>
                <Text className="text-text-primary text-sm font-medium">{selectedDate ?? '—'}</Text>
              </View>
              <TextInput
                value={startTime}
                onChangeText={setStartTime}
                placeholder="Início"
                placeholderTextColor="#8B8B9E"
                className="flex-1 bg-surface border border-white/10 rounded-2xl px-4 py-3 text-text-primary text-sm"
              />
              <TextInput
                value={endTime}
                onChangeText={setEndTime}
                placeholder="Fim"
                placeholderTextColor="#8B8B9E"
                className="flex-1 bg-surface border border-white/10 rounded-2xl px-4 py-3 text-text-primary text-sm"
              />
            </View>

            {/* Type */}
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
                >
                  <Feather name={t.icon} size={16} color={type === t.value ? '#E91E8C' : '#8B8B9E'} />
                  <Text className={`text-xs font-medium ${type === t.value ? 'text-primary' : 'text-text-muted'}`}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Color */}
            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">Cor</Text>
            <View className="flex-row gap-3 mb-4">
              {COLOR_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  activeOpacity={0.8}
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Feather name="check" size={16} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>

            {/* Visibility */}
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

            {/* Save */}
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.8}
              className={`bg-primary rounded-2xl py-4 items-center ${!title.trim() ? 'opacity-40' : ''}`}
              disabled={!title.trim()}
            >
              <Text className="text-white font-semibold text-base">Salvar evento</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
