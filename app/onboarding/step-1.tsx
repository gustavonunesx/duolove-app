import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useOnboardingStore } from '../../stores/onboarding-store';
import { OnboardingHeader } from '../../components/shared/onboarding-header';

export default function OnboardingStep1() {
  const { name, avatarUri, setName, setAvatarUri } = useOnboardingStore();

  const pickImage = () => {
    // UI only — expo-image-picker will be wired in M6
    setAvatarUri('mock');
  };

  const canContinue = name.trim().length >= 2;

  return (
    <View className="flex-1 px-6 pt-16 pb-10">
      <OnboardingHeader step={1} total={4} title="Seu perfil" subtitle="Como você quer aparecer para o(a) seu(sua) parceiro(a)?" />

      {/* Avatar picker */}
      <View className="items-center my-8">
        <TouchableOpacity onPress={pickImage} activeOpacity={0.8} className="relative">
          <View className="w-28 h-28 rounded-full bg-card border-2 border-white/10 items-center justify-center overflow-hidden">
            {avatarUri ? (
              <View className="w-full h-full bg-primary/20 items-center justify-center">
                <Ionicons name="person" size={48} color="#E91E8C" />
              </View>
            ) : (
              <Ionicons name="person-outline" size={48} color="#8B8B9E" />
            )}
          </View>
          <View className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary items-center justify-center border-2 border-surface">
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text className="text-text-muted text-xs mt-3">Toque para adicionar uma foto</Text>
      </View>

      {/* Name input */}
      <Input
        label="Seu nome"
        placeholder="Como podemos te chamar?"
        autoCapitalize="words"
        value={name}
        onChangeText={setName}
        icon={<Ionicons name="person-outline" size={18} color="#8B8B9E" />}
      />

      <View className="flex-1" />

      <Button onPress={() => router.push('/onboarding/step-2')} disabled={!canContinue}>
        Continuar
      </Button>
    </View>
  );
}
