import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Memory } from './memory-card';

interface MemoryLightboxProps {
  memory: Memory | null;
  visible: boolean;
  onClose: () => void;
}

export function MemoryLightbox({ memory, visible, onClose }: MemoryLightboxProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 4 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.9, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!memory) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View className="flex-1 bg-black/90 justify-center" style={{ opacity }}>
        <Pressable className="absolute inset-0" onPress={onClose} />

        <Animated.View
          className="mx-4 bg-card rounded-3xl overflow-hidden border border-white/10"
          style={{ transform: [{ scale }] }}
        >
          {/* Photo area */}
          <View
            className="h-64 items-center justify-center"
            style={{ backgroundColor: '#1A1A2E' }}
          >
            <Feather name="image" size={64} color="#8B8B9E" />
            <Text className="text-text-muted text-sm mt-2">{memory.photoPlaceholder}</Text>
          </View>

          {/* Details */}
          <View className="p-5 gap-3">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-text-primary font-bold text-lg">{memory.title}</Text>
                <Text className="text-text-muted text-sm mt-0.5">{memory.date}</Text>
              </View>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Feather name="x" size={22} color="#8B8B9E" />
              </TouchableOpacity>
            </View>

            {memory.description ? (
              <Text className="text-text-primary text-sm leading-5">{memory.description}</Text>
            ) : null}

            <View className="flex-row gap-2">
              {memory.tags.map((tag) => (
                <View key={tag} className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                  <Text className="text-primary text-xs font-medium capitalize">{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
