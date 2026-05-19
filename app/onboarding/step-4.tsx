import { View, Text, TouchableOpacity, Share } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/button';
import { GlassCard } from '../../components/ui/glass-card';
import { useOnboardingStore } from '../../stores/onboarding-store';
import { OnboardingHeader } from '../../components/shared/onboarding-header';

const MOCK_CODE = 'DUO-482910';

export default function OnboardingStep4() {
  const { name } = useOnboardingStore();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${name || 'Alguém especial'} te convidou para o DuoLove! 💕\nUse o código: ${MOCK_CODE}\nOu acesse: https://duolove.app/invite/${MOCK_CODE}`,
        title: 'Convite DuoLove',
      });
    } catch {
      // share dismissed
    }
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View className="flex-1 px-6 pt-16 pb-10">
      <OnboardingHeader
        step={4}
        total={4}
        title="Convide seu(sua) parceiro(a)"
        subtitle="Compartilhe o código abaixo para conectar vocês dois no app."
      />

      {/* Code card */}
      <GlassCard className="items-center p-8">
        <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-6">
          <Ionicons name="heart" size={32} color="#E91E8C" />
        </View>

        <Text className="text-text-muted text-xs mb-2 tracking-widest uppercase">Seu código de convite</Text>

        <TouchableOpacity onPress={handleCopy} activeOpacity={0.7} className="flex-row items-center gap-3">
          <Text className="text-text-primary text-3xl font-bold tracking-wider">{MOCK_CODE}</Text>
          <Ionicons
            name={copied ? 'checkmark-circle' : 'copy-outline'}
            size={22}
            color={copied ? '#4CAF50' : '#8B8B9E'}
          />
        </TouchableOpacity>

        {copied && (
          <Text className="text-green-400 text-xs mt-2">Copiado!</Text>
        )}

        <Text className="text-text-muted text-xs mt-4 text-center">
          O código expira em 48 horas
        </Text>
      </GlassCard>

      {/* Share button */}
      <View className="mt-6">
        <Button
          variant="outline"
          onPress={handleShare}
          icon={<Ionicons name="share-social-outline" size={18} color="#E91E8C" />}
        >
          Compartilhar convite
        </Button>
      </View>

      <View className="flex-1" />

      <Button onPress={() => router.replace('/(app)/dashboard')}>
        Entrar no app
      </Button>

      <TouchableOpacity
        onPress={() => router.replace('/(app)/dashboard')}
        className="items-center mt-4"
      >
        <Text className="text-text-muted text-sm">Convidar depois</Text>
      </TouchableOpacity>
    </View>
  );
}
