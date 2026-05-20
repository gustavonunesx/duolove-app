import { useEffect } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { Memory } from './memory-card';

interface MemoryLightboxProps {
  memory: Memory | null;
  visible: boolean;
  onClose: () => void;
}

export function MemoryLightbox({ memory, visible, onClose }: MemoryLightboxProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 16, stiffness: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 180 });
      scale.value = withTiming(0.9, { duration: 180 });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!memory) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <Animated.View className="flex-1 bg-black/90 justify-center" style={backdropStyle}>
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
          accessibilityLabel="Fechar visualização"
        />

        <Animated.View
          className="mx-4 bg-card rounded-3xl overflow-hidden border border-white/10"
          style={cardStyle}
        >
          {memory.photoPlaceholder.startsWith('http') ? (
            <Image
              source={{ uri: memory.photoPlaceholder }}
              style={{ height: 256, width: '100%' }}
              contentFit="cover"
              transition={200}
              accessibilityLabel="Foto da memória"
            />
          ) : (
            <View
              className="h-64 items-center justify-center"
              style={{ backgroundColor: '#1A1A2E' }}
              accessibilityLabel="Foto da memória"
            >
              <Feather name="image" size={64} color="#8B8B9E" />
              <Text className="text-text-muted text-sm mt-2">{memory.photoPlaceholder}</Text>
            </View>
          )}

          <View className="p-5 gap-3">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-text-primary font-bold text-lg" accessibilityRole="header">
                  {memory.title}
                </Text>
                <Text className="text-text-muted text-sm mt-0.5">{memory.date}</Text>
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
