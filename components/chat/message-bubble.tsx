import { Text, TouchableOpacity, View } from 'react-native';

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

  return (
    <View className={`flex-row items-end gap-2 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
      {!isMe && (
        <View className="w-7 h-7 rounded-full bg-secondary/20 border border-secondary items-center justify-center mb-1">
          <Text className="text-secondary text-[10px] font-bold">{message.senderInitial ?? 'P'}</Text>
        </View>
      )}

      <View className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
        <TouchableOpacity
          onLongPress={() => onLongPress(message)}
          activeOpacity={0.85}
          delayLongPress={350}
          className={`rounded-2xl px-4 py-2.5 ${
            isMe
              ? 'bg-primary rounded-br-sm'
              : 'bg-card border border-white/10 rounded-bl-sm'
          }`}
        >
          <Text className={`text-sm leading-5 ${isMe ? 'text-white' : 'text-text-primary'}`}>
            {message.content}
          </Text>
        </TouchableOpacity>

        {/* Reactions */}
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
              >
                <Text className="text-xs">{r.emoji}</Text>
                {r.count > 1 && <Text className="text-[10px] text-text-muted">{r.count}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Timestamp + read indicator */}
        <View className="flex-row items-center gap-1 mt-0.5">
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
