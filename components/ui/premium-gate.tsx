import { Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSubscription } from '../../hooks/use-subscription';

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: string;
  onUpgrade: () => void;
}

export function PremiumGate({ children, feature, onUpgrade }: PremiumGateProps) {
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
