import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';

const EMOJI_OPTIONS = ['❤️', '😂', '😍', '😮', '😢', '👏'];

interface ReactionPickerProps {
  visible: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function ReactionPicker({ visible, onSelect, onClose }: ReactionPickerProps) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, damping: 14, stiffness: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scale, { toValue: 0.7, duration: 150, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  async function handleSelect(emoji: string) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(emoji);
    onClose();
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <Pressable
        className="flex-1 justify-end pb-32 items-center"
        onPress={onClose}
        accessibilityLabel="Fechar seletor de reações"
        accessibilityRole="button"
      >
        <Animated.View
          style={{ opacity, transform: [{ scale }] }}
          className="bg-card border border-white/10 rounded-2xl px-4 py-3 flex-row gap-3"
        >
          {EMOJI_OPTIONS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => handleSelect(emoji)}
              activeOpacity={0.7}
              className="w-11 h-11 items-center justify-center rounded-xl active:bg-white/10"
              accessibilityLabel={`Reagir com ${emoji}`}
              accessibilityRole="button"
            >
              <Text className="text-2xl">{emoji}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
