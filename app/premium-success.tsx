import { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';

const FEATURES = [
  { icon: 'droplet' as const, text: 'Temas exclusivos do casal' },
  { icon: 'image' as const, text: 'Storage ilimitado de memórias' },
  { icon: 'bar-chart-2' as const, text: 'Retrospectiva mensal do relacionamento' },
];

export default function PremiumSuccessScreen() {
  const queryClient = useQueryClient();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['subscription'] });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.spring(scale, { toValue: 1.15, damping: 8, stiffness: 200, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 200, useNativeDriver: true }),
    ]).start();
    Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();

    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 400, delay: 300, useNativeDriver: true }),
      Animated.spring(contentTranslateY, { toValue: 0, damping: 18, stiffness: 160, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View
      className="flex-1 bg-surface items-center justify-center px-8"
      accessibilityLabel="Assinatura premium ativada com sucesso"
    >
      <View className="items-center gap-6 w-full">
        <Animated.View style={{ transform: [{ scale }], opacity }}>
          <View className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary items-center justify-center">
            <Feather name="star" size={44} color="#E91E8C" />
          </View>
        </Animated.View>

        <Animated.View
          style={{ opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }}
          className="items-center gap-6 w-full"
        >
          <View className="items-center gap-2">
            <Text className="text-text-primary text-3xl font-bold text-center" accessibilityRole="header">
              Bem-vindos ao Premium! 🎉
            </Text>
            <Text className="text-text-muted text-base text-center leading-6">
              Agora vocês têm acesso a todos os recursos exclusivos do DuoLove.
            </Text>
          </View>

          <View className="w-full bg-card border border-white/10 rounded-2xl p-5 gap-3">
            {FEATURES.map((item) => (
              <View key={item.text} className="flex-row items-center gap-3" accessibilityLabel={item.text}>
                <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center">
                  <Feather name={item.icon} size={16} color="#E91E8C" />
                </View>
                <Text className="text-text-primary text-sm">{item.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => router.replace('/(app)/dashboard')}
            activeOpacity={0.85}
            className="bg-primary rounded-2xl py-4 px-8 w-full items-center"
            accessibilityLabel="Começar a explorar os recursos premium"
            accessibilityRole="button"
          >
            <Text className="text-white font-bold text-base">Começar a explorar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
