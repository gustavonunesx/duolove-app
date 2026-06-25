import { useEffect, useRef } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MessageInput } from './message-input';
import { PremiumGateScreen } from '../ui/premium-gate';
import { Skeleton } from '../ui/skeleton';

import { useSubscription } from '../../hooks/use-subscription';
import { useAiChat } from '../../hooks/use-ai-chat';
import { AiMessageRow } from '../../lib/supabase/ai-chat';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function DuoBubble({ message }: { message: AiMessageRow }) {
  const isUser = message.role === 'user';

  return (
    <View className={`flex-row mb-3 ${isUser ? 'justify-end' : 'justify-start'} items-end gap-2`}>
      {!isUser && (
        <View className="w-8 h-8 rounded-full bg-primary/20 border border-primary items-center justify-center mb-1">
          <Text className="text-primary text-xs font-black">D</Text>
        </View>
      )}
      <View style={{ maxWidth: '78%' }}>
        <View
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-primary rounded-br-sm'
              : 'bg-card border border-white/10 rounded-bl-sm'
          }`}
        >
          <Text className={`text-sm leading-5 ${isUser ? 'text-white' : 'text-text-primary'}`}>
            {message.content}
          </Text>
        </View>
        <Text className={`text-[10px] text-text-muted mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {toTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

function TypingBubble() {
  return (
    <View className="flex-row mb-3 justify-start items-end gap-2">
      <View className="w-8 h-8 rounded-full bg-primary/20 border border-primary items-center justify-center mb-1">
        <Text className="text-primary text-xs font-black">D</Text>
      </View>
      <View className="bg-card border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
        <View className="flex-row gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <View key={i} className="w-1.5 h-1.5 rounded-full bg-text-muted opacity-60" />
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Limit banner ─────────────────────────────────────────────────────────────

function LimitBanner({ messagesUsed, limit }: { messagesUsed: number; limit: number }) {
  const renewalDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

  return (
    <View className="mx-4 mb-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-4 py-3 flex-row items-center gap-3">
      <Feather name="alert-circle" size={16} color="#F59E0B" />
      <View className="flex-1">
        <Text className="text-yellow-400 text-xs font-semibold">
          Limite mensal atingido ({messagesUsed}/{limit})
        </Text>
        <Text className="text-text-muted text-[10px] mt-0.5">
          Renova em {renewalDate}
        </Text>
      </View>
    </View>
  );
}

// ─── Duo Chat ─────────────────────────────────────────────────────────────────

function DuoChat() {
  const { messages, isLoading, messagesUsed, messagesRemaining, isLimitReached, send, isSending } = useAiChat();
  const listRef = useRef<FlatList>(null);
  const MONTHLY_LIMIT = 50;

  function scrollToBottom() {
    listRef.current?.scrollToEnd({ animated: true });
  }

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length]);

  async function handleSend(text: string) {
    await send(text);
    setTimeout(scrollToBottom, 150);
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
        removeClippedSubviews
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={11}
        ListEmptyComponent={
          isLoading ? (
            <View className="gap-4 py-4">
              {[0, 1, 2].map((i) => (
                <View key={i} className={`flex-row gap-2 items-end ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  {i % 2 === 0 && <Skeleton width={32} height={32} rounded="full" />}
                  <Skeleton height={48} width={200} rounded="lg" />
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center gap-3 py-16">
              <View className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary items-center justify-center">
                <Text className="text-primary text-2xl font-black">D</Text>
              </View>
              <Text className="text-text-primary font-bold text-lg">Olá, sou o Duo!</Text>
              <Text className="text-text-muted text-sm text-center px-8 leading-5">
                Seu assistente amoroso. Estou aqui para ajudar vocês dois a se conectarem mais. O que posso fazer por vocês hoje?
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => <DuoBubble message={item} />}
        ListFooterComponent={isSending ? <TypingBubble /> : null}
      />

      {isLimitReached && (
        <LimitBanner messagesUsed={messagesUsed} limit={MONTHLY_LIMIT} />
      )}

      <MessageInput
        onSend={handleSend}
        disabled={isLimitReached || isSending}
        placeholder={
          isLimitReached
            ? 'Limite mensal atingido'
            : `Pergunte ao Duo... (${messagesRemaining} restantes)`
        }
      />
    </KeyboardAvoidingView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function DuoChatScreen() {
  const { isPremium, isLoading } = useSubscription();

  if (!isLoading && !isPremium) {
    return (
      <PremiumGateScreen
        title="Conheça o Duo"
        description="Seu assistente de relacionamento com IA. Conselhos, ideias de datas e muito mais. Disponível no plano Premium."
      />
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <View className="px-5 pt-14 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary items-center justify-center">
            <Text className="text-primary text-sm font-black">D</Text>
          </View>
          <View>
            <Text className="text-text-primary text-xl font-bold">Duo</Text>
            <Text className="text-text-muted text-xs">Assistente do casal</Text>
          </View>
        </View>
      </View>

      <DuoChat />
    </View>
  );
}
