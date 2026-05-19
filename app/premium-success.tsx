import { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';

export default function PremiumSuccessScreen() {
  const queryClient = useQueryClient();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['subscription'] });

    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 12 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View className="flex-1 bg-surface items-center justify-center px-8">
      <Animated.View style={{ transform: [{ scale }], opacity }} className="items-center gap-6">
        <View className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary items-center justify-center">
          <Feather name="star" size={44} color="#E91E8C" />
        </View>

        <View className="items-center gap-2">
          <Text className="text-text-primary text-3xl font-bold text-center">
            Bem-vindos ao Premium! 🎉
          </Text>
          <Text className="text-text-muted text-base text-center leading-6">
            Agora vocês têm acesso a todos os recursos exclusivos do DuoLove.
          </Text>
        </View>

        <View className="w-full bg-card border border-white/10 rounded-2xl p-5 gap-3">
          {[
            { icon: 'droplet' as const, text: 'Temas exclusivos do casal' },
            { icon: 'image' as const, text: 'Storage ilimitado de memórias' },
            { icon: 'bar-chart-2' as const, text: 'Retrospectiva mensal do relacionamento' },
          ].map((item) => (
            <View key={item.text} className="flex-row items-center gap-3">
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
        >
          <Text className="text-white font-bold text-base">Começar a explorar</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
