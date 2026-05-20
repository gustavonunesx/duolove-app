import { Animated, Text, View, Pressable } from 'react-native';
import { useRef } from 'react';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';

export type MemoryTag = 'viagem' | 'date' | 'aniversário' | 'milestone' | 'dia a dia';

export interface Memory {
  id: string;
  title: string;
  description?: string;
  date: string;
  photoPlaceholder: string;
  tags: MemoryTag[];
  createdBy: 'me' | 'partner';
  partnerInitial?: string;
}

const TAG_COLORS: Record<MemoryTag, string> = {
  'viagem': '#3498DB',
  'date': '#E91E8C',
  'aniversário': '#E91E8C',
  'milestone': '#9B59B6',
  'dia a dia': '#2ECC71',
};

const TAG_ICONS: Record<MemoryTag, React.ComponentProps<typeof Feather>['name']> = {
  'viagem': 'map-pin',
  'date': 'heart',
  'aniversário': 'star',
  'milestone': 'award',
  'dia a dia': 'sun',
};

interface MemoryCardProps {
  memory: Memory;
  onPress: () => void;
}

export function MemoryCard({ memory, onPress }: MemoryCardProps) {
  const primaryTag = memory.tags[0];
  const tagColor = primaryTag ? TAG_COLORS[primaryTag] : '#E91E8C';
  const tagIcon = primaryTag ? TAG_ICONS[primaryTag] : 'image';
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
        className="bg-card border border-white/10 rounded-2xl overflow-hidden"
        accessibilityLabel={`Memória: ${memory.title}, ${memory.date}`}
        accessibilityRole="button"
        accessibilityHint="Toque para ampliar"
      >
        {memory.photoPlaceholder.startsWith('http') ? (
          <Image
            source={{ uri: memory.photoPlaceholder }}
            style={{ height: 160, width: '100%' }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View
            className="h-40 items-center justify-center"
            style={{ backgroundColor: tagColor + '15' }}
          >
            <Feather name={tagIcon} size={40} color={tagColor} />
            <Text className="text-text-muted text-xs mt-2">{memory.photoPlaceholder}</Text>
          </View>
        )}

        <View className="p-3 gap-2">
          <View className="flex-row items-start justify-between gap-2">
            <Text className="text-text-primary font-semibold text-sm flex-1" numberOfLines={2}>
              {memory.title}
            </Text>
            {memory.createdBy === 'partner' && memory.partnerInitial && (
              <View className="w-5 h-5 rounded-full bg-secondary/20 border border-secondary items-center justify-center">
                <Text className="text-secondary text-[9px] font-bold">{memory.partnerInitial}</Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-text-muted text-xs">{memory.date}</Text>
            <View className="flex-row gap-1">
              {memory.tags.slice(0, 2).map((tag) => (
                <View
                  key={tag}
                  className="px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: TAG_COLORS[tag] + '20' }}
                >
                  <Text className="text-[10px] font-medium capitalize" style={{ color: TAG_COLORS[tag] }}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function MemoryGridCard({ memory, onPress }: MemoryCardProps) {
  const primaryTag = memory.tags[0];
  const tagColor = primaryTag ? TAG_COLORS[primaryTag] : '#E91E8C';
  const tagIcon = primaryTag ? TAG_ICONS[primaryTag] : 'image';
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.96, damping: 15, stiffness: 300, useNativeDriver: true }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, damping: 15, stiffness: 300, useNativeDriver: true }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }], flex: 1, aspectRatio: 1 }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ flex: 1 }}
        className="bg-card border border-white/10 rounded-2xl overflow-hidden"
        accessibilityLabel={`Memória: ${memory.title}, ${memory.date}`}
        accessibilityRole="button"
        accessibilityHint="Toque para ampliar"
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: tagColor + '15' }}>
          <Feather name={tagIcon} size={28} color={tagColor} />
        </View>
        <View className="px-2 py-1.5">
          <Text className="text-text-primary text-[11px] font-medium" numberOfLines={1}>{memory.title}</Text>
          <Text className="text-text-muted text-[10px]">{memory.date}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
