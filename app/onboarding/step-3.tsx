import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/button';
import { useOnboardingStore } from '../../stores/onboarding-store';
import { OnboardingHeader } from '../../components/shared/onboarding-header';

type Theme = 'rose' | 'lilac' | 'wine';

const THEMES: { id: Theme; label: string; description: string; primary: string; secondary: string; emoji: string }[] = [
  {
    id: 'rose',
    label: 'Rosa',
    description: 'Apaixonado e vibrante',
    primary: '#E91E8C',
    secondary: '#FF6BB5',
    emoji: '🌸',
  },
  {
    id: 'lilac',
    label: 'Lilás',
    description: 'Suave e romântico',
    primary: '#9B59B6',
    secondary: '#C39BD3',
    emoji: '💜',
  },
  {
    id: 'wine',
    label: 'Vinho',
    description: 'Elegante e intenso',
    primary: '#8B0051',
    secondary: '#C0557A',
    emoji: '🍷',
  },
];

export default function OnboardingStep3() {
  const { theme, setTheme } = useOnboardingStore();

  return (
    <View className="flex-1 px-6 pt-16 pb-10">
      <OnboardingHeader
        step={3}
        total={4}
        title="Escolha o tema"
        subtitle="O visual do app vai refletir o estilo do relacionamento de vocês."
      />

      <View className="gap-4">
        {THEMES.map((t) => {
          const selected = theme === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTheme(t.id)}
              activeOpacity={0.8}
              className={`rounded-2xl border p-5 flex-row items-center gap-4 ${
                selected ? 'border-2' : 'border border-white/10 bg-card'
              }`}
              style={selected ? { borderColor: t.primary, backgroundColor: `${t.primary}18` } : {}}
            >
              {/* Preview circle */}
              <View
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{ backgroundColor: `${t.primary}30` }}
              >
                <Text className="text-2xl">{t.emoji}</Text>
              </View>

              {/* Info */}
              <View className="flex-1">
                <Text className="text-text-primary font-semibold text-base">{t.label}</Text>
                <Text className="text-text-muted text-sm mt-0.5">{t.description}</Text>

                {/* Color dots */}
                <View className="flex-row gap-2 mt-2">
                  <View className="w-4 h-4 rounded-full" style={{ backgroundColor: t.primary }} />
                  <View className="w-4 h-4 rounded-full" style={{ backgroundColor: t.secondary }} />
                  <View className="w-4 h-4 rounded-full bg-card border border-white/20" />
                </View>
              </View>

              {/* Check */}
              {selected && (
                <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: t.primary }}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="flex-1" />

      <Button onPress={() => router.push('/onboarding/step-4')}>
        Continuar
      </Button>
    </View>
  );
}
