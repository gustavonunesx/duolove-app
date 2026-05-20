import { Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSubscription } from '../../hooks/use-subscription';
import { router } from 'expo-router';

interface PremiumGateWrapperProps {
  children: React.ReactNode;
  feature?: string;
  onUpgrade: () => void;
}

// Wraps children with a blurred upgrade overlay when not premium
export function PremiumGate({ children, feature, onUpgrade }: PremiumGateWrapperProps) {
  const { isPremium, isLoading } = useSubscription();

  if (isLoading || isPremium) return <>{children}</>;

  return (
    <View className="relative overflow-hidden rounded-2xl">
      <View className="opacity-30 pointer-events-none">{children}</View>
      <View className="absolute inset-0 bg-surface/80 items-center justify-center gap-3 p-6">
        <View className="w-12 h-12 rounded-full bg-primary/20 border border-primary items-center justify-center">
          <Feather name="lock" size={22} color="#E91E8C" />
        </View>
        <Text className="text-text-primary font-bold text-base text-center">
          {feature ?? 'Recurso Premium'}
        </Text>
        <Text className="text-text-muted text-sm text-center">
          Faça upgrade para acessar esse recurso exclusivo.
        </Text>
        <TouchableOpacity
          onPress={onUpgrade}
          activeOpacity={0.85}
          className="bg-primary rounded-2xl px-6 py-3"
        >
          <Text className="text-white font-semibold text-sm">Ver planos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface PremiumGateScreenProps {
  title: string;
  description: string;
}

// Full-screen premium gate for entire screens
export function PremiumGateScreen({ title, description }: PremiumGateScreenProps) {
  return (
    <View className="flex-1 bg-surface items-center justify-center px-8 gap-5">
      <View className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary items-center justify-center">
        <Feather name="lock" size={32} color="#E91E8C" />
      </View>
      <View className="items-center gap-2">
        <Text className="text-text-primary text-xl font-bold text-center">{title}</Text>
        <Text className="text-text-muted text-sm text-center leading-5">{description}</Text>
      </View>
      <TouchableOpacity
        onPress={() => router.push('/(app)/settings')}
        activeOpacity={0.85}
        className="bg-primary rounded-2xl px-8 py-4"
      >
        <Text className="text-white font-bold text-base">Ver planos Premium</Text>
      </TouchableOpacity>
      <Text className="text-text-muted text-xs text-center">A partir de R$ 19,90/mês</Text>
    </View>
  );
}
