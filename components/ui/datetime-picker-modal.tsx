import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CalendarGrid } from './calendar-grid';
import { TimeSlotPicker } from './time-slot-picker';

export interface DateTimeValue {
  date: string;
  startTime?: string;
  endTime?: string;
}

interface DateTimePickerModalProps {
  visible: boolean;
  value: DateTimeValue;
  title?: string;
  minDate?: string;
  onClose: () => void;
  onConfirm: (value: DateTimeValue) => void;
}

export function DateTimePickerModal({
  visible,
  value,
  title = 'Data e horário',
  minDate,
  onClose,
  onConfirm,
}: DateTimePickerModalProps) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const [date, setDate] = useState(value.date);
  const [startTime, setStartTime] = useState(value.startTime);
  const [endTime, setEndTime] = useState(value.endTime);

  useEffect(() => {
    if (visible) {
      setDate(value.date);
      setStartTime(value.startTime);
      setEndTime(value.endTime);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, damping: 18, stiffness: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.92);
      opacity.setValue(0);
    }
  }, [visible]);

  function handleSelectStart(time: string) {
    setStartTime(time);
    if (endTime && endTime < time) setEndTime(undefined);
  }

  function handleConfirm() {
    if (!date) return;
    onConfirm({ date, startTime, endTime });
    onClose();
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose} accessibilityViewIsModal>
      <View className="flex-1 items-center justify-center px-5">
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
          accessibilityLabel="Fechar"
        >
          <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', opacity }} />
        </Pressable>

        <Animated.View
          className="bg-card border border-white/10 rounded-3xl w-full"
          style={{ maxWidth: 400, maxHeight: '85%', transform: [{ scale }], opacity }}
        >
          <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
            <Text className="text-text-primary text-base font-bold" accessibilityRole="header">{title}</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} accessibilityLabel="Fechar" accessibilityRole="button">
              <Feather name="x" size={20} color="#8B8B9E" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
          >
            <CalendarGrid selectedDate={date} onSelectDate={setDate} minDate={minDate} />

            <View className="mt-3">
              <TimeSlotPicker label="Início" selected={startTime} onSelect={handleSelectStart} />
            </View>
            <View className="mt-2">
              <TimeSlotPicker
                label="Fim"
                selected={endTime}
                onSelect={setEndTime}
                minTime={startTime || undefined}
              />
            </View>
          </ScrollView>

          <View className="px-4 pt-2 pb-4">
            <TouchableOpacity
              onPress={handleConfirm}
              activeOpacity={0.8}
              disabled={!date}
              className={`bg-primary rounded-2xl py-3.5 items-center ${!date ? 'opacity-40' : ''}`}
              accessibilityLabel="Confirmar data e horário"
              accessibilityRole="button"
              accessibilityState={{ disabled: !date }}
            >
              <Text className="text-white font-semibold text-base">Confirmar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
