import { View, Text } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface OnboardingHeaderProps {
  step: number;
  total: number;
  title: string;
  subtitle: string;
}

export function OnboardingHeader({ step, total, title, subtitle }: OnboardingHeaderProps) {
  const progress = useSharedValue(step / total);

  useEffect(() => {
    progress.value = withTiming(step / total, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [step, total]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    height: '100%',
    backgroundColor: '#E91E8C',
    borderRadius: 999,
  }));

  return (
    <View className="mb-8">
      <View className="flex-row items-center gap-3 mb-6">
        <View className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <Animated.View style={barStyle} />
        </View>
        <Text
          className="text-text-muted text-xs"
          accessibilityLabel={`Passo ${step} de ${total}`}
        >
          {step}/{total}
        </Text>
      </View>

      <Text className="text-text-primary text-2xl font-bold" accessibilityRole="header">
        {title}
      </Text>
      <Text className="text-text-muted text-base mt-2">{subtitle}</Text>
    </View>
  );
}
