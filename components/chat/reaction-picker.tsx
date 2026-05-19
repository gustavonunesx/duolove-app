import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

const EMOJI_OPTIONS = ['❤️', '😂', '😍', '😮', '😢', '👏'];

interface ReactionPickerProps {
  visible: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function ReactionPicker({ visible, onSelect, onClose }: ReactionPickerProps) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 8 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0.7, duration: 150, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end pb-32 items-center" onPress={onClose}>
        <Animated.View
          style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }] }}
          className="bg-card border border-white/10 rounded-2xl px-4 py-3 flex-row gap-3"
        >
          {EMOJI_OPTIONS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => { onSelect(emoji); onClose(); }}
              activeOpacity={0.7}
              className="w-11 h-11 items-center justify-center rounded-xl active:bg-white/10"
            >
              <Text className="text-2xl">{emoji}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
