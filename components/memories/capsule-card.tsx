import { useEffect, useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface Capsule {
  id: string;
  message?: string;
  revealAt: string;
  revealedAt?: string;
  createdBy: 'me' | 'partner';
  partnerInitial?: string;
}

function getCountdown(revealAt: string): string {
  const diff = new Date(revealAt).getTime() - Date.now();
  if (diff <= 0) return 'Revelar agora!';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h restantes`;
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m restantes`;
}

interface CapsuleCardProps {
  capsule: Capsule;
  onReveal?: (id: string) => void;
}

export function CapsuleCard({ capsule, onReveal }: CapsuleCardProps) {
  const isRevealed = !!capsule.revealedAt;
  const [countdown, setCountdown] = useState(getCountdown(capsule.revealAt));
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isRevealed) return;
    const interval = setInterval(() => {
      setCountdown(getCountdown(capsule.revealAt));
    }, 60000);
    return () => clearInterval(interval);
  }, [capsule.revealAt, isRevealed]);

  useEffect(() => {
    if (isRevealed) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isRevealed]);

  return (
    <View
      className={`rounded-2xl border overflow-hidden ${
        isRevealed
          ? 'bg-card border-primary/30'
          : 'bg-card border-secondary/40'
      }`}
    >
      {/* Top bar */}
      <View
        className="h-1"
        style={{ backgroundColor: isRevealed ? '#E91E8C' : '#9B59B6' }}
      />

      <View className="p-4 gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Animated.View style={{ opacity: isRevealed ? 1 : glowAnim }}>
              <Feather
                name={isRevealed ? 'unlock' : 'lock'}
                size={18}
                color={isRevealed ? '#E91E8C' : '#9B59B6'}
              />
            </Animated.View>
            <Text className="text-text-primary font-semibold text-sm">
              {isRevealed ? 'Cápsula revelada' : 'Cápsula do tempo'}
            </Text>
          </View>
          {capsule.createdBy === 'partner' && capsule.partnerInitial && (
            <View className="w-6 h-6 rounded-full bg-secondary/20 border border-secondary items-center justify-center">
              <Text className="text-secondary text-[10px] font-bold">{capsule.partnerInitial}</Text>
            </View>
          )}
        </View>

        {isRevealed && capsule.message ? (
          <View className="bg-surface rounded-xl p-3">
            <Text className="text-text-primary text-sm italic leading-5">"{capsule.message}"</Text>
          </View>
        ) : (
          <View className="bg-surface rounded-xl p-3 items-center gap-1">
            <Feather name="eye-off" size={20} color="#8B8B9E" />
            <Text className="text-text-muted text-xs text-center">
              Mensagem bloqueada até{'\n'}{new Date(capsule.revealAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        )}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Feather name="clock" size={13} color={isRevealed ? '#E91E8C' : '#9B59B6'} />
            <Text
              className="text-xs font-medium"
              style={{ color: isRevealed ? '#E91E8C' : '#9B59B6' }}
            >
              {isRevealed ? 'Revelada em ' + new Date(capsule.revealedAt!).toLocaleDateString('pt-BR') : countdown}
            </Text>
          </View>
          {!isRevealed && onReveal && countdown === 'Revelar agora!' && (
            <TouchableOpacity
              onPress={() => onReveal(capsule.id)}
              activeOpacity={0.8}
              className="bg-primary rounded-xl px-4 py-1.5"
            >
              <Text className="text-white text-xs font-semibold">Revelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
