import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { useRef } from 'react';
import * as Haptics from 'expo-haptics';

export interface Reaction {
  emoji: string;
  count: number;
  byMe: boolean;
}

export interface Message {
  id: string;
  content: string;
  senderId: 'me' | 'partner';
  senderInitial?: string;
  timestamp: string;
  read: boolean;
  reactions: Reaction[];
}

interface MessageBubbleProps {
  message: Message;
  onLongPress: (message: Message) => void;
  onReactionPress: (messageId: string, emoji: string) => void;
}

export function MessageBubble({ message, onLongPress, onReactionPress }: MessageBubbleProps) {
  const isMe = message.senderId === 'me';
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.97, damping: 15, stiffness: 300, useNativeDriver: true }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, damping: 15, stiffness: 300, useNativeDriver: true }).start();
  }

  async function handleLongPress() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress(message);
  }

  return (
    <View
      className={`flex-row items-end gap-2 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}
      accessibilityLabel={`${isMe ? 'Você' : 'Parceiro(a)'}: ${message.content}, às ${message.timestamp}`}
    >
      {!isMe && (
        <View
          className="w-7 h-7 rounded-full bg-secondary/20 border border-secondary items-center justify-center mb-1"
          importantForAccessibility="no-hide-descendants"
        >
          <Text className="text-secondary text-[10px] font-bold">{message.senderInitial ?? 'P'}</Text>
        </View>
      )}

      <View className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            onLongPress={handleLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            delayLongPress={350}
            className={`rounded-2xl px-4 py-2.5 ${
              isMe
                ? 'bg-primary rounded-br-sm'
                : 'bg-card border border-white/10 rounded-bl-sm'
            }`}
            accessibilityLabel={message.content}
            accessibilityHint="Pressione e segure para reagir"
          >
            <Text className={`text-sm leading-5 ${isMe ? 'text-white' : 'text-text-primary'}`}>
              {message.content}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {message.reactions.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mt-1">
            {message.reactions.map((r) => (
              <TouchableOpacity
                key={r.emoji}
                onPress={() => onReactionPress(message.id, r.emoji)}
                activeOpacity={0.7}
                className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full border ${
                  r.byMe ? 'bg-primary/20 border-primary/40' : 'bg-card border-white/10'
                }`}
                accessibilityLabel={`${r.emoji} ${r.count} ${r.byMe ? ', incluindo você' : ''}`}
                accessibilityRole="button"
              >
                <Text className="text-xs">{r.emoji}</Text>
                {r.count > 1 && <Text className="text-[10px] text-text-muted">{r.count}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View className="flex-row items-center gap-1 mt-0.5" importantForAccessibility="no-hide-descendants">
          <Text className="text-text-muted text-[10px]">{message.timestamp}</Text>
          {isMe && (
            <Text className={`text-[10px] ${message.read ? 'text-primary' : 'text-text-muted'}`}>
              {message.read ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
