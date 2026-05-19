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
import { MessageBubble, Message } from '../../components/chat/message-bubble';
import { ReactionPicker } from '../../components/chat/reaction-picker';
import { MessageInput } from '../../components/chat/message-input';

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    content: 'Oi amor! 🥰 Que dia você prefere para o jantar?',
    senderId: 'partner',
    senderInitial: 'A',
    timestamp: '19:02',
    read: true,
    reactions: [],
  },
  {
    id: '2',
    content: 'Sexta feira tá ótimo! Já fiz a reserva no Fasano 🍷',
    senderId: 'me',
    timestamp: '19:05',
    read: true,
    reactions: [{ emoji: '❤️', count: 1, byMe: false }],
  },
  {
    id: '3',
    content: 'Perfeito!! Mal posso esperar 😍',
    senderId: 'partner',
    senderInitial: 'A',
    timestamp: '19:06',
    read: true,
    reactions: [],
  },
  {
    id: '4',
    content: 'Também não! Vou fazer uma surpresa pra você 🎁',
    senderId: 'me',
    timestamp: '19:10',
    read: true,
    reactions: [{ emoji: '😍', count: 1, byMe: false }],
  },
  {
    id: '5',
    content: 'Ahhh você é demais! Agora fiquei curiosa haha',
    senderId: 'partner',
    senderInitial: 'A',
    timestamp: '19:11',
    read: true,
    reactions: [],
  },
  {
    id: '6',
    content: 'Segredo 🤫 Mas você vai adorar, prometo',
    senderId: 'me',
    timestamp: '19:12',
    read: false,
    reactions: [],
  },
];

const MOCK_EVENT_CONVERSATIONS = [
  { id: 'ev1', title: 'Jantar no Fasano', date: '22 mai', messageCount: 3, color: '#E91E8C' },
  { id: 'ev2', title: 'Cinema — Deadpool 3', date: '25 mai', messageCount: 1, color: '#9B59B6' },
];

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
        <Text className="text-secondary text-[10px] font-bold">A</Text>
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

// ─── Screen ───────────────────────────────────────────────────────────────────

type ChatTab = 'geral' | 'eventos';

export default function ChatScreen() {
  const [activeTab, setActiveTab] = useState<ChatTab>('geral');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [reactionPickerVisible, setReactionPickerVisible] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  function scrollToBottom() {
    listRef.current?.scrollToEnd({ animated: true });
  }

  function handleSend(text: string) {
    const newMsg: Message = {
      id: String(Date.now()),
      content: text,
      senderId: 'me',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      reactions: [],
    };
    setMessages((prev) => [...prev, newMsg]);
    setTimeout(scrollToBottom, 100);

    setTimeout(() => setShowTyping(true), 1200);
    setTimeout(() => {
      setShowTyping(false);
      const reply: Message = {
        id: String(Date.now() + 1),
        content: '❤️',
        senderId: 'partner',
        senderInitial: 'A',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        read: true,
        reactions: [],
      };
      setMessages((prev) => [...prev, reply]);
      setTimeout(scrollToBottom, 100);
    }, 3000);
  }

  function handleLongPress(message: Message) {
    setSelectedMessage(message);
    setReactionPickerVisible(true);
  }

  function handleReaction(messageId: string, emoji: string) {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const existing = m.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          return {
            ...m,
            reactions: existing.byMe
              ? m.reactions.filter((r) => r.emoji !== emoji)
              : m.reactions.map((r) =>
                  r.emoji === emoji ? { ...r, count: r.count + 1, byMe: true } : r
                ),
          };
        }
        return { ...m, reactions: [...m.reactions, { emoji, count: 1, byMe: true }] };
      })
    );
  }

  function handleReactionFromPicker(emoji: string) {
    if (selectedMessage) {
      handleReaction(selectedMessage.id, emoji);
      setSelectedMessage(null);
    }
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-5 pt-14 pb-3">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-text-primary text-2xl font-bold">Chat</Text>
          <View className="flex-row items-center gap-2">
            <View className="w-2 h-2 bg-green-500 rounded-full" />
            <Text className="text-text-muted text-xs">Ana online</Text>
          </View>
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

      {activeTab === 'geral' ? (
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
              <View className="items-center gap-3 py-16">
                <Feather name="message-circle" size={48} color="#8B8B9E" />
                <Text className="text-text-muted text-sm text-center">
                  Mandem a primeira mensagem juntos 💌
                </Text>
              </View>
            }
            ListFooterComponent={showTyping ? <TypingIndicator /> : null}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                onLongPress={handleLongPress}
                onReactionPress={handleReaction}
              />
            )}
          />
          <MessageInput onSend={handleSend} />
        </KeyboardAvoidingView>
      ) : (
        <FlatList
          data={MOCK_EVENT_CONVERSATIONS}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center gap-3 py-16">
              <Feather name="calendar" size={48} color="#8B8B9E" />
              <Text className="text-text-muted text-sm text-center">
                Nenhum evento com comentários ainda
              </Text>
            </View>
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
                  {item.date} · {item.messageCount} comentário{item.messageCount !== 1 ? 's' : ''}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color="#8B8B9E" />
            </TouchableOpacity>
          )}
        />
      )}

      <ReactionPicker
        visible={reactionPickerVisible}
        onSelect={handleReactionFromPicker}
        onClose={() => {
          setReactionPickerVisible(false);
          setSelectedMessage(null);
        }}
      />
    </View>
  );
}
