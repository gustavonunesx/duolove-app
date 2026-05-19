import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MessageBubble, Message, Reaction } from '../../components/chat/message-bubble';
import { ReactionPicker } from '../../components/chat/reaction-picker';
import { MessageInput } from '../../components/chat/message-input';
import { useMessages } from '../../hooks/use-messages';
import { useCouple } from '../../hooks/use-couple';
import { useAuth } from '../../hooks/use-auth';
import { useEvents } from '../../hooks/use-events';
import { MessageRow, ReactionRow } from '../../lib/supabase/messages';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toTimestamp(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function buildMessage(row: MessageRow, currentUserId: string, reactions: ReactionRow[]): Message {
  const msgReactions = reactions.filter((r) => r.message_id === row.id);
  const grouped: Record<string, Reaction> = {};
  for (const r of msgReactions) {
    if (!grouped[r.emoji]) {
      grouped[r.emoji] = { emoji: r.emoji, count: 0, byMe: false };
    }
    grouped[r.emoji].count += 1;
    if (r.user_id === currentUserId) grouped[r.emoji].byMe = true;
  }

  return {
    id: row.id,
    content: row.content,
    senderId: row.sender_id === currentUserId ? 'me' : 'partner',
    timestamp: toTimestamp(row.created_at),
    read: true,
    reactions: Object.values(grouped),
  };
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    function animateDot(dot: Animated.Value, delay: number) {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -5, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );
    }
    const a1 = animateDot(dot1, 0);
    const a2 = animateDot(dot2, 150);
    const a3 = animateDot(dot3, 300);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View className="flex-row items-end gap-2 mb-2 justify-start">
      <View className="w-7 h-7 rounded-full bg-secondary/20 border border-secondary items-center justify-center">
        <Text className="text-secondary text-[10px] font-bold">P</Text>
      </View>
      <View className="bg-card border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex-row gap-1 items-center">
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-text-muted"
            style={{ transform: [{ translateY: dot }] }}
          />
        ))}
      </View>
    </View>
  );
}

// ─── General chat ─────────────────────────────────────────────────────────────

function GeneralChat() {
  const { user } = useAuth();
  const { messages: rawMessages, reactions, isLoading, sendMessage, toggleReaction } = useMessages();
  const listRef = useRef<FlatList>(null);
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [reactionPickerVisible, setReactionPickerVisible] = useState(false);

  const messages: Message[] = rawMessages.map((row) =>
    buildMessage(row, user!.id, reactions)
  );

  const selectedMessage = messages.find((m) => m.id === selectedMsgId) ?? null;

  function scrollToBottom() {
    listRef.current?.scrollToEnd({ animated: true });
  }

  async function handleSend(text: string) {
    await sendMessage(text);
    setTimeout(scrollToBottom, 100);
  }

  function handleLongPress(message: Message) {
    setSelectedMsgId(message.id);
    setReactionPickerVisible(true);
  }

  async function handleReaction(messageId: string, emoji: string) {
    await toggleReaction({ messageId, emoji });
  }

  async function handleReactionFromPicker(emoji: string) {
    if (selectedMsgId) {
      await toggleReaction({ messageId: selectedMsgId, emoji });
      setSelectedMsgId(null);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
        ListEmptyComponent={
          isLoading ? null : (
            <View className="items-center gap-3 py-16">
              <Feather name="message-circle" size={48} color="#8B8B9E" />
              <Text className="text-text-muted text-sm text-center">
                Mandem a primeira mensagem juntos 💌
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            onLongPress={handleLongPress}
            onReactionPress={handleReaction}
          />
        )}
      />
      <MessageInput onSend={handleSend} />

      <ReactionPicker
        visible={reactionPickerVisible}
        onSelect={handleReactionFromPicker}
        onClose={() => {
          setReactionPickerVisible(false);
          setSelectedMsgId(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}

// ─── Event conversations ───────────────────────────────────────────────────────

function EventConversations() {
  const { events, isLoading } = useEvents();

  const eventsWithMessages = events.filter((e) => e.visibility === 'shared');

  return (
    <FlatList
      data={eventsWithMessages}
      keyExtractor={(e) => e.id}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        isLoading ? null : (
          <View className="items-center gap-3 py-16">
            <Feather name="calendar" size={48} color="#8B8B9E" />
            <Text className="text-text-muted text-sm text-center">
              Nenhum evento compartilhado ainda
            </Text>
          </View>
        )
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          activeOpacity={0.75}
          className="bg-card border border-white/10 rounded-2xl p-4 flex-row items-center gap-3"
        >
          <View
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: item.color + '20' }}
          >
            <Feather name="calendar" size={18} color={item.color} />
          </View>
          <View className="flex-1">
            <Text className="text-text-primary font-semibold text-sm" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-text-muted text-xs">
              {new Date(item.start_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color="#8B8B9E" />
        </TouchableOpacity>
      )}
    />
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type ChatTab = 'geral' | 'eventos';

export default function ChatScreen() {
  const [activeTab, setActiveTab] = useState<ChatTab>('geral');
  const { couple } = useCouple();

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-5 pt-14 pb-3">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-text-primary text-2xl font-bold">Chat</Text>
          {couple?.user2_id && (
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 bg-green-500 rounded-full" />
              <Text className="text-text-muted text-xs">Parceiro(a) conectado</Text>
            </View>
          )}
        </View>

        <View className="flex-row bg-card border border-white/10 rounded-2xl p-1 gap-1">
          {(['geral', 'eventos'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
              className={`flex-1 py-2 rounded-xl items-center ${activeTab === tab ? 'bg-primary' : ''}`}
            >
              <Text className={`text-xs font-semibold ${activeTab === tab ? 'text-white' : 'text-text-muted'}`}>
                {tab === 'geral' ? 'Geral' : 'Por evento'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeTab === 'geral' ? <GeneralChat /> : <EventConversations />}
    </View>
  );
}
