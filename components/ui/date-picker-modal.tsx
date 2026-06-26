import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CalendarGrid } from './calendar-grid';

interface DatePickerModalProps {
  visible: boolean;
  value?: string;
  title?: string;
  minDate?: string;
  onClose: () => void;
  onConfirm: (dateStr: string) => void;
}

export function DatePickerModal({
  visible,
  value,
  title = 'Selecione a data',
  minDate,
  onClose,
  onConfirm,
}: DatePickerModalProps) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [temp, setTemp] = useState<string | undefined>(value);

  useEffect(() => {
    if (visible) {
      setTemp(value);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, damping: 18, stiffness: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.92);
      opacity.setValue(0);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose} accessibilityViewIsModal>
      <View className="flex-1 items-center justify-center px-6">
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
          accessibilityLabel="Fechar"
        >
          <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', opacity }} />
        </Pressable>

        <Animated.View
          className="bg-card border border-white/10 rounded-3xl p-4 w-full"
          style={{ maxWidth: 380, transform: [{ scale }], opacity }}
        >
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-text-primary text-base font-bold" accessibilityRole="header">{title}</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} accessibilityLabel="Fechar" accessibilityRole="button">
              <Feather name="x" size={20} color="#8B8B9E" />
            </TouchableOpacity>
          </View>

          <CalendarGrid selectedDate={temp} onSelectDate={setTemp} minDate={minDate} />

          <TouchableOpacity
            onPress={() => temp && (onConfirm(temp), onClose())}
            activeOpacity={0.8}
            disabled={!temp}
            className={`bg-primary rounded-2xl py-3.5 items-center mt-3 ${!temp ? 'opacity-40' : ''}`}
            accessibilityLabel="Confirmar data"
            accessibilityRole="button"
            accessibilityState={{ disabled: !temp }}
          >
            <Text className="text-white font-semibold text-base">Confirmar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
